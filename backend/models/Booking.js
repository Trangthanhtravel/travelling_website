const { dbHelpers } = require('../config/database');

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
  async save(db) {
    const bookingData = {
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

    const result = await dbHelpers.insert(db, 'bookings', bookingData);
    if (result && result.meta && result.meta.last_row_id) {
      this.id = result.meta.last_row_id;
    }
    return result;
  }

  // Find booking by ID
  static async findById(db, id) {
    const bookings = await dbHelpers.query(db, 'SELECT * FROM bookings WHERE id = ?', [id]);
    return bookings.length > 0 ? new Booking(bookings[0]) : null;
  }

  // Find bookings by customer email
  static async findByCustomerEmail(db, email) {
    const bookings = await dbHelpers.query(
      db,
      'SELECT * FROM bookings WHERE customer_email = ? ORDER BY created_at DESC',
      [email]
    );
    return bookings.map(booking => new Booking(booking));
  }

  // Get all bookings with pagination (admin only)
  static async findAll(db, options = {}) {
    const { limit = 50, offset = 0, status, type } = options;

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

    const bookings = await dbHelpers.query(db, sql, params);
    return bookings.map(booking => new Booking(booking));
  }

  // Update booking status
  async updateStatus(db, status) {
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

    return await dbHelpers.update(db, 'bookings', updateData, 'id = ?', [this.id]);
  }

  // Update booking
  async update(db, updateData) {
    updateData.updated_at = new Date().toISOString();
    return await dbHelpers.update(db, 'bookings', updateData, 'id = ?', [this.id]);
  }

  // Delete booking
  async delete(db) {
    return await dbHelpers.delete(db, 'bookings', 'id = ?', [this.id]);
  }

  // Get booking statistics (admin only)
  static async getStats(db) {
    const totalBookings = await dbHelpers.query(db, 'SELECT COUNT(*) as count FROM bookings');
    const bookingsByStatus = await dbHelpers.query(db, 'SELECT status, COUNT(*) as count FROM bookings GROUP BY status');
    const bookingsByType = await dbHelpers.query(db, 'SELECT type, COUNT(*) as count FROM bookings GROUP BY type');
    const totalRevenue = await dbHelpers.query(db, 'SELECT SUM(total_amount) as total FROM bookings WHERE status IN (?, ?)', ['confirmed', 'completed']);

    return {
      total: totalBookings[0]?.count || 0,
      byStatus: bookingsByStatus,
      byType: bookingsByType,
      totalRevenue: totalRevenue[0]?.total || 0
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
