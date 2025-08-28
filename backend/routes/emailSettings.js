const express = require('express');
const router = express.Router();
const emailSettingsController = require('../controllers/emailSettingsController');
const auth = require('../middleware/auth');

// All routes require admin authentication
router.use(auth);

// Get email settings
router.get('/', emailSettingsController.getEmailSettings);

// Update email settings
router.put('/', emailSettingsController.updateEmailSettings);

// Test email configuration
router.post('/test', emailSettingsController.testEmailConfiguration);

// Get email statistics
router.get('/stats', emailSettingsController.getEmailStats);

module.exports = router;
