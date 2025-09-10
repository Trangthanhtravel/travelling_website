const Tour = require('../models/Tour');
const Category = require('../models/Category');
const { r2Helpers } = require('../config/storage');
const { getDB } = require('../config/database');
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

// Create a separate multer instance for gallery uploads
const galleryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files and check field name
    if (file.mimetype.startsWith('image/') && file.fieldname === 'gallery') {
      cb(null, true);
    } else if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
    } else {
      cb(new Error('Invalid field name'), false);
    }
  }
});

// Get featured tours for homepage
const getFeaturedTours = async (req, res) => {
  try {
    const { limit = 6, language = 'en' } = req.query; // Add language parameter
    const db = getDB();

    const featuredTours = await Tour.getFeatured(db, parseInt(limit));

    // Apply localization to featured tours
    const localizedTours = featuredTours.map(tour => {
      const tourJson = tour.toJSON();
      const localizedContent = tour.getLocalizedContent(language);
      return {
        ...tourJson,
        ...localizedContent
      };
    });

    res.json({
      success: true,
      data: localizedTours
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
    const db = getDB();

    const {
      page = 1,
      limit = 12,
      location,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      language = 'en' // Add language parameter
    } = req.query;

    const offset = (page - 1) * limit;
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      location,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder
    };

    let result;
    if (search) {
      result = await Tour.search(db, search, options);
    } else {
      result = await Tour.findAll(db, options);
    }

    // Apply localization to the results
    const localizedTours = result.data.map(tour => {
      const tourJson = tour.toJSON();
      const localizedContent = tour.getLocalizedContent(language);
      return {
        ...tourJson,
        ...localizedContent
      };
    });

    res.json({
      success: true,
      data: localizedTours,
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

// Get tour by ID
const getTourById = async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const tour = await Tour.findById(db, id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const tourJson = tour.toJSON();
    const localizedContent = tour.getLocalizedContent(language);

    res.json({
      success: true,
      data: {
        ...tourJson,
        ...localizedContent
      }
    });
  } catch (error) {
    console.error('Get tour by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tour'
    });
  }
};

// Get tour by slug
const getTourBySlug = async (req, res) => {
  try {
    const db = getDB();
    const { slug } = req.params;
    const { language = 'en' } = req.query;

    const tour = await Tour.findBySlug(db, slug);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    const tourJson = tour.toJSON();
    const localizedContent = tour.getLocalizedContent(language);

    res.json({
      success: true,
      data: {
        ...tourJson,
        ...localizedContent
      }
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
    const db = getDB();

    // Check if R2 is properly configured
    if (!req.r2) {
      console.error('R2 bucket not configured. Check environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured. Please contact administrator.'
      });
    }

    // Parse JSON fields from form data
    const tourData = { ...req.body };

    // Parse JSON fields
    ['itinerary', 'included', 'excluded', 'itinerary_vi', 'included_vi', 'excluded_vi'].forEach(field => {
      if (tourData[field] && typeof tourData[field] === 'string') {
        try {
          tourData[field] = JSON.parse(tourData[field]);
        } catch (e) {
          // If parsing fails, keep as string or set to appropriate default
          if (field.includes('included') || field.includes('excluded')) {
            tourData[field] = [];
          } else if (field.includes('itinerary')) {
            tourData[field] = {};
          }
        }
      }
    });

    // Convert featured to boolean
    tourData.featured = tourData.featured === 'true' || tourData.featured === true;

    const tour = new Tour(tourData);

    // Handle image upload
    if (req.file) {
      await tour.updateImage(req.r2, req.file);
    }

    // Save to database
    await tour.save(db);

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: tour.toJSON()
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
    const db = getDB();
    const { id } = req.params;

    // Check if R2 is properly configured
    if (!req.r2) {
      console.error('R2 bucket not configured. Check environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured. Please contact administrator.'
      });
    }

    const tour = await Tour.findById(db, id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Parse JSON fields from form data
    const updateData = { ...req.body };

    // Parse JSON fields
    ['itinerary', 'included', 'excluded', 'itinerary_vi', 'included_vi', 'excluded_vi'].forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // If parsing fails, keep existing value
          delete updateData[field];
        }
      }
    });

    // Convert featured to boolean if provided
    if (updateData.featured !== undefined) {
      updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    }

    // Update tour properties
    Object.assign(tour, updateData);

    // Handle image upload
    if (req.file) {
      const oldImage = tour.image;
      await tour.updateImage(req.r2, req.file, oldImage);
    }

    // Update in database - pass the updateData to the update method
    await tour.update(db, updateData);

    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: tour.toJSON()
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
    const db = getDB();
    const tour = await Tour.findById(db, req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    await tour.delete(db, req.r2);

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
    const db = getDB();
    const { tourId } = req.params;
    const { date, participants } = req.query;

    const tour = await Tour.findById(db, tourId);
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
    const db = getDB();
    const stats = await Tour.getStats(db);

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

// Update tour gallery (admin only)
const updateTourGallery = async (req, res) => {
  try {
    const db = getDB();
    const tour = await Tour.findById(db, req.params.id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Check if R2 is properly configured
    if (!req.r2) {
      console.error('R2 bucket not configured. Check environment variables.');
      return res.status(500).json({
        success: false,
        message: 'Image upload service not configured. Please contact administrator.'
      });
    }

    // Handle gallery uploads (max 10 photos)
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 gallery photos allowed'
        });
      }

      try {
        const oldGallery = tour.gallery || [];
        const galleryUrls = await tour.updateGallery(req.r2, req.files, oldGallery);

        // Update database
        await db.prepare('UPDATE tours SET gallery = ?, updated_at = datetime("now") WHERE id = ?')
          .bind(JSON.stringify(galleryUrls), tour.id).run();

        tour.gallery = galleryUrls;

        res.json({
          success: true,
          data: tour.toJSON(),
          message: 'Tour gallery updated successfully'
        });
      } catch (imageError) {
        console.error('Gallery upload error:', imageError);
        return res.status(400).json({
          success: false,
          message: `Gallery upload failed: ${imageError.message}`
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'No gallery photos provided'
      });
    }
  } catch (error) {
    console.error('Update tour gallery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating tour gallery'
    });
  }
};

// Delete specific gallery photo (admin only)
const deleteGalleryPhoto = async (req, res) => {
  try {
    const db = getDB();
    const { id, photoUrl } = req.params;

    const tour = await Tour.findById(db, id);
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Decode the photo URL parameter - handle double encoding
    let decodedPhotoUrl = decodeURIComponent(photoUrl);
    // Try double decoding in case it was double encoded from frontend
    try {
      decodedPhotoUrl = decodeURIComponent(decodedPhotoUrl);
    } catch (e) {
      // Single decode was sufficient
    }

    console.log('Original URL param:', photoUrl);
    console.log('Decoded URL:', decodedPhotoUrl);
    console.log('Tour gallery:', tour.gallery);

    if (!tour.gallery || !tour.gallery.includes(decodedPhotoUrl)) {
      return res.status(404).json({
        success: false,
        message: 'Gallery photo not found'
      });
    }

    const updatedGallery = await tour.deleteGalleryPhoto(req.r2, decodedPhotoUrl);

    res.json({
      success: true,
      data: { gallery: updatedGallery },
      message: 'Gallery photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery photo error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting gallery photo'
    });
  }
};

// Get tour by ID (alias for getTourById)
const getTour = getTourById;

module.exports = {
  getTours,
  getFeaturedTours,
  getTourBySlug,
  getTourById,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  checkAvailability,
  updateTourGallery,
  deleteGalleryPhoto,
  upload,
  galleryUpload
};
