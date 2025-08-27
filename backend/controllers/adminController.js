const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Content = require('../models/Content');
const { r2Helpers } = require('../config/storage');

// Dashboard analytics
const getDashboardStats = async (req, res) => {
  try {
    // Get statistics from all models
    const bookingStats = await Booking.getStats();
    const tourStats = await Tour.getStats();
    const userCount = await User.findAll(req.db, 100, 0); // Get user count

    // Recent bookings with more details
    const recentBookings = await Booking.findAll({ limit: 10 });

    const stats = {
      totalBookings: bookingStats.total,
      totalTours: tourStats.total,
      totalUsers: userCount.length,
      totalRevenue: bookingStats.totalRevenue || 0,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        tour_title: booking.customer_name, // We'll need to join with tours later
        participants: booking.total_travelers,
        created_at: booking.created_at,
        status: booking.status
      })),
      toursByLocation: tourStats.byLocation || [],
      toursByDifficulty: tourStats.byDifficulty || [],
      bookingsByStatus: bookingStats.byStatus || []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return fallback data instead of error to prevent dashboard from breaking
    res.json({
      success: true,
      data: {
        totalBookings: 0,
        totalTours: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentBookings: [],
        toursByLocation: [],
        toursByDifficulty: [],
        bookingsByStatus: []
      }
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const users = await User.findAll(req.db, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: users.map(user => user.toJSON())
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'editor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.db, userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update(req.db, { role });

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// Upload image to R2 (admin only)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Validate image
    r2Helpers.validateImage(req.file);

    // Upload to R2
    const folder = req.body.folder || 'admin';
    const imageUrl = await r2Helpers.uploadImage(req.r2, req.file, folder);

    res.json({
      success: true,
      data: { imageUrl },
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image'
    });
  }
};

// Delete image from R2 (admin only)
const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    await r2Helpers.deleteImage(req.r2, imageUrl);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image'
    });
  }
};

// Content Management - Create content with image
const createContent = async (req, res) => {
  try {
    const contentData = req.body;
    const content = new Content(contentData);

    // Handle image upload if provided
    if (req.file) {
      const imageUrl = await content.updateImage(req.r2, req.file);
      content.image_url = imageUrl;
    }

    await content.save(req.db);

    res.status(201).json({
      success: true,
      data: content,
      message: 'Content created successfully'
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content'
    });
  }
};

// Update content with image
const updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const updateData = req.body;

    const content = await Content.findById(req.db, contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Handle image upload if provided
    if (req.file) {
      const oldImageUrl = content.image_url;
      const imageUrl = await content.updateImage(req.r2, req.file, oldImageUrl);
      updateData.image_url = imageUrl;
    }

    await content.update(req.db, updateData);

    res.json({
      success: true,
      message: 'Content updated successfully'
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content'
    });
  }
};

// Delete content
const deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(req.db, contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await content.delete(req.db, req.r2);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content'
    });
  }
};

// Get all content
const getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      type,
      status
    };

    const content = await Content.findAll(req.db, options);
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  uploadImage,
  deleteImage,
  createContent,
  updateContent,
  deleteContent,
  getAllContent
};
