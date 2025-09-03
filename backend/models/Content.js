const { v4: uuidv4 } = require('uuid');
const { dbHelpers } = require('../config/database');
const { r2Helpers } = require('../config/storage');

class Content {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.key = data.key;
    this.title = data.title;
    this.content = data.content;
    this.type = data.type;
    this.language = data.language || 'en';
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Save content to database
  async save(db) {
    const contentData = {
      id: this.id,
      key: this.key,
      title: this.title,
      content: this.content,
      type: this.type,
      language: this.language || 'en',
      status: this.status || 'active'
    };
    
    const fields = Object.keys(contentData).join(', ');
    const placeholders = Object.keys(contentData).map(() => '?').join(', ');
    const values = Object.values(contentData);

    const sql = `INSERT INTO content (${fields}, created_at, updated_at) VALUES (${placeholders}, datetime('now'), datetime('now'))`;
    return await db.prepare(sql).bind(...values).run();
  }

  // Update content image using R2
  async updateImage(r2Bucket, newImageFile, oldImageUrl = null) {
    try {
      // Delete old image from R2 if it exists
      if (oldImageUrl) {
        await r2Helpers.deleteImage(r2Bucket, oldImageUrl);
      }

      // Upload new image to R2
      if (newImageFile) {
        r2Helpers.validateImage(newImageFile);
        const imageUrl = await r2Helpers.uploadImage(r2Bucket, newImageFile, 'content');
        this.image_url = imageUrl;
        return imageUrl;
      }

      return null;
    } catch (error) {
      console.error('Error updating content image:', error);
      throw error;
    }
  }

  // Find content by ID
  static async findById(db, id) {
    const result = await db.prepare('SELECT * FROM content WHERE id = ?').bind(id).first();
    return result ? new Content(result) : null;
  }

  // Find content by type
  static async findByType(db, type, status = 'active') {
    const result = await db.prepare('SELECT * FROM content WHERE type = ? AND status = ? ORDER BY created_at DESC').bind(type, status).all();
    const content = result.results || [];
    return content.map(item => new Content(item));
  }

  // Get all content with pagination
  static async findAll(db, options = {}) {
    const { limit = 20, offset = 0, status, type } = options;
    
    let sql = 'SELECT * FROM content';
    const params = [];
    const conditions = [];
    
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await db.prepare(sql).bind(...params).all();
    const content = result.results || [];
    return content.map(item => new Content(item));
  }

  // Update content
  async update(db, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    const sql = `UPDATE content SET ${fields}, updated_at = datetime('now') WHERE id = ?`;
    return await db.prepare(sql).bind(...values, this.id).run();
  }

  // Delete content
  async delete(db, r2Bucket) {
    // Delete image from R2 storage if it exists
    if (this.image_url) {
      await r2Helpers.deleteImage(r2Bucket, this.image_url);
    }
    
    return await db.prepare('DELETE FROM content WHERE id = ?').bind(this.id).run();
  }
}

module.exports = Content;
