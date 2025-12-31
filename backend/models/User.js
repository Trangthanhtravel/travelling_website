const bcrypt = require('bcryptjs');
const { getDB } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id; // Use database auto-increment ID
    this.name = data.name;
    this.email = data.email?.toLowerCase();
    this.password = data.password;
    this.phone = data.phone;
    this.role = data.role || 'admin'; // Always 'admin' in database
    this.is_super_admin = Number(data.is_super_admin) || 0; // Convert to number, 1 = super_admin, 0 = regular admin
    this.created_by = data.created_by; // ID of super_admin who created this user
    this.is_active = data.is_active !== undefined ? Number(data.is_active) : 1;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Save admin user to database
  async save() {
    await this.hashPassword();
    const db = getDB();
    const sql = `
      INSERT INTO users (name, email, password, phone, role, is_super_admin, created_by, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.name, this.email, this.password,
      this.phone, this.role, this.is_super_admin, this.created_by, this.is_active,
      this.created_at, this.updated_at
    ];

    const result = await db.prepare(sql).bind(...params).run();
    this.id = result.meta.last_row_id; // Set the auto-generated ID
    return result;
  }

  // Find user by email (admin role, check is_super_admin flag)
  static async findByEmail(email) {
    try {
      console.log('🔍 Database query - Finding user by email:', email.toLowerCase());
      const db = getDB();
      const user = await db.prepare('SELECT * FROM users WHERE email = ? AND role = ? AND is_active = 1')
        .bind(email.toLowerCase(), 'admin')
        .first();
      console.log('🔍 Database result:', {
        found: !!user,
        userEmail: user?.email,
        userRole: user?.role,
        isSuperAdmin: user?.is_super_admin === 1,
        userId: user?.id,
        passwordHashExists: !!user?.password,
        passwordHashLength: user?.password?.length
      });
      return user ? new User(user) : null;
    } catch (error) {
      console.error('❌ Database error in findByEmail:', error);
      return null;
    }
  }

  // Find user by ID (admin role, check is_super_admin flag)
  static async findById(id) {
    const db = getDB();
    const user = await db.prepare('SELECT * FROM users WHERE id = ? AND role = ? AND is_active = 1')
      .bind(id, 'admin')
      .first();
    return user ? new User(user) : null;
  }

  // Get all admin users
  static async findAll(options = {}) {
    const { limit = 50, offset = 0 } = options;
    const db = getDB();
    const sql = 'SELECT * FROM users WHERE role = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const result = await db.prepare(sql).bind('admin', limit, offset).all();
    return result.results.map(user => new User(user));
  }

  // Delete admin user (soft delete by setting is_active to 0)
  static async delete(id) {
    const db = getDB();
    const sql = 'UPDATE users SET is_active = 0, updated_at = ? WHERE id = ?';
    return await db.prepare(sql).bind(new Date().toISOString(), id).run();
  }

  // Update admin user
  async update(updateData) {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    updateData.updated_at = new Date().toISOString();

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    const sql = `UPDATE users SET ${fields} WHERE id = ?`;

    const db = getDB();
    return await db.prepare(sql).bind(...values, this.id).run();
  }

  // Convert to JSON (without password)
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Create password reset token
  static async createPasswordResetToken(userId) {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    const db = getDB();
    const sql = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `;

    await db.prepare(sql).bind(userId, token, expiresAt, new Date().toISOString()).run();
    return token;
  }

  // Verify password reset token
  static async verifyPasswordResetToken(token) {
    const db = getDB();
    const sql = `
      SELECT * FROM password_reset_tokens 
      WHERE token = ? AND used = 0 AND expires_at > ?
    `;

    const resetToken = await db.prepare(sql).bind(token, new Date().toISOString()).first();
    return resetToken;
  }

  // Mark password reset token as used
  static async markTokenAsUsed(token) {
    const db = getDB();
    const sql = 'UPDATE password_reset_tokens SET used = 1 WHERE token = ?';
    return await db.prepare(sql).bind(token).run();
  }

  // Change password (for authenticated users)
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const db = getDB();
    const sql = 'UPDATE users SET password = ?, updated_at = ? WHERE id = ?';

    return await db.prepare(sql).bind(hashedPassword, new Date().toISOString(), userId).run();
  }

  // Reset password using token (for forgot password)
  static async resetPassword(token, newPassword) {
    const resetToken = await User.verifyPasswordResetToken(token);
    if (!resetToken) {
      throw new Error('Invalid or expired password reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const db = getDB();

    // Update password
    const sql = 'UPDATE users SET password = ?, updated_at = ? WHERE id = ?';
    await db.prepare(sql).bind(hashedPassword, new Date().toISOString(), resetToken.user_id).run();

    // Mark token as used
    await User.markTokenAsUsed(token);

    return true;
  }
}

module.exports = User;
