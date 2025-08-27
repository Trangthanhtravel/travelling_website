const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { requireAuth, requireRole } = require('../middleware/auth');

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

module.exports = router;
