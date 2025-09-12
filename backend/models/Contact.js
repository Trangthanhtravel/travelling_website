const db = require('../config/database');

class Contact {
  static async getContactInfo() {
    try {
      const stmt = db.prepare(`
        SELECT * FROM contact_info ORDER BY id DESC LIMIT 1
      `);
      return stmt.get();
    } catch (error) {
      console.error('Error getting contact info:', error);
      throw error;
    }
  }

  static async updateContactInfo(contactData) {
    try {
      const { email, phone, address, businessHours, googleMapLink } = contactData;

      // Check if contact info exists
      const existing = await this.getContactInfo();

      if (existing) {
        // Update existing record
        const stmt = db.prepare(`
          UPDATE contact_info 
          SET email = ?, phone = ?, address = ?, business_hours = ?, google_map_link = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        return stmt.run(email, phone, address, businessHours, googleMapLink, existing.id);
      } else {
        // Create new record
        const stmt = db.prepare(`
          INSERT INTO contact_info (email, phone, address, business_hours, google_map_link, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        return stmt.run(email, phone, address, businessHours, googleMapLink);
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }

  static async initializeDefault() {
    try {
      const existing = await this.getContactInfo();
      if (!existing) {
        const defaultData = {
          email: 'info@travelworld.vn',
          phone: '+84 123 456 789',
          address: '123 Đường Du Lịch, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
          businessHours: JSON.stringify({
            monday: '8:00 - 18:00',
            tuesday: '8:00 - 18:00',
            wednesday: '8:00 - 18:00',
            thursday: '8:00 - 18:00',
            friday: '8:00 - 18:00',
            saturday: '8:00 - 17:00',
            sunday: 'Closed'
          }),
          googleMapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326!2d106.6297!3d10.8231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzIzLjIiTiAxMDbCsDM3JzQ2LjkiRQ!5e0!3m2!1sen!2s!4v1609459200000!5m2!1sen!2s'
        };
        await this.updateContactInfo(defaultData);
      }
    } catch (error) {
      console.error('Error initializing default contact info:', error);
      throw error;
    }
  }
}

module.exports = Contact;
