const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../config/database');
const { r2Helpers } = require('../config/storage');

class Service {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.title = data.title;
    this.subtitle = data.subtitle;
    this.description = data.description;
    this.price = data.price;
    this.duration = data.duration;
    this.included = data.included ? (typeof data.included === 'string' ? JSON.parse(data.included) : data.included) : [];
    this.excluded = data.excluded ? (typeof data.excluded === 'string' ? JSON.parse(data.excluded) : data.excluded) : [];
    this.category_id = data.category_id;
    this.service_type = data.service_type;
    this.image = data.image || (data.images && Array.isArray(data.images) ? data.images[0] : null);
    this.gallery = data.gallery ? (typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery) : [];
    this.status = data.status || 'active';

    // Vietnamese language fields
    this.title_vi = data.title_vi;
    this.subtitle_vi = data.subtitle_vi;
    this.description_vi = data.description_vi;
    this.duration_vi = data.duration_vi;
    this.included_vi = data.included_vi ? (typeof data.included_vi === 'string' ? JSON.parse(data.included_vi) : data.included_vi) : [];
    this.excluded_vi = data.excluded_vi ? (typeof data.excluded_vi === 'string' ? JSON.parse(data.excluded_vi) : data.excluded_vi) : [];

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
      price: this.price,
      duration: this.duration,
      included: JSON.stringify(this.included),
      excluded: JSON.stringify(this.excluded),
      category_id: this.category_id,
      service_type: this.service_type,
      image: this.image,
      gallery: JSON.stringify(this.gallery),
      status: this.status,
      // Vietnamese fields
      title_vi: this.title_vi,
      subtitle_vi: this.subtitle_vi,
      description_vi: this.description_vi,
      duration_vi: this.duration_vi,
      included_vi: JSON.stringify(this.included_vi),
      excluded_vi: JSON.stringify(this.excluded_vi)
    };
    
    return await dbHelpers.insert(db, 'services', serviceData);
  }

  // Update service image using R2 (single image)
  async updateImage(r2Bucket, newImageFile, oldImage = null) {
    try {
      // Delete old image from R2 if it exists
      if (oldImage) {
        await r2Helpers.deleteImage(r2Bucket, oldImage);
      }

      // Upload new image to R2
      let uploadedImageUrl = null;
      if (newImageFile) {
        r2Helpers.validateImage(newImageFile);
        uploadedImageUrl = await r2Helpers.uploadImage(r2Bucket, newImageFile, `services/${this.id}`);
      }

      this.image = uploadedImageUrl;
      return uploadedImageUrl;
    } catch (error) {
      console.error('Error updating service image:', error);
      throw error;
    }
  }

  // Update service gallery using R2
  async updateGallery(r2Bucket, newImageFiles, oldGallery = []) {
    try {
      // Upload new images to R2
      const uploadedImageUrls = [...oldGallery]; // Keep existing gallery images

      if (newImageFiles && newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          r2Helpers.validateImage(file);
          const imageUrl = await r2Helpers.uploadImage(r2Bucket, file, `services/${this.id}/gallery`);
          uploadedImageUrls.push(imageUrl);
        }
      }

      // Limit to 10 images total
      const finalImages = uploadedImageUrls.slice(0, 10);
      this.gallery = finalImages;
      return finalImages;
    } catch (error) {
      console.error('Error updating service gallery:', error);
      throw error;
    }
  }

  // Remove specific gallery photo
  async removeGalleryPhoto(r2Bucket, photoUrl) {
    try {
      // Delete the image from R2
      await r2Helpers.deleteImage(r2Bucket, photoUrl);

      // Remove from gallery array
      const updatedGallery = this.gallery.filter(img => img !== photoUrl);
      this.gallery = updatedGallery;

      // Update database
      const db = require('../config/database').getDB();
      await db.prepare('UPDATE services SET gallery = ?, updated_at = datetime("now") WHERE id = ?')
        .bind(JSON.stringify(updatedGallery), this.id).run();

      return updatedGallery;
    } catch (error) {
      console.error('Error removing gallery photo:', error);
      throw error;
    }
  }

  // Update service in database
  async update(db) {
    const serviceData = {
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      // Remove itinerary from update operation
      price: this.price,
      duration: this.duration,
      included: JSON.stringify(this.included),
      excluded: JSON.stringify(this.excluded),
      category_id: this.category_id,
      service_type: this.service_type,
      image: this.image, // Changed from images to image
      gallery: JSON.stringify(this.gallery),
      status: this.status,
      // Vietnamese fields
      title_vi: this.title_vi,
      subtitle_vi: this.subtitle_vi,
      description_vi: this.description_vi,
      duration_vi: this.duration_vi,
      included_vi: JSON.stringify(this.included_vi),
      excluded_vi: JSON.stringify(this.excluded_vi)
    };

    console.log('🔧 Service.update() - serviceData being prepared:', {
      id: this.id,
      image: serviceData.image,
      title: serviceData.title
    });

    const fields = Object.keys(serviceData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(serviceData);
    const sql = `UPDATE services SET ${fields}, updated_at = datetime('now') WHERE id = ?`;

    console.log('🔧 Service.update() - SQL query:', sql);
    console.log('🔧 Service.update() - Values:', [...values, this.id]);

    const result = await db.prepare(sql).bind(...values, this.id).run();
    console.log('🔧 Service.update() - Database result:', result);

    return result;
  }

  // Find service by ID
  static async findById(db, id) {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
    return service ? new Service(service) : null;
  }

  // Get all services with filtering
  static async findAll(db, options = {}) {
    const { limit = 20, offset = 0, category, status = 'active', search } = options;
    
    let sql = 'SELECT * FROM services WHERE status = ?';
    const params = [status];
    
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (title LIKE ? OR subtitle LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await db.prepare(sql).bind(...params).all();
    const services = result.results || [];

    // Get total count for pagination
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const countResult = await db.prepare(countSql).bind(...params.slice(0, -2)).first();
    const total = countResult?.total || 0;

    return {
      data: services.map(service => new Service(service)),
      total,
      hasMore: offset + limit < total
    };
  }

  // Search services
  static async search(db, searchTerm, options = {}) {
    const { limit = 20, offset = 0, category } = options;

    let sql = `
      SELECT * FROM services 
      WHERE status = 'active' AND (
        title LIKE ? OR 
        subtitle LIKE ? OR 
        description LIKE ?
      )
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.prepare(sql).bind(...params).all();
    const services = result.results || [];

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const countResult = await db.prepare(countSql).bind(...params.slice(0, -2)).first();
    const total = countResult?.total || 0;

    return {
      data: services.map(service => new Service(service)),
      total,
      hasMore: offset + limit < total
    };
  }

  // Delete service
  async delete(r2Bucket) {
    const db = require('../config/database').getDB();

    // Delete main image from R2 if it exists
    if (this.image) {
      await r2Helpers.deleteImage(r2Bucket, this.image);
    }

    // Delete gallery images from R2 if they exist
    if (this.gallery && this.gallery.length > 0) {
      for (const imageUrl of this.gallery) {
        await r2Helpers.deleteImage(r2Bucket, imageUrl);
      }
    }

    return await db.prepare('DELETE FROM services WHERE id = ?').bind(this.id).run();
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      // Remove itinerary reference since it doesn't exist
      price: this.price,
      duration: this.duration,
      included: typeof this.included === 'string' ? JSON.parse(this.included) : this.included,
      excluded: typeof this.excluded === 'string' ? JSON.parse(this.excluded) : this.excluded,
      category_id: this.category_id,
      service_type: this.service_type,
      image: this.image,
      gallery: typeof this.gallery === 'string' ? JSON.parse(this.gallery) : this.gallery,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Get localized content based on language
  getLocalizedContent(language = 'en') {
    if (language === 'vi') {
      return {
        title: this.title_vi || this.title,
        subtitle: this.subtitle_vi || this.subtitle,
        description: this.description_vi || this.description,
        duration: this.duration_vi || this.duration,
        included: this.included_vi && this.included_vi.length > 0 ? this.included_vi : this.included,
        excluded: this.excluded_vi && this.excluded_vi.length > 0 ? this.excluded_vi : this.excluded
      };
    }
    return {
      title: this.title,
      subtitle: this.subtitle,
      description: this.description,
      duration: this.duration,
      included: this.included,
      excluded: this.excluded
    };
  }
}

module.exports = Service;
