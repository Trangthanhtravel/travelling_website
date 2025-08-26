const express = require('express');
const router = express.Router();
const SocialLinksController = require('../controllers/socialLinksController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/public', SocialLinksController.getAllSocialLinks);

// Admin routes (protected)
router.get('/', verifyToken, SocialLinksController.getAdminSocialLinks);
router.post('/', verifyToken, SocialLinksController.createSocialLink);
router.put('/:id', verifyToken, SocialLinksController.updateSocialLink);
router.delete('/:id', verifyToken, SocialLinksController.deleteSocialLink);

module.exports = router;
