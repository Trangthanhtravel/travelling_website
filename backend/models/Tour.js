const { getDB } = require('../config/database');
const { r2Helpers } = require('../config/storage');

class Tour {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.price = data.price;
    this.duration = data.duration;
    this.location = data.location;
    this.max_participants = data.max_participants;
    this.category_slug = data.category_slug || data.category; // Support both new and old field names
    // Change from images array to single image
    this.image = data.image || (data.images && Array.isArray(data.images) ? data.images[0] : null);
    this.gallery = data.gallery ? (typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery) : [];
    this.itinerary = data.itinerary ? (typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary) : {};
    this.included = data.included ? (typeof data.included === 'string' ? JSON.parse(data.included) : data.included) : [];
    this.excluded = data.excluded ? (typeof data.excluded === 'string' ? JSON.parse(data.excluded) : data.excluded) : [];
    this.status = data.status || 'active';
    this.featured = Boolean(data.featured);
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Generate slug from title
  generateSlug() {
    if (!this.slug && this.title) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }
  }

  // Validate category against database categories
  async validateCategory(db) {
    if (!this.category_slug) return;

    const category = await db.prepare('SELECT id FROM categories WHERE slug = ? AND type = ? AND status = ?')
      .bind(this.category_slug, 'tour', 'active').first();

    if (!category) {
      throw new Error(`Invalid category slug: ${this.category_slug}. Category must exist in database with type 'tour' and status 'active'.`);
    }
  }

  // Save tour to database
  async save(db) {
    this.generateSlug();
    await this.validateCategory(db);

    const tourData = {
      title: this.title,
      slug: this.slug,
      description: this.description,
      price: this.price,
      duration: this.duration,
      location: this.location,
      max_participants: this.max_participants,
      category_slug: this.category_slug,
      image: this.image, // Changed from images to image
      gallery: JSON.stringify(this.gallery),
      itinerary: JSON.stringify(this.itinerary),
      included: JSON.stringify(this.included),
      excluded: JSON.stringify(this.excluded),
      status: this.status,
      featured: this.featured ? 1 : 0  // Convert boolean to 0/1 for SQLite
    };

    const sql = `
      INSERT INTO tours (title, slug, description, price, duration, location, max_participants, category_slug, image, gallery, itinerary, included, excluded, status, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params = [
      tourData.title, tourData.slug, tourData.description, tourData.price,
      tourData.duration, tourData.location, tourData.max_participants,
      tourData.category_slug, tourData.image, tourData.gallery,
      tourData.itinerary, tourData.included, tourData.excluded,
      tourData.status, tourData.featured
    ];

    const result = await db.prepare(sql).bind(...params).run();
    this.id = result.meta.last_row_id;
    return result;
  }

  // Update tour image using R2 (single image)
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
        uploadedImageUrl = await r2Helpers.uploadImage(r2Bucket, newImageFile, 'tours');
      }

      this.image = uploadedImageUrl;
      return uploadedImageUrl;
    } catch (error) {
      console.error('Error updating tour image:', error);
      throw error;
    }
  }

  // Update tour gallery using R2 (up to 10 photos)
  async updateGallery(r2Bucket, newGalleryFiles, oldGallery = []) {
    try {
      // Start with existing gallery photos
      let currentGallery = [...(this.gallery || [])];

      // Upload new gallery images to R2
      const uploadedGalleryUrls = [];
      if (newGalleryFiles && newGalleryFiles.length > 0) {
        // Check total limit
        if (currentGallery.length + newGalleryFiles.length > 10) {
          throw new Error(`Total gallery photos cannot exceed 10. Current: ${currentGallery.length}, Adding: ${newGalleryFiles.length}`);
        }

        for (const file of newGalleryFiles) {
          r2Helpers.validateImage(file);
          const imageUrl = await r2Helpers.uploadImage(r2Bucket, file, 'tours/gallery');
          uploadedGalleryUrls.push(imageUrl);
        }
      }

      // Combine existing and new photos
      const updatedGallery = [...currentGallery, ...uploadedGalleryUrls];
      this.gallery = updatedGallery;
      return updatedGallery;
    } catch (error) {
      console.error('Error updating tour gallery:', error);
      throw error;
    }
  }

  // Delete specific gallery photo
  async deleteGalleryPhoto(r2Bucket, photoUrl) {
    try {
      // Check if photo exists in gallery
      if (!this.gallery || !this.gallery.includes(photoUrl)) {
        throw new Error('Photo not found in gallery');
      }

      // Remove from R2 storage
      await r2Helpers.deleteImage(r2Bucket, photoUrl);

      // Remove from gallery array
      this.gallery = this.gallery.filter(url => url !== photoUrl);

      // Update database
      const db = getDB();
      await db.prepare('UPDATE tours SET gallery = ?, updated_at = datetime("now") WHERE id = ?')
        .bind(JSON.stringify(this.gallery), this.id).run();

      return this.gallery;
    } catch (error) {
      console.error('Error deleting gallery photo:', error);
      throw error;
    }
  }

  // Find tour by ID
  static async findById(db, id) {
    const tour = await db.prepare('SELECT * FROM tours WHERE id = ?').bind(id).first();
    return tour ? new Tour(tour) : null;
  }

  // Get all tours with pagination
  static async findAll(db, options = {}) {
    const { limit = 20, offset = 0, status = 'active', location, category, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'desc' } = options;

    let whereConditions = ['status = ?'];
    const params = [status];

    if (location) {
      whereConditions.push('location LIKE ?');
      params.push(`%${location}%`);
    }

    if (category) {
      whereConditions.push('category_slug = ?');
      params.push(category);
    }

    if (minPrice) {
      whereConditions.push('price >= ?');
      params.push(minPrice);
    }

    if (maxPrice) {
      whereConditions.push('price <= ?');
      params.push(maxPrice);
    }

    const whereClause = whereConditions.join(' AND ');
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM tours WHERE ${whereClause}`;
    const countResult = await db.prepare(countSql).bind(...params).first();
    const total = countResult?.total || 0;

    // Get paginated results
    const sql = `SELECT * FROM tours WHERE ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const result = await db.prepare(sql).bind(...params, limit, offset).all();
    const tours = result.results || [];

    return {
      data: tours.map(tour => new Tour(tour)),
      pagination: {
        total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
        limit
      }
    };
  }

  // Search tours with pagination
  static async search(db, searchTerm, options = {}) {
    const { limit = 20, offset = 0, minPrice, maxPrice, sortBy = 'created_at', sortOrder = 'desc' } = options;

    let whereConditions = [
      "status = 'active'",
      "(title LIKE ? OR description LIKE ? OR location LIKE ?)"
    ];
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

    if (minPrice) {
      whereConditions.push('price >= ?');
      params.push(minPrice);
    }

    if (maxPrice) {
      whereConditions.push('price <= ?');
      params.push(maxPrice);
    }

    const whereClause = whereConditions.join(' AND ');
    const orderClause = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM tours WHERE ${whereClause}`;
    const countResult = await db.prepare(countSql).bind(...params).first();
    const total = countResult?.total || 0;

    // Get paginated results
    const sql = `SELECT * FROM tours WHERE ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const result = await db.prepare(sql).bind(...params, limit, offset).all();
    const tours = result.results || [];

    return {
      data: tours.map(tour => new Tour(tour)),
      pagination: {
        total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
        limit
      }
    };
  }

  // Update tour
  async update(db, updateData) {
    // Create a copy to avoid modifying the original data
    const processedData = { ...updateData };

    // Handle boolean fields properly - convert to 0/1 for SQLite
    if (processedData.featured !== undefined) {
      const boolValue = processedData.featured === true || processedData.featured === 'true' || processedData.featured === 1;
      processedData.featured = boolValue ? 1 : 0;
    }

    // Handle JSON fields
    if (processedData.images && typeof processedData.images !== 'string') {
      processedData.images = JSON.stringify(processedData.images);
    }
    if (processedData.gallery && typeof processedData.gallery !== 'string') {
      processedData.gallery = JSON.stringify(processedData.gallery);
    }
    if (processedData.itinerary && typeof processedData.itinerary !== 'string') {
      processedData.itinerary = JSON.stringify(processedData.itinerary);
    }
    if (processedData.included && typeof processedData.included !== 'string') {
      processedData.included = JSON.stringify(processedData.included);
    }
    if (processedData.excluded && typeof processedData.excluded !== 'string') {
      processedData.excluded = JSON.stringify(processedData.excluded);
    }

    const fields = Object.keys(processedData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(processedData);
    const sql = `UPDATE tours SET ${fields}, updated_at = datetime('now') WHERE id = ?`;

    const result = await db.prepare(sql).bind(...values, this.id).run();

    // Update the instance with new data (convert back to boolean for JavaScript)
    Object.assign(this, updateData);
    if (updateData.featured !== undefined) {
      this.featured = Boolean(updateData.featured === true || updateData.featured === 'true' || updateData.featured === 1);
    }

    // Parse JSON fields back to objects for the instance
    if (this.images && typeof this.images === 'string') {
      this.images = JSON.parse(this.images);
    }
    if (this.gallery && typeof this.gallery === 'string') {
      this.gallery = JSON.parse(this.gallery);
    }

    return result;
  }

  // Delete tour
  async delete(r2Bucket) {
    const db = getDB();
    // Delete images from R2 storage
    if (this.images && this.images.length > 0) {
      for (const imageUrl of this.images) {
        await r2Helpers.deleteImage(r2Bucket, imageUrl);
      }
    }

    return await db.prepare('DELETE FROM tours WHERE id = ?').bind(this.id).run();
  }

  // Get featured tours for homepage
  static async getFeatured(db, limit = 6) {
    if (!db) {
      throw new Error('Database connection required');
    }
    const sql = 'SELECT * FROM tours WHERE status = ? AND featured = ? ORDER BY created_at DESC LIMIT ?';
    const result = await db.prepare(sql).bind('active', 1, limit).all();
    return result.results?.map(tour => new Tour(tour)) || [];
  }

  // Get tour stats
  static async getStats() {
    const db = getDB(); // Get the database connection
    const totalTours = await db.prepare('SELECT COUNT(*) as count FROM tours WHERE status = ?').bind('active').first();
    const featuredTours = await db.prepare('SELECT COUNT(*) as count FROM tours WHERE status = ? AND featured = ?').bind('active', 1).first();
    const toursByLocationResult = await db.prepare('SELECT location, COUNT(*) as count FROM tours WHERE status = ? GROUP BY location').bind('active').all();
    const toursByCategoryResult = await db.prepare('SELECT category, COUNT(*) as count FROM tours WHERE status = ? GROUP BY category').bind('active').all();

    return {
      total: totalTours?.count || 0,
      featured: featuredTours?.count || 0,
      byLocation: toursByLocationResult.results || [],
      byCategory: toursByCategoryResult.results || []
    };
  }

  // Find tour by slug
  static async findBySlug(db, slug) {
    const tour = await db.prepare('SELECT * FROM tours WHERE slug = ?').bind(slug).first();
    return tour ? new Tour(tour) : null;
  }

  // Convert to JSON
  toJSON() {
    return {
      ...this,
      category: this.category_slug, // Map category_slug to category for frontend compatibility
      image: this.image, // Changed from images to image
      gallery: typeof this.gallery === 'string' ? JSON.parse(this.gallery) : this.gallery,
      itinerary: typeof this.itinerary === 'string' ? JSON.parse(this.itinerary) : this.itinerary,
      included: typeof this.included === 'string' ? JSON.parse(this.included) : this.included,
      excluded: typeof this.excluded === 'string' ? JSON.parse(this.excluded) : this.excluded
    };
  }
}

module.exports = Tour;
