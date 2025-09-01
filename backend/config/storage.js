const { v4: uuidv4 } = require('uuid');

// R2 Storage helper functions for Cloudflare R2
const r2Helpers = {
  // Upload image to R2
  async uploadImage(r2Bucket, file, folder = 'tours') {
    try {
      // Validate file first
      this.validateImage(file);

      const fileExtension = file.originalname?.split('.').pop() || 'jpg';
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
      
      // Convert file buffer to proper format for R2
      const fileBuffer = file.buffer;

      await r2Bucket.put(fileName, fileBuffer, {
        httpMetadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000', // 1 year
        },
      });
      
      // Return the public URL - construct proper R2 public URL
      let publicUrl;
      if (process.env.R2_PUBLIC_DOMAIN) {
        // Use custom domain if configured
        publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
      } else if (process.env.R2_BUCKET_NAME && process.env.CLOUDFLARE_ACCOUNT_ID) {
        // Use default R2 public URL format
        publicUrl = `https://${process.env.R2_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;
      } else {
        console.error('R2 configuration incomplete. Missing R2_PUBLIC_DOMAIN or R2_BUCKET_NAME/CLOUDFLARE_ACCOUNT_ID');
        throw new Error('R2 storage not properly configured');
      }

      console.log('Generated image URL:', publicUrl);
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

module.exports = { r2Helpers };
