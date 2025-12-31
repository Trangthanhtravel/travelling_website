const express = require('express');
const router = express.Router();
const {
  adminLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', adminLogin);

// @route   POST /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private (Admin/Super Admin)
router.post('/change-password', requireAuth, changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset email
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify if password reset token is valid
// @access  Public
router.get('/verify-reset-token/:token', verifyResetToken);

module.exports = router;
