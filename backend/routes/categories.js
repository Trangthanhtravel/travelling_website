const express = require('express');
const router = express.Router();
const {  adminAuth } = require('../middleware/auth');
const { createAuditMiddleware } = require('../middleware/auditLog');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  checkCategoryUsage
} = require('../controllers/categoryController');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', adminAuth, createAuditMiddleware('create', 'category'), createCategory);
router.put('/:id', adminAuth, createAuditMiddleware('update', 'category'), updateCategory);
router.get('/:id/usage', adminAuth, checkCategoryUsage);
router.delete('/:id', adminAuth, createAuditMiddleware('delete', 'category'), deleteCategory);
router.post('/reorder', adminAuth, createAuditMiddleware('update', 'category'), reorderCategories);

module.exports = router;
