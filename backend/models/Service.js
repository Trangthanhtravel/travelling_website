const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../config/database');
const { r2Helpers } = require('../config/storage');

class Service {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;
    this.itinerary = data.itinerary ? (typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary) : [];
    this.price = data.price;
    this.duration = data.duration;
    this.included = data.included ? (typeof data.included === 'string' ? JSON.parse(data.included) : data.included) : [];
    this.excluded = data.excluded ? (typeof data.excluded === 'string' ? JSON.parse(data.excluded) : data.excluded) : [];
    this.category = data.category; // 'domestic', 'international', 'car-rental', 'other-services'
    this.images = data.images ? (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : [];
    this.videos = data.videos ? (typeof data.videos === 'string' ? JSON.parse(data.videos) : data.videos) : [];
    this.featured = data.featured || false;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Save service to database
  async save(db) {
    const serviceData = {
      id: this.id,
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      itinerary: JSON.stringify(this.itinerary),
      price: this.price,
      duration: this.duration,
      included: JSON.stringify(this.included),
      excluded: JSON.stringify(this.excluded),
      category: this.category,
      images: JSON.stringify(this.images),
      videos: JSON.stringify(this.videos),
      featured: this.featured ? 1 : 0,
      status: this.status
    };
    
    return await dbHelpers.insert(db, 'services', serviceData);
  }

  // Update service images using R2
  async updateImages(r2Bucket, newImageFiles, oldImages = []) {
    try {
      // Delete old images from R2 if they exist
      if (oldImages.length > 0) {
        for (const imageUrl of oldImages) {
          await r2Helpers.deleteImage(r2Bucket, imageUrl);
        }
      }

      // Upload new images to R2
      const uploadedImageUrls = [];
      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          r2Helpers.validateImage(file);
          const imageUrl = await r2Helpers.uploadImage(r2Bucket, file, `services/${this.category}`);
          uploadedImageUrls.push(imageUrl);
        }
      }

      this.images = uploadedImageUrls;
      return uploadedImageUrls;
    } catch (error) {
      console.error('Error updating service images:', error);
      throw error;
    }
  }

  // Find service by ID
  static async findById(db, id) {
    const services = await dbHelpers.query(db, 'SELECT * FROM services WHERE id = ?', [id]);
    return services.length > 0 ? new Service(services[0]) : null;
  }

  // Get all services with filtering
  static async findAll(db, options = {}) {
    const { limit = 20, offset = 0, category, featured, status = 'active', search } = options;
    
    let sql = 'SELECT * FROM services WHERE status = ?';
    const params = [status];
    
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (featured !== undefined) {
      sql += ' AND featured = ?';
      params.push(featured ? 1 : 0);
    }
    
    if (search) {
      sql += ' AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const services = await dbHelpers.query(db, sql, params);
    return services.map(service => new Service(service));
  }

  // Get services by category
  static async findByCategory(db, category) {
    const services = await dbHelpers.query(
      db, 
      'SELECT * FROM services WHERE category = ? AND status = ? ORDER BY featured DESC, created_at DESC', 
      [category, 'active']
    );
    return services.map(service => new Service(service));
  }

  // Get featured services
  static async getFeatured(db, limit = 6) {
    const services = await dbHelpers.query(
      db, 
      'SELECT * FROM services WHERE featured = 1 AND status = ? ORDER BY created_at DESC LIMIT ?', 
      ['active', limit]
    );
    return services.map(service => new Service(service));
  }

  // Search services
  static async search(db, searchTerm) {
    const sql = `
      SELECT * FROM services 
      WHERE status = 'active' 
      AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)
      ORDER BY featured DESC, created_at DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    const services = await dbHelpers.query(db, sql, [searchPattern, searchPattern, searchPattern]);
    return services.map(service => new Service(service));
  }

  // Update service in database
  async update(db, updateData) {
    // Handle JSON fields
    if (updateData.images && typeof updateData.images !== 'string') {
      updateData.images = JSON.stringify(updateData.images);
    }
    if (updateData.included && typeof updateData.included !== 'string') {
      updateData.included = JSON.stringify(updateData.included);
    }
    if (updateData.excluded && typeof updateData.excluded !== 'string') {
      updateData.excluded = JSON.stringify(updateData.excluded);
    }
    if (updateData.itinerary && typeof updateData.itinerary !== 'string') {
      updateData.itinerary = JSON.stringify(updateData.itinerary);
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    const sql = `UPDATE services SET ${fields}, updated_at = datetime('now') WHERE id = ?`;

    return await dbHelpers.run(sql, [...values, this.id]);
  }

  // Delete service from database
  async delete(db, r2Bucket) {
    try {
      // Delete images from R2 storage
      if (this.images && this.images.length > 0) {
        for (const imageUrl of this.images) {
          await r2Helpers.deleteImage(r2Bucket, imageUrl);
        }
      }

      // Delete videos from R2 storage if any
      if (this.videos && this.videos.length > 0) {
        for (const videoUrl of this.videos) {
          await r2Helpers.deleteImage(r2Bucket, videoUrl); // Using same function for videos
        }
      }

      // Delete from database
      return await dbHelpers.query(db, 'DELETE FROM services WHERE id = ?', [this.id]);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Get service stats
  static async getStats(db) {
    try {
      const totalServices = await dbHelpers.query(db, 'SELECT COUNT(*) as count FROM services WHERE status = ?', ['active']);
      const featuredServices = await dbHelpers.query(db, 'SELECT COUNT(*) as count FROM services WHERE status = ? AND featured = ?', ['active', 1]);
      const servicesByCategory = await dbHelpers.query(db, 'SELECT category, COUNT(*) as count FROM services WHERE status = ? GROUP BY category', ['active']);

      return {
        total: totalServices[0]?.count || 0,
        featured: featuredServices[0]?.count || 0,
        byCategory: servicesByCategory || []
      };
    } catch (error) {
      console.error('Error getting service stats:', error);
      throw error;
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      images: typeof this.images === 'string' ? JSON.parse(this.images) : this.images,
      videos: typeof this.videos === 'string' ? JSON.parse(this.videos) : this.videos,
      included: typeof this.included === 'string' ? JSON.parse(this.included) : this.included,
      excluded: typeof this.excluded === 'string' ? JSON.parse(this.excluded) : this.excluded,
      itinerary: typeof this.itinerary === 'string' ? JSON.parse(this.itinerary) : this.itinerary,
      location: typeof this.location === 'string' ? JSON.parse(this.location) : this.location,
      featured: Boolean(this.featured)
    };
  }
}

module.exports = Service;
