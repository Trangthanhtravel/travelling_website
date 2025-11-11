const Contact = require('../models/Contact');
const emailService = require('../services/emailService');

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
  },

  // Submit contact form
  submitContactForm: async (req, res) => {
    try {
      const { name, email, subject, message, language = 'en' } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate message length
      if (message.length < 10) {
        return res.status(400).json({ error: 'Message must be at least 10 characters' });
      }

      const contactData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim()
      };

      console.log('[ContactController] Processing contact form submission:', {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject
      });

      // Get database from request (set by middleware in server.js)
      const db = req.db;

      if (!db) {
        console.error('[ContactController] Database connection not available');
        return res.status(500).json({ error: 'Database connection error' });
      }

      // Send emails
      try {
        // Send notification to admin
        await emailService.sendContactNotificationToAdmin(db, contactData, language);
        console.log('[ContactController] Admin notification sent');

        // Send confirmation to customer
        await emailService.sendContactConfirmationToCustomer(db, contactData, language);
        console.log('[ContactController] Customer confirmation sent');

        res.json({
          success: true,
          message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        });
      } catch (emailError) {
        console.error('[ContactController] Error sending emails:', emailError);
        // Still return success to user, but log the error
        res.json({
          success: true,
          message: 'Your message has been received. We\'ll get back to you soon.'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
  }
};

module.exports = contactController;
