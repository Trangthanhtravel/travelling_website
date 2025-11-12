const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireAuth, requireRole, adminAuth, superAdminAuth } = require('../middleware/auth');
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
router.get('/admin', adminAuth, blogController.getBlogs);
router.get('/admin/:id', adminAuth, blogController.getBlogById);
router.post('/admin', adminAuth, blogController.createBlog);
router.put('/admin/:id', adminAuth, blogController.updateBlog);
router.delete('/admin/:id', superAdminAuth, blogController.deleteBlog);
router.patch('/admin/:id/status', adminAuth, blogController.updateBlogStatus);

// Image upload routes
router.post('/upload-featured-image', adminAuth, upload.single('image'), blogController.uploadFeaturedImage);
router.post('/upload-content-image', adminAuth, upload.single('image'), blogController.uploadContentImage);

module.exports = router;
