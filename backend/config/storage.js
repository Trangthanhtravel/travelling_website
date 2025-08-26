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
      
      // Return the public URL - update this with your actual R2 custom domain
      const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN || 'your-r2-domain.com'}/${fileName}`;
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

      // Extract the key from the URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // folder/filename
      
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
