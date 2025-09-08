const express = require('express');
const router = express.Router();
const { requireAuth, adminAuth } = require('../middleware/auth');
const { upload } = require('../controllers/adminController');
const {
  getAllContent,
  getContentByKey,
  createContent,
  updateContent,
  deleteContent,
  getHeroImages,
  updateContentWithImage
} = require('../controllers/contentController');

// Public routes
router.get('/', getAllContent);
router.get('/hero-images', getHeroImages);
router.get('/:key', getContentByKey);

// Admin routes (protected)
router.post('/', requireAuth, adminAuth, createContent);
router.put('/:id', requireAuth, adminAuth, updateContent);
router.put('/:id/image', requireAuth, adminAuth, upload.single('image'), updateContentWithImage);
router.delete('/:id', requireAuth, adminAuth, deleteContent);

module.exports = router;
