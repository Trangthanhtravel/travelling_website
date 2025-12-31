const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token for admin
const generateToken = (userId, role, email, name) => {
  return jwt.sign(
    {
      id: userId,      // Changed from userId to id
      userId,          // Keep for backward compatibility
      role,
      email,           // Added for audit logging
      name             // Added for audit logging
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
  );
};

// @desc    Admin login only
const adminLogin = async (req, res) => {
  try {
    console.log('🔍 Admin login attempt:', {
      body: req.body,
      email: req.body?.email,
      passwordLength: req.body?.password?.length
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log('🔍 Looking for admin user with email:', email);

    // Check if admin user exists
    const admin = await User.findByEmail(email);

    console.log('🔍 Admin user found:', {
      found: !!admin,
      adminId: admin?.id,
      adminRole: admin?.role,
      adminEmail: admin?.email,
      hasPassword: !!admin?.password
    });

    if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
      console.log('❌ Admin user not found or invalid role');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    console.log('🔍 Comparing passwords...');
    console.log('Input password length:', password.length);
    console.log('Stored password hash length:', admin.password?.length);
    console.log('Stored hash starts with:', admin.password?.substring(0, 10));

    // Verify password
    const isValidPassword = await admin.comparePassword(password);
    console.log('🔍 Password comparison result:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password validation failed');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    console.log('✅ Authentication successful');

    // Log is_super_admin value for debugging
    console.log('🔍 is_super_admin value:', admin.is_super_admin, 'type:', typeof admin.is_super_admin);

    // Generate token with role based on is_super_admin flag
    // Handle both number and string (SQLite might return as string)
    const userRole = (admin.is_super_admin === 1 || admin.is_super_admin === '1') ? 'super_admin' : 'admin';
    console.log('🔍 Computed userRole:', userRole);

    const token = generateToken(admin.id, userRole, admin.email, admin.name);

    // Return response in ApiResponse format to match frontend expectations
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: userRole // Use computed role (super_admin or admin)
        }
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Change password for authenticated admin/super_admin
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    await User.changePassword(userId, currentPassword, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};

// @desc    Initiate forgot password process
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findByEmail(email);

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token
    const token = await User.createPasswordResetToken(user.id);

    // Send email with reset link
    const { getDB } = require('../config/database');
    const emailService = require('../services/emailService');
    const db = getDB();

    await emailService.sendForgotPasswordEmail(db, user, token);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password using token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    await User.resetPassword(token, newPassword);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    if (error.message === 'Invalid or expired password reset token') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Verify password reset token validity
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const resetToken = await User.verifyPasswordResetToken(token);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
};

module.exports = {
  adminLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
};
