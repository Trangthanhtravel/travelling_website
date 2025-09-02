const { getDB, generateId, generateBookingNumber } = require('../config/database');
const Service = require('../models/Service');
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

// Create a separate multer instance for gallery uploads
const galleryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') && file.fieldname === 'images') {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for gallery'), false);
    }
  }
});

// Get all services with filtering
const getServices = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      category,
      serviceType,
      status = 'active',
      featured,
      search,
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Updated query to join with categories table
    let query = `
      SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    const conditions = [];
    const params = [];

    // For public access, always filter to active services unless user is admin
    if (!req.user || req.user.role !== 'admin') {
      conditions.push('s.status = ?');
      params.push('active');
    } else if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }

    // Filter by category slug or ID
    if (category) {
      conditions.push('(c.slug = ? OR s.category_id = ?)');
      params.push(category, category);
    }

    if (serviceType) {
      conditions.push('s.service_type = ?');
      params.push(serviceType);
    }

    if (featured !== undefined) {
      conditions.push('s.featured = ?');
      params.push(featured === 'true' ? 1 : 0);
    }

    if (search) {
      conditions.push('(s.title LIKE ? OR s.subtitle LIKE ? OR s.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const validSortColumns = ['created_at', 'title', 'price', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const result = await db.prepare(query).bind(...params).all();

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countResult = await db.prepare(countQuery).bind(...params.slice(0, -2)).first();
    const total = countResult?.total || 0;

    // Process results and include category information
    const services = result.results?.map(service => ({
      ...service,
      images: service.images ? JSON.parse(service.images) : [],
      gallery: service.gallery ? JSON.parse(service.gallery) : [],
      videos: service.videos ? JSON.parse(service.videos) : [],
      included: service.included ? JSON.parse(service.included) : [],
      excluded: service.excluded ? JSON.parse(service.excluded) : [],
      itinerary: service.itinerary ? JSON.parse(service.itinerary) : [],
      location: service.location ? JSON.parse(service.location) : null,
      featured: Boolean(service.featured),
      category: service.category_id ? {
        id: service.category_id,
        name: service.category_name,
        slug: service.category_slug,
        icon: service.category_icon,
        color: service.category_color
      } : null
    })) || [];

    res.json({
      success: true,
      data: services,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get single service by ID
const getServiceById = async (req, res) => {
    try {
        const db = getDB();
        if (!db) {
            return res.status(500).json({ success: false, message: 'Database not available' });
        }

        const { id } = req.params;

        // Updated query to include category information
        const query = `
      SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ? AND (s.status = "active" OR ? = "admin")
    `;

        const result = await db.prepare(query).bind(id, req.user?.role || '').first();

        if (!result) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const service = {
            ...result,
            images: result.images ? JSON.parse(result.images) : [],
            gallery: result.gallery ? JSON.parse(result.gallery) : [],
            videos: result.videos ? JSON.parse(result.videos) : [],
            included: result.included ? JSON.parse(result.included) : [],
            excluded: result.excluded ? JSON.parse(result.excluded) : [],
            itinerary: result.itinerary ? JSON.parse(result.itinerary) : [],
            location: result.location ? JSON.parse(result.location) : null,
            featured: Boolean(result.featured),
            category: result.category_id ? {
                id: result.category_id,
                name: result.category_name,
                slug: result.category_slug,
                icon: result.category_icon,
                color: result.category_color
            } : null
        };

        res.json({ success: true, data: service });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get single service by slug
const getServiceBySlug = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { slug } = req.params;

    // Updated query to include category information and search by slug
    const query = `
      SELECT s.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.slug = ? AND (s.status = "active" OR ? = "admin")
    `;

    const result = await db.prepare(query).bind(slug, req.user?.role || '').first();

    if (!result) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const service = {
      ...result,
      images: result.images ? JSON.parse(result.images) : [],
      gallery: result.gallery ? JSON.parse(result.gallery) : [],
      videos: result.videos ? JSON.parse(result.videos) : [],
      included: result.included ? JSON.parse(result.included) : [],
      excluded: result.excluded ? JSON.parse(result.excluded) : [],
      itinerary: result.itinerary ? JSON.parse(result.itinerary) : [],
      location: result.location ? JSON.parse(result.location) : null,
      featured: Boolean(result.featured),
      category: result.category_id ? {
        id: result.category_id,
        name: result.category_name,
        slug: result.category_slug,
        icon: result.category_icon,
        color: result.category_color
      } : null
    };

    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Create service booking
const createServiceBooking = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      serviceId,
      serviceType,
      name,
      email,
      gender,
      dateOfBirth,
      phone,
      address,
      passengers,
      departureDate,
      from,
      to,
      returnTrip,
      returnDate,
      tripDetails,
      requestDetails
    } = req.body;

    // Validate required fields
    if (!serviceId || !name || !email || !phone || !passengers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if service exists
    const service = await db.prepare('SELECT * FROM services WHERE id = ? AND status = "active"')
      .bind(serviceId).first();

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Validate service type specific fields
    if (serviceType === 'tours' && !departureDate) {
      return res.status(400).json({ success: false, message: 'Departure date is required for tours' });
    }

    if (serviceType === 'car-rental' && (!departureDate || !from || !to || !tripDetails)) {
      return res.status(400).json({
        success: false,
        message: 'Departure date, from, to, and trip details are required for car rental'
      });
    }

    if (serviceType === 'other-services' && !requestDetails) {
      return res.status(400).json({ success: false, message: 'Request details are required for other services' });
    }

    const bookingId = generateId();
    const bookingNumber = generateBookingNumber();

    // Prepare booking form data
    const bookingForm = {
      serviceId,
      serviceType,
      name,
      email,
      gender,
      dateOfBirth,
      phone,
      address,
      passengers,
      ...(departureDate && { departureDate }),
      ...(from && { from }),
      ...(to && { to }),
      ...(returnTrip !== undefined && { returnTrip }),
      ...(returnDate && { returnDate }),
      ...(tripDetails && { tripDetails }),
      ...(requestDetails && { requestDetails })
    };

    const query = `
      INSERT INTO service_bookings (
        id, service_id, customer_id, booking_form, status
      ) VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    await db.prepare(query).bind(
      bookingId,
      bookingNumber,
      serviceId,
      req.user.id,
      JSON.stringify(bookingForm)
    ).run();

    res.status(201).json({
      success: true,
      message: 'Service booking created successfully',
      data: { bookingNumber }
    });
  } catch (error) {
    console.error('Error creating service booking:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get user's service bookings
const getUserServiceBookings = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const query = `
      SELECT sb.*, s.title as service_title, s.subtitle as service_subtitle, s.images as service_images
      FROM service_bookings sb
      JOIN services s ON sb.service_id = s.id
      WHERE sb.customer_id = ?
      ORDER BY sb.created_at DESC
    `;

    const result = await db.prepare(query).bind(req.user.id).all();

    const bookings = result.results?.map(booking => ({
      ...booking,
      booking_form: booking.booking_form ? JSON.parse(booking.booking_form) : {},
      notes: booking.notes ? JSON.parse(booking.notes) : [],
      service: {
        title: booking.service_title,
        subtitle: booking.service_subtitle,
        images: booking.service_images ? JSON.parse(booking.service_images) : []
      }
    })) || [];

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user service bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Get all service bookings
const getAllServiceBookings = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT sb.*, s.title as service_title, s.subtitle as service_subtitle, s.images as service_images,
             u.name as customer_name, u.email as customer_email
      FROM service_bookings sb
      JOIN services s ON sb.service_id = s.id
      LEFT JOIN users u ON sb.customer_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('sb.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY sb.created_at DESC';

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const result = await db.prepare(query).bind(...params).all();

    const bookings = result.results?.map(booking => ({
      ...booking,
      booking_form: booking.booking_form ? JSON.parse(booking.booking_form) : {},
      notes: booking.notes ? JSON.parse(booking.notes) : [],
      service: {
        title: booking.service_title,
        subtitle: booking.service_subtitle,
        images: booking.service_images ? JSON.parse(booking.service_images) : []
      },
      customer: {
        name: booking.customer_name,
        email: booking.customer_email
      }
    })) || [];

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Create service
const createService = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      title,
      subtitle,
      description,
      price,
      duration,
      category_id,
      service_type,
      status = 'active',
      images,
      itinerary,
      included,
      excluded,
      featured = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, price'
      });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Parse images if it's a string
    let imageUrls = [];
    if (images) {
      imageUrls = typeof images === 'string' ? JSON.parse(images) : images;
    }

    // Handle file uploads if any (from multer)
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file =>
          r2Helpers.uploadFile(file.buffer, `services/${slug}/${file.originalname}`, file.mimetype)
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(500).json({ success: false, message: 'Error uploading images' });
      }
    }

    const serviceId = generateId();
    const query = `
      INSERT INTO services (
        id, title, slug, subtitle, description, price, duration, images,
        included, excluded, itinerary, category_id, service_type, status, 
        featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    await db.prepare(query).bind(
      serviceId,
      title,
      slug,
      subtitle || null,
      description,
      parseFloat(price),
      duration || null,
      JSON.stringify(imageUrls),
      JSON.stringify(included ? (typeof included === 'string' ? JSON.parse(included) : included) : []),
      JSON.stringify(excluded ? (typeof excluded === 'string' ? JSON.parse(excluded) : excluded) : []),
      JSON.stringify(itinerary ? (typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary) : []),
      category_id || null,
      service_type || 'general',
      status,
      featured ? 1 : 0
    ).run();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { id: serviceId, slug }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update service
const updateService = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      price,
      duration,
      category_id,
      service_type,
      status,
      images,
      itinerary,
      included,
      excluded,
      featured
    } = req.body;

    // Check if service exists
    const existingService = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Generate new slug if title changed
    let slug = existingService.slug;
    if (title && title !== existingService.title) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Parse existing images
    let imageUrls = existingService.images ? JSON.parse(existingService.images) : [];

    // Update images if provided
    if (images !== undefined) {
      imageUrls = typeof images === 'string' ? JSON.parse(images) : images;
    }

    // Handle new file uploads if any
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file =>
          r2Helpers.uploadFile(file.buffer, `services/${slug}/${file.originalname}`, file.mimetype)
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(500).json({ success: false, message: 'Error uploading images' });
      }
    }

    const query = `
      UPDATE services SET
        title = COALESCE(?, title),
        slug = ?,
        subtitle = ?,
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        duration = ?,
        images = ?,
        included = ?,
        excluded = ?,
        itinerary = ?,
        category_id = ?,
        service_type = COALESCE(?, service_type),
        status = COALESCE(?, status),
        featured = COALESCE(?, featured),
        updated_at = datetime('now')
      WHERE id = ?
    `;

    await db.prepare(query).bind(
      title,
      slug,
      subtitle,
      description,
      price ? parseFloat(price) : null,
      duration,
      JSON.stringify(imageUrls),
      JSON.stringify(included ? (typeof included === 'string' ? JSON.parse(included) : included) : []),
      JSON.stringify(excluded ? (typeof excluded === 'string' ? JSON.parse(excluded) : excluded) : []),
      JSON.stringify(itinerary ? (typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary) : []),
      category_id,
      service_type,
      status,
      featured !== undefined ? (featured ? 1 : 0) : null,
      id
    ).run();

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Delete service
const deleteService = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;

    // Check if service exists
    const existingService = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Delete the service
    await db.prepare('DELETE FROM services WHERE id = ?').bind(id).run();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update service status
const updateServiceStatus = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['active', 'inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if service exists
    const existingService = await db.prepare('SELECT * FROM services WHERE id = ?').bind(id).first();
    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Update status
    await db.prepare('UPDATE services SET status = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(status, id).run();

    res.json({
      success: true,
      message: 'Service status updated successfully'
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update service booking status
const updateServiceBookingStatus = async (req, res) => {
  try {
    const db = getDB();
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if booking exists
    const existingBooking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').bind(id).first();
    if (!existingBooking) {
      return res.status(404).json({ success: false, message: 'Service booking not found' });
    }

    // Update status
    await db.prepare('UPDATE service_bookings SET status = ?, updated_at = datetime("now") WHERE id = ?')
      .bind(status, id).run();

    res.json({
      success: true,
      message: 'Service booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating service booking status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update service gallery (admin only)
const updateServiceGallery = async (req, res) => {
  try {
    const db = getDB();
    const service = await Service.findById(db, req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
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
        const oldGallery = service.gallery || [];
        const galleryUrls = await service.updateGallery(req.r2, req.files, oldGallery);

        // Update database
        await db.prepare('UPDATE services SET gallery = ?, updated_at = datetime("now") WHERE id = ?')
          .bind(JSON.stringify(galleryUrls), service.id).run();

        service.gallery = galleryUrls;

        res.json({
          success: true,
          data: { gallery: galleryUrls },
          message: 'Service gallery updated successfully'
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
    console.error('Update service gallery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating service gallery'
    });
  }
};

// Admin: Delete specific gallery photo (admin only)
const deleteServiceGalleryPhoto = async (req, res) => {
  try {
    const db = getDB();
    const service = await Service.findById(db, req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const photoUrl = decodeURIComponent(req.params.photoUrl);
    console.log('Attempting to delete photo:', photoUrl);
    console.log('Service gallery:', service.gallery);

    if (!service.gallery || !service.gallery.includes(photoUrl)) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found in service gallery'
      });
    }

    // Remove the photo from the gallery
    const updatedGallery = await service.removeGalleryPhoto(req.r2, photoUrl);

    res.json({
      success: true,
      data: { gallery: updatedGallery },
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete gallery photo error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting photo'
    });
  }
};

module.exports = {
  upload,
  getServices,
  getServiceById,
  getServiceBySlug,
  createServiceBooking,
  getUserServiceBookings,
  getAllServiceBookings,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  updateServiceBookingStatus,
  updateServiceGallery,
  deleteServiceGalleryPhoto
};
