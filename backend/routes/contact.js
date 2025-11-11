const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { requireAuth } = require('../middleware/auth');

// Get contact information (public)
router.get('/', contactController.getContactInfo);

// Submit contact form (public)
router.post('/submit', contactController.submitContactForm);

// Update contact information (admin only)
router.put('/', requireAuth, contactController.updateContactInfo);

module.exports = router;
