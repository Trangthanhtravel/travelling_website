const Contact = require('../models/Contact');

const contactController = {
  // Get contact information
  getContactInfo: async (req, res) => {
    try {
      const contactInfo = await Contact.getContactInfo();
      if (!contactInfo) {
        // Initialize with default data if none exists
        await Contact.initializeDefault();
        const defaultContactInfo = await Contact.getContactInfo();
        return res.json(defaultContactInfo);
      }

      // Parse business hours JSON
      if (contactInfo.business_hours) {
        contactInfo.business_hours = JSON.parse(contactInfo.business_hours);
      }

      res.json(contactInfo);
    } catch (error) {
      console.error('Error fetching contact info:', error);
      res.status(500).json({ error: 'Failed to fetch contact information' });
    }
  },

  // Update contact information (admin only)
  updateContactInfo: async (req, res) => {
    try {
      const { email, phone, address, businessHours, googleMapLink } = req.body;

      // Validate required fields
      if (!email || !phone || !address) {
        return res.status(400).json({ error: 'Email, phone, and address are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const contactData = {
        email,
        phone,
        address,
        businessHours: typeof businessHours === 'object' ? JSON.stringify(businessHours) : businessHours,
        googleMapLink: googleMapLink || ''
      };

      await Contact.updateContactInfo(contactData);

      // Return updated contact info
      const updatedContactInfo = await Contact.getContactInfo();
      if (updatedContactInfo.business_hours) {
        updatedContactInfo.business_hours = JSON.parse(updatedContactInfo.business_hours);
      }

      res.json({
        message: 'Contact information updated successfully',
        contactInfo: updatedContactInfo
      });
    } catch (error) {
      console.error('Error updating contact info:', error);
      res.status(500).json({ error: 'Failed to update contact information' });
    }
  }
};

module.exports = contactController;
