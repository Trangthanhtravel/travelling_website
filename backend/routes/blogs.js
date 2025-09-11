const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireAuth, requireRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', blogController.getBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/slug/:slug', blogController.getBlogBySlug);

// Admin routes
router.get('/admin', requireAuth, requireRole('admin'), blogController.getBlogs);
router.get('/admin/:id', requireAuth, requireRole('admin'), blogController.getBlogById);
router.post('/admin', requireAuth, requireRole('admin'), blogController.createBlog);
router.put('/admin/:id', requireAuth, requireRole('admin'), blogController.updateBlog);
router.delete('/admin/:id', requireAuth, requireRole('admin'), blogController.deleteBlog);
router.patch('/admin/:id/status', requireAuth, requireRole('admin'), blogController.updateBlogStatus);

// Image upload routes
router.post('/upload-featured-image', requireAuth, requireRole('admin'), upload.single('image'), blogController.uploadFeaturedImage);
router.post('/upload-content-image', requireAuth, requireRole('admin'), upload.single('image'), blogController.uploadContentImage);

module.exports = router;
