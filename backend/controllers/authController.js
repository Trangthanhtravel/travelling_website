const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token for admin
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
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

    const token = generateToken(admin.id, userRole);

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

module.exports = {
  adminLogin
};
