const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

// Initialize R2 bucket connection
let r2Bucket = null;

// Initialize R2 bucket
const initR2 = () => {
  try {
    if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
      console.warn('R2 configuration incomplete');
      return null;
    }

    const { S3Client } = require('@aws-sdk/client-s3');

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    // Create R2 bucket interface
    r2Bucket = {
      put: async (key, body, options = {}) => {
        const { PutObjectCommand } = require('@aws-sdk/client-s3');
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: options.httpMetadata?.contentType,
          CacheControl: options.httpMetadata?.cacheControl,
        });
        return await s3Client.send(command);
      },
      delete: async (key) => {
        const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
        const command = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        });
        return await s3Client.send(command);
      },
      head: async (key) => {
        const { HeadObjectCommand } = require('@aws-sdk/client-s3');
        const command = new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        });
        return await s3Client.send(command);
      }
    };

    console.log('R2 bucket initialized successfully');
    return r2Bucket;
  } catch (error) {
    console.error('Failed to initialize R2:', error);
    return null;
  }
};

// Get R2 bucket instance
const getR2Bucket = () => {
  if (!r2Bucket) {
    r2Bucket = initR2();
  }
  return r2Bucket;
};

// R2 Storage helper functions for Cloudflare R2
const r2Helpers = {
  // Upload image to R2
  async uploadImage(r2Bucket, file, folder = 'tours') {
    try {
      // Validate file first
      this.validateImage(file);

      // Generate unique filename with .webp extension
      const fileName = `${folder}/${uuidv4()}.webp`;

      // Convert image to WebP format with optimization
      const processedBuffer = await sharp(file.buffer)
        .webp({
          quality: 85,           // High quality WebP
          effort: 6,             // Compression effort (0-6, higher = better compression but slower)
          smartSubsample: true   // Better quality at low bitrates
        })
        .resize(2000, 2000, {   // Max dimensions while maintaining aspect ratio
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer();

      await r2Bucket.put(fileName, processedBuffer, {
        httpMetadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000', // 1 year
        },
      });
      
      // Return the public URL - construct proper R2 public URL
      let publicUrl;

      // Clean up environment variables to remove any protocol prefixes
      const cleanPublicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/^https?:\/\//, '');
      const cleanBucketName = process.env.R2_BUCKET_NAME?.replace(/^https?:\/\//, '');
      const cleanAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.replace(/^https?:\/\//, '');

      if (cleanPublicDomain) {
        // Use custom domain if configured
        publicUrl = `https://${cleanPublicDomain}/${fileName}`;
      } else if (cleanBucketName && cleanAccountId) {
        // Use default R2 public URL format (safer for now)
        publicUrl = `https://${cleanBucketName}.${cleanAccountId}.r2.cloudflarestorage.com/${fileName}`;
      } else {
        console.error('R2 configuration incomplete. Available vars:', {
          R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
          R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
          CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID
        });
        throw new Error('R2 storage not properly configured');
      }

      console.log('Generated image URL:', publicUrl);

      // Validate the URL format before returning
      if (publicUrl.startsWith('https://https://') || publicUrl.includes('//https://')) {
        console.error('Malformed URL detected:', publicUrl);
        throw new Error('Invalid URL format generated');
      }

      return publicUrl;
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  },

  // Delete image from R2
  async deleteImage(r2Bucket, imageUrl) {
    try {
      if (!imageUrl || !imageUrl.includes('/')) return true;

      // Extract the key from the URL - handle both custom domain and default R2 URLs
      let key;
      if (imageUrl.includes(process.env.R2_PUBLIC_DOMAIN)) {
        // Custom domain format
        const urlParts = imageUrl.split('/');
        key = urlParts.slice(3).join('/'); // Remove https://domain.com part
      } else if (imageUrl.includes('.r2.cloudflarestorage.com')) {
        // Default R2 URL format
        const urlParts = imageUrl.split('/');
        key = urlParts.slice(3).join('/'); // Remove https://bucket.account.r2.cloudflarestorage.com part
      } else {
        // Fallback - assume it's just the key part
        const urlParts = imageUrl.split('/');
        key = urlParts.slice(-2).join('/'); // folder/filename
      }

      console.log('Deleting R2 object with key:', key);
      await r2Bucket.delete(key);
      return true;
    } catch (error) {
      console.error('R2 delete error:', error);
      // Don't throw error for delete failures to prevent blocking other operations
      return false;
    }
  },

  // Upload multiple images
  async uploadMultipleImages(r2Bucket, files, folder = 'tours') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(r2Bucket, file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('R2 multiple upload error:', error);
      throw error;
    }
  },

  // Upload image in multiple sizes for responsive design (optional advanced feature)
  async uploadResponsiveImage(r2Bucket, file, folder = 'tours') {
    try {
      this.validateImage(file);

      const baseFileName = uuidv4();
      const sizes = [
        { width: 400, suffix: 'thumb' },   // Thumbnail
        { width: 800, suffix: 'medium' },  // Medium
        { width: 1200, suffix: 'large' },  // Large
        { width: 2000, suffix: 'original' } // Original (max)
      ];

      const uploadPromises = sizes.map(async ({ width, suffix }) => {
        const fileName = `${folder}/${baseFileName}-${suffix}.webp`;

        const processedBuffer = await sharp(file.buffer)
          .webp({
            quality: 85,
            effort: 6,
            smartSubsample: true
          })
          .resize(width, width, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toBuffer();

        await r2Bucket.put(fileName, processedBuffer, {
          httpMetadata: {
            contentType: 'image/webp',
            cacheControl: 'public, max-age=31536000',
          },
        });

        // Return URL for this size
        const cleanPublicDomain = process.env.R2_PUBLIC_DOMAIN?.replace(/^https?:\/\//, '');
        const cleanBucketName = process.env.R2_BUCKET_NAME?.replace(/^https?:\/\//, '');
        const cleanAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.replace(/^https?:\/\//, '');

        if (cleanPublicDomain) {
          return { [suffix]: `https://${cleanPublicDomain}/${fileName}` };
        } else if (cleanBucketName && cleanAccountId) {
          return { [suffix]: `https://${cleanBucketName}.${cleanAccountId}.r2.cloudflarestorage.com/${fileName}` };
        }
      });

      const urls = await Promise.all(uploadPromises);
      // Merge all size URLs into one object
      return Object.assign({}, ...urls);
    } catch (error) {
      console.error('R2 responsive upload error:', error);
      throw error;
    }
  },

  // Validate image file
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    
    return true;
  },

  // Get file info from R2 (optional utility)
  async getFileInfo(r2Bucket, key) {
    try {
      const object = await r2Bucket.head(key);
      return {
        size: object.size,
        lastModified: object.uploaded,
        contentType: object.httpMetadata?.contentType
      };
    } catch (error) {
      console.error('R2 file info error:', error);
      return null;
    }
  }
};

module.exports = { r2Helpers, getR2Bucket, initR2 };
