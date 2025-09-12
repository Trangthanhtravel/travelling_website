const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

// Get contact information (public)
router.get('/', contactController.getContactInfo);

// Update contact information (admin only)
router.put('/', auth, contactController.updateContactInfo);

module.exports = router;
