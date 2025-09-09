const { getDB, generateId } = require('../config/database');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.type = data.type;
    this.icon = data.icon;
    this.color = data.color;
    this.status = data.status || 'active';
    this.sort_order = data.sort_order || 0;
    this.featured = Boolean(data.featured);

    // Vietnamese language fields
    this.name_vi = data.name_vi;
    this.description_vi = data.description_vi;

    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get localized content based on language
  getLocalizedContent(language = 'en') {
    if (language === 'vi') {
      return {
        name: this.name_vi || this.name,
        description: this.description_vi || this.description
      };
    }
    return {
      name: this.name,
      description: this.description
    };
  }

  // Get all categories with filtering
  static async findAll(options = {}) {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    const {
      type,
      status = 'active',
      sortBy = 'sort_order',
      sortOrder = 'asc'
    } = options;

    let query = 'SELECT * FROM categories';
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (type) {
      conditions.push('(type = ? OR type = "both")');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const validSortColumns = ['sort_order', 'name', 'created_at'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    const result = await db.prepare(query).bind(...params).all();
    return result.results?.map(cat => new Category(cat)) || [];
  }

  // Get category by ID
  static async findById(id) {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    const result = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
    return result ? new Category(result) : null;
  }

  // Get category by slug
  static async findBySlug(slug) {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    const result = await db.prepare('SELECT * FROM categories WHERE slug = ?').bind(slug).first();
    return result ? new Category(result) : null;
  }

  // Create new category
  static async create(data) {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    const id = generateId();
    const now = new Date().toISOString();

    const category = new Category({
      id,
      ...data,
      created_at: now,
      updated_at: now
    });

    const result = await db.prepare(`
      INSERT INTO categories (id, name, slug, description, type, icon, color, status, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      category.id,
      category.name,
      category.slug,
      category.description,
      category.type,
      category.icon,
      category.color,
      category.status,
      category.sort_order,
      category.created_at,
      category.updated_at
    ).run();

    if (!result.success) {
      throw new Error('Failed to create category');
    }

    return category;
  }

  // Update category
  async update(data) {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    const now = new Date().toISOString();

    // Update properties
    if (data.name !== undefined) this.name = data.name;
    if (data.slug !== undefined) this.slug = data.slug;
    if (data.description !== undefined) this.description = data.description;
    if (data.type !== undefined) this.type = data.type;
    if (data.icon !== undefined) this.icon = data.icon;
    if (data.color !== undefined) this.color = data.color;
    if (data.status !== undefined) this.status = data.status;
    if (data.sort_order !== undefined) this.sort_order = data.sort_order;
    this.updated_at = now;

    const result = await db.prepare(`
      UPDATE categories 
      SET name = ?, slug = ?, description = ?, type = ?, icon = ?, color = ?, status = ?, sort_order = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      this.name,
      this.slug,
      this.description,
      this.type,
      this.icon,
      this.color,
      this.status,
      this.sort_order,
      this.updated_at,
      this.id
    ).run();

    if (!result.success) {
      throw new Error('Failed to update category');
    }

    return this;
  }

  // Delete category
  async delete() {
    const db = getDB();
    if (!db) throw new Error('Database not available');

    // Check if category is being used
    const tourUsage = await db.prepare('SELECT COUNT(*) as count FROM tours WHERE category_id = ?').bind(this.id).first();
    const serviceUsage = await db.prepare('SELECT COUNT(*) as count FROM services WHERE category_id = ?').bind(this.id).first();

    if (tourUsage?.count > 0 || serviceUsage?.count > 0) {
      throw new Error('Cannot delete category that is being used by tours or services');
    }

    const result = await db.prepare('DELETE FROM categories WHERE id = ?').bind(this.id).run();

    if (!result.success) {
      throw new Error('Failed to delete category');
    }

    return true;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      type: this.type,
      icon: this.icon,
      color: this.color,
      status: this.status,
      sort_order: this.sort_order,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Category;
