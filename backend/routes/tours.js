const express = require('express');
const router = express.Router();
const { requireAuth, adminAuth, superAdminAuth } = require('../middleware/auth');
const {
  getTours,
  getFeaturedTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  checkAvailability,
  updateTourGallery,
  deleteGalleryPhoto,
  upload,
  galleryUpload
} = require('../controllers/tourController');

// @route   GET /api/tours
// @desc    Get all tours with filtering and pagination
// @access  Public
router.get('/', getTours);

// @route   GET /api/tours/featured
// @desc    Get featured tours
// @access  Public
router.get('/featured', getFeaturedTours);

// @route   GET /api/tours/:slug
// @desc    Get single tour by slug
// @access  Public
router.get('/:slug', getTourBySlug);

// @route   GET /api/tours/:tourId/availability
// @desc    Check tour availability and pricing
// @access  Public
router.get('/:tourId/availability', checkAvailability);

// @route   POST /api/tours
// @desc    Create new tour
// @access  Private (Admin only)
router.post('/', adminAuth, createAuditMiddleware('create', 'tour'), upload.single('image'), createTour);

// @route   PUT /api/tours/:id
// @desc    Update tour
// @access  Private (Admin only)
router.put('/:id', adminAuth, createAuditMiddleware('update', 'tour'), upload.single('image'), updateTour);

// @route   DELETE /api/tours/:id
// @desc    Delete tour
// @access  Private (Super Admin only)
router.delete('/:id', superAdminAuth, createAuditMiddleware('delete', 'tour'), deleteTour);

// @route   PUT /api/tours/:id/gallery
// @desc    Update tour gallery photos
// @access  Private (Admin only)
router.put('/:id/gallery', adminAuth, createAuditMiddleware('update', 'tour'), galleryUpload.array('gallery', 10), updateTourGallery);

// @route   DELETE /api/tours/:id/gallery/:photoUrl
// @desc    Delete specific gallery photo
// @access  Private (Super Admin only)
router.delete('/:id/gallery/:photoUrl', superAdminAuth, createAuditMiddleware('update', 'tour'), deleteGalleryPhoto);

module.exports = router;
