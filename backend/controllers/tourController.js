const Tour = require('../models/Tour');
const Category = require('../models/Category');
const { r2Helpers } = require('../config/storage');
const multer = require('multer');

// Configure multer for memory storage (files will be uploaded to R2)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get featured tours for homepage
const getFeaturedTours = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const db = req.db || req.cloudflare?.env?.DB;

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    const featuredTours = await Tour.getFeatured(db, parseInt(limit));

    res.json({
      success: true,
      data: featuredTours.map(tour => tour.toJSON())
    });
  } catch (error) {
    console.error('Get featured tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured tours'
    });
  }
};

// Get all tours with filtering and pagination
const getTours = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      category, // Now uses dynamic category slugs from database
      minPrice,
      maxPrice,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      location,
      category, // Uses category_slug for filtering
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder
    };

    let result;
    if (search) {
      result = await Tour.search(search, options);
    } else {
      result = await Tour.findAll(options);
    }

    res.json({
      success: true,
      data: result.data.map(tour => tour.toJSON()),
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tours'
    });
  }
};

// Get single tour by ID
const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.json({
      success: true,
      data: tour.toJSON()
    });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour'
    });
  }
};

// Get tour by slug - now properly implemented
const getTourBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const tour = await Tour.findBySlug(slug);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.json({
      success: true,
      data: tour.toJSON()
    });
  } catch (error) {
    console.error('Get tour by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour'
    });
  }
};

// Create new tour (admin only)
const createTour = async (req, res) => {
  try {
    const tourData = req.body;

    // Parse JSON fields from FormData
    if (tourData.included && typeof tourData.included === 'string') {
      tourData.included = JSON.parse(tourData.included);
    }
    if (tourData.excluded && typeof tourData.excluded === 'string') {
      tourData.excluded = JSON.parse(tourData.excluded);
    }

    // Convert string values to appropriate types
    tourData.price = parseFloat(tourData.price);
    tourData.max_participants = parseInt(tourData.max_participants);
    tourData.featured = tourData.featured === 'true';

    const tour = new Tour(tourData);

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      try {
        const imageUrls = await tour.updateImages(req.r2, req.files);
        tour.images = imageUrls;
      } catch (imageError) {
        console.error('Image upload error:', imageError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${imageError.message}`
        });
      }
    }

    await tour.save();

    res.status(201).json({
      success: true,
      data: tour.toJSON(),
      message: 'Tour created successfully'
    });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating tour'
    });
  }
};

// Update tour (admin only)
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const updateData = req.body;

    // Parse JSON fields from FormData
    if (updateData.included && typeof updateData.included === 'string') {
      updateData.included = JSON.parse(updateData.included);
    }
    if (updateData.excluded && typeof updateData.excluded === 'string') {
      updateData.excluded = JSON.parse(updateData.excluded);
    }

    // Convert string values to appropriate types
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.max_participants) updateData.max_participants = parseInt(updateData.max_participants);
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === 'true';

    // Handle image uploads if provided
    if (req.files && req.files.length > 0) {
      try {
        const oldImages = tour.images || [];
        const imageUrls = await tour.updateImages(req.r2, req.files, oldImages);
        updateData.images = imageUrls;
      } catch (imageError) {
        console.error('Image upload error:', imageError);
        return res.status(400).json({
          success: false,
          message: `Image upload failed: ${imageError.message}`
        });
      }
    }

    await tour.update(updateData);

    res.json({
      success: true,
      data: tour.toJSON(),
      message: 'Tour updated successfully'
    });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating tour'
    });
  }
};

// Delete tour (admin only)
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    await tour.delete(req.r2);

    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting tour'
    });
  }
};

// Check tour availability
const checkAvailability = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { date, participants } = req.query;

    const tour = await Tour.findById(req.db, tourId);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Simple availability check - in real app, this would check bookings
    const available = tour.max_participants >= parseInt(participants || 1);
    const totalPrice = tour.price * parseInt(participants || 1);

    res.json({
      success: true,
      data: {
        available,
        price: tour.price,
        totalPrice,
        maxParticipants: tour.max_participants
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
};

// Get tour statistics (admin only)
const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.getStats(req.db);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get tour stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour statistics'
    });
  }
};

module.exports = {
  getTours,
  getFeaturedTours,
  getTourBySlug,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  checkAvailability,
  upload
};
