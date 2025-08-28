const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  createDirectBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingById,
  addBookingNote,
  getBookingStats
} = require('../controllers/bookingController');

// @route   POST /api/bookings
// @desc    Create new direct booking (no user authentication required)
// @access  Public
router.post('/', createDirectBooking);

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', adminAuth, getAllBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (admin only)
// @access  Private (Admin)
router.get('/stats', adminAuth, getBookingStats);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID (admin only)
// @access  Private (Admin)
router.get('/:id', adminAuth, getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (admin only)
// @access  Private (Admin)
router.put('/:id/status', adminAuth, updateBookingStatus);

// @route   POST /api/bookings/:id/notes
// @desc    Add note to booking (admin only)
// @access  Private (Admin)
router.post('/:id/notes', adminAuth, addBookingNote);

module.exports = router;
