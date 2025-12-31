const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { db } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const serviceRoutes = require('./routes/services');
const blogRoutes = require('./routes/blogs');
const bookingRoutes = require('./routes/bookings');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');
const adminManagementRoutes = require('./routes/adminManagement');
const categoryRoutes = require('./routes/categories');
const socialLinksRoutes = require('./routes/socialLinks');
const emailSettingsRoutes = require('./routes/emailSettings');
const contactRoutes = require('./routes/contact');
const activityLogRoutes = require('./routes/activityLogs');

const app = express();

// Trust proxy - required for Vercel deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://trangthanhtravel.com',
  'https://www.trangthanhtravel.com',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Allow any HTTPS origin for production deployment flexibility
    if (origin.startsWith('https://')) {
      // You can add additional domain validation here if needed
      // For now, we'll allow all HTTPS origins to fix the device compatibility issue
      return callback(null, true);
    }

    // Allow localhost with any port for development
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    // Allow 127.0.0.1 with any port for development
    if (origin.match(/^https?:\/\/127\.0\.0\.1(:\d+)?$/)) {
      return callback(null, true);
    }

    // Log blocked origin for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    callback(null, false); // Don't throw error, just deny
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database middleware - attach database connection to request
app.use((req, res, next) => {
  try {
    req.db = db;
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// R2 Storage middleware - initialize R2 bucket for file uploads
app.use((req, res, next) => {
  try {
    // Initialize R2 bucket if environment variables are available
    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      const { S3Client } = require('@aws-sdk/client-s3');
      const https = require('https');

      // Temporarily disable strict SSL checking for development if needed
      if (process.env.NODE_ENV !== 'production') {
        process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
      }

      // Create a custom HTTPS agent that works with Cloudflare R2
      const httpsAgent = new https.Agent({
        keepAlive: true,
        maxSockets: 50,
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        // Use TLS 1.2 which is more compatible with Cloudflare
        secureProtocol: 'TLSv1_2_method',
        servername: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        timeout: 30000
      });

      const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
        // Use path-style addressing for R2 compatibility
        forcePathStyle: true,
        // Add the custom HTTPS agent
        requestHandler: {
          httpsAgent: httpsAgent,
          requestTimeout: 60000,
          connectionTimeout: 30000
        }
      });

      // Create a bucket helper object with error handling
      req.r2 = {
        put: async (key, data, options = {}) => {
          try {
            const { PutObjectCommand } = require('@aws-sdk/client-s3');
            const command = new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
              Body: data,
              ContentType: options.httpMetadata?.contentType || 'application/octet-stream',
              CacheControl: options.httpMetadata?.cacheControl || 'public, max-age=31536000',
            });

            console.log(`Attempting to upload ${key} to R2...`);
            const result = await r2Client.send(command);
            console.log(`Successfully uploaded ${key} to R2`);
            return result;
          } catch (error) {
            console.error(`R2 upload error for ${key}:`, error);
            throw new Error(`Failed to upload ${key}: ${error.message}`);
          }
        },
        delete: async (key) => {
          try {
            const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
            const command = new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
            });

            const result = await r2Client.send(command);
            console.log(`Successfully deleted ${key} from R2`);
            return result;
          } catch (error) {
            console.error(`R2 delete error for ${key}:`, error);
            return null;
          }
        },
        head: async (key) => {
          try {
            const { HeadObjectCommand } = require('@aws-sdk/client-s3');
            const command = new HeadObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
            });

            const result = await r2Client.send(command);
            return result;
          } catch (error) {
            console.error(`R2 head error for ${key}:`, error);
            return null;
          }
        }
      };

      console.log('R2 client initialized successfully');
    } else {
      console.warn('R2 environment variables not configured. Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
      req.r2 = null;
    }
    next();
  } catch (error) {
    console.error('R2 initialization error:', error);
    req.r2 = null;
    next();
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/email-settings', emailSettingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API base URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app;
