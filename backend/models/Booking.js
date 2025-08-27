const { getDB } = require('../config/database');

class Booking {
  constructor(data) {
    this.id = data.id;
    this.type = data.type; // 'tour' or 'service'
    this.item_id = data.item_id;
    
    // Customer information (no user account needed)
    this.customer_name = data.customer_name;
    this.customer_email = data.customer_email;
    this.customer_phone = data.customer_phone;
    
    // Booking details
    this.start_date = data.start_date;
    this.total_travelers = data.total_travelers;
    this.special_requests = data.special_requests;
    
    // Pricing
    this.total_amount = data.total_amount;
    this.currency = data.currency || 'USD';
    
    // Status and tracking
    this.status = data.status || 'pending';
    this.contacted_at = data.contacted_at;
    this.confirmed_at = data.confirmed_at;
    
    // Timestamps
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Save booking to database
  async save() {
    const db = getDB();
    const sql = `
      INSERT INTO bookings (
        type, item_id, customer_name, customer_email, customer_phone,
        start_date, total_travelers, special_requests, total_amount, currency,
        status, contacted_at, confirmed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.type, this.item_id, this.customer_name, this.customer_email, this.customer_phone,
      this.start_date, this.total_travelers, this.special_requests, this.total_amount, this.currency,
      this.status, this.contacted_at, this.confirmed_at, this.created_at, this.updated_at
    ];

    const result = await db.prepare(sql).bind(...params).run();
    if (result && result.meta && result.meta.last_row_id) {
      this.id = result.meta.last_row_id;
    }
    return result;
  }

  // Find booking by ID
  static async findById(id) {
    const db = getDB();
    const booking = await db.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
    return booking ? new Booking(booking) : null;
  }

  // Find bookings by customer email
  static async findByCustomerEmail(email) {
    const db = getDB();
    const result = await db.prepare(
      'SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC'
    ).bind(email).all();
    return result.results.map(booking => new Booking(booking));
  }

  // Get all bookings with filters
  static async findAll(options = {}) {
    const { limit = 50, offset = 0, status, type } = options;
    const db = getDB();

    let sql = 'SELECT * FROM bookings';
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
    return result.results.map(booking => new Booking(booking));
  }

  // Update booking status
  async updateStatus(status) {
    const db = getDB();
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'contacted') {
      updateData.contacted_at = new Date().toISOString();
    } else if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    this.status = status;
    this.updated_at = updateData.updated_at;
    if (updateData.contacted_at) this.contacted_at = updateData.contacted_at;
    if (updateData.confirmed_at) this.confirmed_at = updateData.confirmed_at;

    const sql = `UPDATE bookings SET status = ?, updated_at = ?${
      updateData.contacted_at ? ', contacted_at = ?' : ''
    }${
      updateData.confirmed_at ? ', confirmed_at = ?' : ''
    } WHERE id = ?`;

    const params = [status, updateData.updated_at];
    if (updateData.contacted_at) params.push(updateData.contacted_at);
    if (updateData.confirmed_at) params.push(updateData.confirmed_at);
    params.push(this.id);

    return await db.prepare(sql).bind(...params).run();
  }

  // Update booking
  async update(updateData) {
    const db = getDB();
    updateData.updated_at = new Date().toISOString();

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    const sql = `UPDATE bookings SET ${fields} WHERE id = ?`;

    return await db.prepare(sql).bind(...values, this.id).run();
  }

  // Delete booking
  async delete() {
    const db = getDB();
    return await db.prepare('DELETE FROM bookings WHERE id = ?').bind(this.id).run();
  }

  // Get booking statistics (admin only)
  static async getStats() {
    const db = getDB();

    const totalResult = await db.prepare('SELECT COUNT(*) as count FROM bookings').bind().first();
    const statusResult = await db.prepare('SELECT status, COUNT(*) as count FROM bookings GROUP BY status').bind().all();
    const typeResult = await db.prepare('SELECT type, COUNT(*) as count FROM bookings GROUP BY type').bind().all();
    const revenueResult = await db.prepare('SELECT SUM(total_amount) as total FROM bookings WHERE status IN (?, ?)').bind('confirmed', 'completed').first();

    return {
      total: totalResult?.count || 0,
      byStatus: statusResult.results || [],
      byType: typeResult.results || [],
      totalRevenue: revenueResult?.total || 0
    };
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      item_id: this.item_id,
      customer_name: this.customer_name,
      customer_email: this.customer_email,
      customer_phone: this.customer_phone,
      start_date: this.start_date,
      total_travelers: this.total_travelers,
      special_requests: this.special_requests,
      total_amount: this.total_amount,
      currency: this.currency,
      status: this.status,
      contacted_at: this.contacted_at,
      confirmed_at: this.confirmed_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Booking;
