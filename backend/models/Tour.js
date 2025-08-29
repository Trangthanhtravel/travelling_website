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
    this.images = data.images ? (typeof data.images === 'string' ? JSON.parse(data.images) : data.images) : [];
    this.gallery = data.gallery ? (typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery) : [];
    this.itinerary = data.itinerary ? (typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary) : {};
    this.included = data.included ? (typeof data.included === 'string' ? JSON.parse(data.included) : data.included) : [];
    this.excluded = data.excluded ? (typeof data.excluded === 'string' ? JSON.parse(data.excluded) : data.excluded) : [];
    this.status = data.status || 'active';
    this.featured = data.featured || false;
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
      images: JSON.stringify(this.images),
      gallery: JSON.stringify(this.gallery),
      itinerary: JSON.stringify(this.itinerary),
      included: JSON.stringify(this.included),
      excluded: JSON.stringify(this.excluded),
      status: this.status,
      featured: this.featured
    };

    const sql = `
      INSERT INTO tours (title, slug, description, price, duration, location, max_participants, category_slug, images, gallery, itinerary, included, excluded, status, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const params = [
      tourData.title, tourData.slug, tourData.description, tourData.price,
      tourData.duration, tourData.location, tourData.max_participants,
      tourData.category_slug, tourData.images, tourData.gallery,
      tourData.itinerary, tourData.included, tourData.excluded,
      tourData.status, tourData.featured
    ];

    const result = await db.prepare(sql).bind(...params).run();
    this.id = result.meta.last_row_id;
    return result;
  }

  // Update tour images using R2
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
          const imageUrl = await r2Helpers.uploadImage(r2Bucket, file, 'tours');
          uploadedImageUrls.push(imageUrl);
        }
      }

      this.images = uploadedImageUrls;
      if (uploadedImageUrls.length > 0) {
        this.image_url = uploadedImageUrls[0]; // Set first image as primary
      }

      return uploadedImageUrls;
    } catch (error) {
      console.error('Error updating tour images:', error);
      throw error;
    }
  }

  // Update tour gallery using R2 (up to 10 photos)
  async updateGallery(r2Bucket, newGalleryFiles, oldGallery = []) {
    try {
      // Delete old gallery images from R2 if they exist
      if (oldGallery.length > 0) {
        for (const imageUrl of oldGallery) {
          await r2Helpers.deleteImage(r2Bucket, imageUrl);
        }
      }

      // Upload new gallery images to R2 (max 10)
      const uploadedGalleryUrls = [];
      if (newGalleryFiles && newGalleryFiles.length > 0) {
        const filesToUpload = newGalleryFiles.slice(0, 10); // Limit to 10 photos
        for (const file of filesToUpload) {
          r2Helpers.validateImage(file);
          const imageUrl = await r2Helpers.uploadImage(r2Bucket, file, 'tours/gallery');
          uploadedGalleryUrls.push(imageUrl);
        }
      }

      this.gallery = uploadedGalleryUrls;
      return uploadedGalleryUrls;
    } catch (error) {
      console.error('Error updating tour gallery:', error);
      throw error;
    }
  }

  // Delete specific gallery photo
  async deleteGalleryPhoto(r2Bucket, photoUrl) {
    try {
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
  async update(updateData) {
    const db = getDB();
    // Handle JSON fields
    if (updateData.images) {
      updateData.images = JSON.stringify(updateData.images);
    }
    if (updateData.itinerary) {
      updateData.itinerary = JSON.stringify(updateData.itinerary);
    }
    if (updateData.included) {
      updateData.included = JSON.stringify(updateData.included);
    }
    if (updateData.excluded) {
      updateData.excluded = JSON.stringify(updateData.excluded);
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    const sql = `UPDATE tours SET ${fields}, updated_at = datetime('now') WHERE id = ?`;

    return await db.prepare(sql).bind(...values, this.id).run();
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
      images: typeof this.images === 'string' ? JSON.parse(this.images) : this.images,
      gallery: typeof this.gallery === 'string' ? JSON.parse(this.gallery) : this.gallery,
      itinerary: typeof this.itinerary === 'string' ? JSON.parse(this.itinerary) : this.itinerary,
      included: typeof this.included === 'string' ? JSON.parse(this.included) : this.included,
      excluded: typeof this.excluded === 'string' ? JSON.parse(this.excluded) : this.excluded
    };
  }
}

module.exports = Tour;
