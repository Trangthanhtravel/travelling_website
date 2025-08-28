const express = require('express');
const router = express.Router();
const SocialLinksController = require('../controllers/socialLinksController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/public', SocialLinksController.getAllSocialLinks);

// Admin routes (protected)
router.get('/', adminAuth, SocialLinksController.getAdminSocialLinks);
router.post('/', adminAuth, SocialLinksController.createSocialLink);
router.put('/:id', adminAuth, SocialLinksController.updateSocialLink);
router.delete('/:id', adminAuth, SocialLinksController.deleteSocialLink);

module.exports = router;
