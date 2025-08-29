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
const categoryRoutes = require('./routes/categories');
const socialLinksRoutes = require('./routes/socialLinks');
const emailSettingsRoutes = require('./routes/emailSettings');

const app = express();

// Trust proxy - required for Vercel deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration for multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.phongphan.me',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

      const r2Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });

      // Create a bucket helper object that mimics the expected interface
      req.r2 = {
        put: async (key, data, options = {}) => {
          const { PutObjectCommand } = require('@aws-sdk/client-s3');
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: data,
            ContentType: options.httpMetadata?.contentType,
            CacheControl: options.httpMetadata?.cacheControl,
          });
          return await r2Client.send(command);
        },
        delete: async (key) => {
          const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
          const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          });
          return await r2Client.send(command);
        },
        head: async (key) => {
          const { HeadObjectCommand } = require('@aws-sdk/client-s3');
          const command = new HeadObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
          });
          return await r2Client.send(command);
        }
      };
    } else {
      console.warn('R2 environment variables not configured. File uploads will not work.');
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
app.use('/api/categories', categoryRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/api/email-settings', emailSettingsRoutes);

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
