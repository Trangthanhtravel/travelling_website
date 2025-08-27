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

// Get all services with filtering
const getServices = async (req, res) => {
  try {
    const db = getDB(req);
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
    const db = getDB(req);
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
    const db = getDB(req);
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
    const db = getDB(req);
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
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const {
      status,
      serviceType,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let query = `
      SELECT sb.*, s.title as service_title, s.service_type, u.name as customer_name, u.email as customer_email
      FROM service_bookings sb
      JOIN services s ON sb.service_id = s.id
      JOIN users u ON sb.customer_id = u.id
    `;

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('sb.status = ?');
      params.push(status);
    }

    if (serviceType) {
      conditions.push('s.service_type = ?');
      params.push(serviceType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const validSortColumns = ['created_at', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
      query += ` ORDER BY sb.${sortBy} ${sortOrder.toUpperCase()}`;
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const result = await db.prepare(query).bind(...params).all();

    const bookings = result.results?.map(booking => ({
      ...booking,
      booking_form: booking.booking_form ? JSON.parse(booking.booking_form) : {},
      notes: booking.notes ? JSON.parse(booking.notes) : []
    })) || [];

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Update service booking status
const updateServiceBookingStatus = async (req, res) => {
  try {
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    if (!['pending', 'contacted', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if booking exists
    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').bind(id).first();
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update status and timestamps
    let updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP'];
    let params = [status];

    if (status === 'contacted') {
      updateFields.push('contacted_at = CURRENT_TIMESTAMP');
    } else if (status === 'confirmed') {
      updateFields.push('confirmed_at = CURRENT_TIMESTAMP');
    }

    // Add note if provided
    if (note) {
      const existingNotes = booking.notes ? JSON.parse(booking.notes) : [];
      const newNote = {
        content: note,
        author: req.user.name,
        createdAt: new Date().toISOString()
      };
      updateFields.push('notes = ?');
      params.push(JSON.stringify([...existingNotes, newNote]));
    }

    const query = `UPDATE service_bookings SET ${updateFields.join(', ')} WHERE id = ?`;
    params.push(id);

    await db.prepare(query).bind(...params).run();

    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating service booking status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: Create new service
const createService = async (req, res) => {
  try {
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const serviceData = req.body;
    
    // Parse JSON fields from FormData if they're strings
    if (serviceData.included && typeof serviceData.included === 'string') {
      serviceData.included = JSON.parse(serviceData.included);
    }
    if (serviceData.excluded && typeof serviceData.excluded === 'string') {
      serviceData.excluded = JSON.parse(serviceData.excluded);
    }
    if (serviceData.features && typeof serviceData.features === 'string') {
      serviceData.features = JSON.parse(serviceData.features);
    }

    // Create new service instance
    const service = new Service({
      title: serviceData.name,
      subtitle: serviceData.subtitle || '',
      description: serviceData.description,
      price: parseFloat(serviceData.price),
      duration: serviceData.duration,
      category: serviceData.category,
      service_type: serviceData.category, // Map category to service_type
      included: serviceData.features || [],
      excluded: serviceData.excluded || [],
      status: serviceData.status || 'active',
      featured: serviceData.featured || false
    });

    // Handle image uploads if files are provided
    if (req.files && req.files.length > 0) {
      try {
        const uploadedImages = await service.updateImages(
          process.env.R2_BUCKET_NAME,
          req.files,
          []
        );
        console.log(`Uploaded ${uploadedImages.length} images for service`);
      } catch (imageError) {
        console.error('Image upload error:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Error uploading images: ' + imageError.message
        });
      }
    }

    // Save service to database
    const result = await service.save(db);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service.toJSON ? service.toJSON() : service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service: ' + error.message
    });
  }
};

// Admin: Update existing service
const updateService = async (req, res) => {
  try {
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if service exists
    const existingService = await Service.findById(db, id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Parse JSON fields if they're strings
    if (updateData.included && typeof updateData.included === 'string') {
      updateData.included = JSON.parse(updateData.included);
    }
    if (updateData.excluded && typeof updateData.excluded === 'string') {
      updateData.excluded = JSON.parse(updateData.excluded);
    }
    if (updateData.features && typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }

    // Prepare update data
    const serviceUpdateData = {
      title: updateData.name || existingService.title,
      subtitle: updateData.subtitle || existingService.subtitle,
      description: updateData.description || existingService.description,
      price: updateData.price ? parseFloat(updateData.price) : existingService.price,
      duration: updateData.duration || existingService.duration,
      category: updateData.category || existingService.category,
      service_type: updateData.category || existingService.service_type,
      included: updateData.features || existingService.included,
      excluded: updateData.excluded || existingService.excluded,
      status: updateData.status || existingService.status,
      featured: updateData.featured !== undefined ? updateData.featured : existingService.featured,
      updated_at: new Date().toISOString()
    };

    // Handle image uploads if new files are provided
    if (req.files && req.files.length > 0) {
      try {
        const uploadedImages = await existingService.updateImages(
          process.env.R2_BUCKET_NAME,
          req.files,
          existingService.images || []
        );
        serviceUpdateData.images = JSON.stringify(uploadedImages);
        console.log(`Updated ${uploadedImages.length} images for service`);
      } catch (imageError) {
        console.error('Image update error:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Error updating images: ' + imageError.message
        });
      }
    }

    // Update service in database
    await existingService.update(db, serviceUpdateData);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { ...existingService, ...serviceUpdateData }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service: ' + error.message
    });
  }
};

// Admin: Delete service
const deleteService = async (req, res) => {
  try {
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;

    // Check if service exists
    const service = await Service.findById(db, id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Delete service (this will also handle image cleanup)
    await service.delete(db, process.env.R2_BUCKET_NAME);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting service: ' + error.message
    });
  }
};

// Admin: Update service status
const updateServiceStatus = async (req, res) => {
  try {
    const db = getDB(req);
    if (!db) {
      return res.status(500).json({ success: false, message: 'Database not available' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    // Check if service exists
    const service = await Service.findById(db, id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update status
    await service.update(db, { 
      status, 
      updated_at: new Date().toISOString() 
    });

    res.json({
      success: true,
      message: 'Service status updated successfully'
    });
  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating service status: ' + error.message
    });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createServiceBooking,
  getUserServiceBookings,
  getAllServiceBookings,
  updateServiceBookingStatus,
  // Admin functions
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  upload // Export the multer upload middleware
};
