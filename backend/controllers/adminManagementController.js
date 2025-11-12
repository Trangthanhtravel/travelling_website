const User = require('../models/User');
const emailService = require('../services/emailService');
const crypto = require('crypto');

const adminManagementController = {
  // Get all admins (super_admin only)
  getAllAdmins: async (req, res) => {
    try {
      const admins = await User.findAll();

      // Remove password from response and add computed role
      const sanitizedAdmins = admins.map(admin => {
        const adminData = { ...admin };
        delete adminData.password;
        // Add computed role for frontend
        adminData.computed_role = admin.is_super_admin === 1 ? 'super_admin' : 'admin';
        return adminData;
      });

      res.json({
        success: true,
        data: sanitizedAdmins
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admins'
      });
    }
  },

  // Create new admin (super_admin only)
  createAdmin: async (req, res) => {
    try {
      const { name, email, phone } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Generate random password
      const randomPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

      // Create new admin
      const newAdmin = new User({
        name,
        email,
        password: randomPassword,
        phone: phone || null,
        role: 'admin',
        is_super_admin: 0, // Regular admin, not super admin
        created_by: req.user.userId, // ID of super_admin creating this admin
        is_active: 1
      });

      await newAdmin.save();

      // Send email with credentials
      try {
        await emailService.sendAdminInvitationEmail(req.db, {
          name,
          email,
          password: randomPassword,
          createdBy: req.user.userId
        });
        console.log('[AdminManagement] Invitation email sent to:', email);
      } catch (emailError) {
        console.error('[AdminManagement] Error sending invitation email:', emailError);
        // Continue anyway - admin was created successfully
      }

      // Remove password from response
      const adminData = { ...newAdmin };
      delete adminData.password;

      res.status(201).json({
        success: true,
        message: 'Admin created successfully. Invitation email sent.',
        data: adminData
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create admin'
      });
    }
  },

  // Update admin (super_admin only)
  updateAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, is_active } = req.body;

      // Find admin
      const admin = await User.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Prevent super_admin from being demoted or deactivated
      if (admin.is_super_admin === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot modify super admin'
        });
      }

      // Update admin data
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
        updateData.email = email.toLowerCase();
      }
      if (phone !== undefined) updateData.phone = phone;
      if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

      await admin.update(updateData);

      res.json({
        success: true,
        message: 'Admin updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update admin'
      });
    }
  },

  // Delete admin (super_admin only) - soft delete
  deleteAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      // Find admin
      const admin = await User.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Prevent super_admin from being deleted
      if (admin.is_super_admin === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete super admin'
        });
      }

      // Prevent self-deletion
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

      // Soft delete
      await User.delete(id);

      res.json({
        success: true,
        message: 'Admin deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete admin'
      });
    }
  },

  // Reset admin password (super_admin only)
  resetAdminPassword: async (req, res) => {
    try {
      const { id } = req.params;

      // Find admin
      const admin = await User.findById(id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Generate new random password
      const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);

      // Update password
      await admin.update({
        password: newPassword
      });

      // Send email with new password
      try {
        await emailService.sendPasswordResetEmail(req.db, {
          name: admin.name,
          email: admin.email,
          password: newPassword
        });
        console.log('[AdminManagement] Password reset email sent to:', admin.email);
      } catch (emailError) {
        console.error('[AdminManagement] Error sending password reset email:', emailError);
      }

      res.json({
        success: true,
        message: 'Password reset successfully. Email sent to admin.'
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  }
};

module.exports = adminManagementController;

