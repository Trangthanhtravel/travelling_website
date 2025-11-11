const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const Service = require('../models/Service');
const emailService = require('../services/emailService');

// Create booking without user account
const createDirectBooking = async (req, res) => {
  try {
    console.log('Received booking data:', req.body);

    const {
      // Updated to match frontend structure for both tours and services
      tourId,
      serviceId,
      tourSlug,
      serviceSlug,
      tourTitle,
      serviceTitle,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      adults,
      children,
      infants,
      totalTravelers,
      totalAmount,
      currency,
      specialRequests,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      // New personal information fields
      gender,
      dateOfBirth,
      address,
      // Service-specific fields
      departureLocation,
      destinationLocation,
      returnTrip,
      returnDate,
      // Language preference for emails
      language
    } = req.body;

    // Determine if this is a tour or service booking
    const isServiceBooking = serviceId || serviceSlug;
    const itemId = isServiceBooking ? serviceId : tourId;
    const itemSlug = isServiceBooking ? serviceSlug : tourSlug;
    const itemTitle = isServiceBooking ? serviceTitle : tourTitle;
    const bookingType = isServiceBooking ? 'service' : 'tour';

    // Validate required fields
    if (!itemId || !customerName || !customerEmail || !customerPhone || !startDate || !totalTravelers || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate date
    const bookingDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Get tour or service details
    let item;
    if (bookingType === 'tour') {
      item = await Tour.findById(req.db, itemId);
    } else {
      item = await Service.findById(req.db, itemId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${bookingType === 'tour' ? 'Tour' : 'Service'} not found`
      });
    }

    // Generate unique booking number
    const bookingNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create booking object matching database schema
    const bookingData = {
      type: bookingType,
      item_id: itemId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_date: startDate,
      total_travelers: totalTravelers,
      special_requests: specialRequests || null,
      total_amount: totalAmount,
      currency: currency || 'VND',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Individual traveler counts
      adults: adults || 0,
      children: children || 0,
      infants: infants || 0,
      // Personal information
      gender: gender || null,
      date_of_birth: dateOfBirth || null,
      address: address || null,
      // Emergency contact information
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      emergency_contact_relationship: emergencyContactRelationship || null,
      // Service-specific fields
      departure_location: departureLocation || null,
      destination_location: destinationLocation || null,
      return_trip: returnTrip || false,
      return_date: returnDate || null,
      booking_number: bookingNumber
    };

    const booking = new Booking(bookingData);
    const savedBooking = await booking.save(req.db);

    // Send email notifications
    try {
      console.log('Preparing to send email notifications...');
      console.log('Email environment variables check:', {
        EMAIL_HOST: process.env.EMAIL_HOST ? 'Set' : 'Not set',
        EMAIL_PORT: process.env.EMAIL_PORT ? 'Set' : 'Not set',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
      });

      const bookingForEmail = {
        bookingNumber: bookingNumber,
        type: bookingType,
        startDate: startDate,
        totalTravelers: totalTravelers,
        totalAmount: totalAmount,
        currency: currency || 'VND',
        specialRequests: specialRequests || 'None'
      };

      const customerInfo = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      };

      const itemInfo = {
        title: itemTitle,
        id: itemId,
        slug: itemSlug
      };

      console.log('Sending admin notification...');
      await emailService.sendAdminBookingNotification(req.db, bookingForEmail, customerInfo, itemInfo, language || 'en');
      console.log('Admin notification sent');

      console.log('Sending customer confirmation...');
      await emailService.sendCustomerConfirmation(req.db, bookingForEmail, customerInfo, itemInfo, language || 'en');
      console.log('Customer confirmation sent');

      console.log('All email notifications sent successfully');
    } catch (emailError) {
      console.error('Email notification error:', emailError);
      console.error('Email error message:', emailError.message);
      console.error('Email error stack:', emailError.stack);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: `${bookingType === 'tour' ? 'Tour' : 'Service'} booking request submitted successfully. We will contact you soon!`,
      data: {
        bookingNumber: bookingNumber,
        bookingId: savedBooking.id,
        status: 'pending',
        itemTitle: itemTitle,
        type: bookingType
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking. Please try again.'
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let bookings;
    if (status) {
      bookings = await Booking.findByStatus(req.db, status);
    } else {
      bookings = await Booking.findAll(req.db);
    }

    // Add pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedBookings.map(booking => booking.toJSON()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(bookings.length / limit),
        totalItems: bookings.length
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'contacted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findById(req.db, id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Store old status for comparison
    const oldStatus = booking.status;

    // Update booking status
    await booking.updateStatus(req.db, status);

    // If status actually changed, send notification email to customer
    if (oldStatus !== status) {
      try {
        // Get tour or service details for email
        let tourOrService;
        if (booking.type === 'tour') {
          tourOrService = await Tour.findById(req.db, booking.itemId);
        } else if (booking.type === 'service') {
          tourOrService = await Service.findById(req.db, booking.itemId);
        }

        if (tourOrService) {
          const customerInfo = {
            name: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone
          };

          await emailService.sendBookingStatusUpdate(
            req.db,
            booking,
            customerInfo,
            tourOrService,
            status,
            notes
          );
        }
      } catch (emailError) {
        console.error('Status update email error:', emailError);
        // Don't fail the status update if email fails
      }
    }

    // Add note if provided
    if (notes && req.user) {
      try {
        const noteQuery = `
          INSERT INTO booking_notes (booking_id, content, created_by, created_at)
          VALUES (?, ?, ?, datetime('now'))
        `;
        await req.db.prepare(noteQuery).bind(id, notes, req.user.id).run();
      } catch (noteError) {
        console.error('Error adding note:', noteError);
      }
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking.toJSON()
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status'
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(req.db, id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get notes for this booking
    const notesQuery = `
      SELECT bn.*, u.name as created_by_name 
      FROM booking_notes bn
      LEFT JOIN users u ON bn.created_by = u.id
      WHERE bn.booking_id = ?
      ORDER BY bn.created_at DESC
    `;
    const notesResult = await req.db.prepare(notesQuery).bind(id).all();
    const notes = notesResult.results || [];

    const bookingData = booking.toJSON();
    bookingData.notes = notes;

    res.json({
      success: true,
      data: bookingData
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
};

// Add note to booking
const addBookingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    // Check if booking exists
    const booking = await Booking.findById(req.db, id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Add note
    const noteQuery = `
      INSERT INTO booking_notes (booking_id, content, created_by, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    const result = await req.db.prepare(noteQuery).bind(id, content.trim(), req.user.id).run();

    // Get the created note with user name
    const getNoteQuery = `
      SELECT bn.*, u.name as created_by_name 
      FROM booking_notes bn
      LEFT JOIN users u ON bn.created_by = u.id
      WHERE bn.id = ?
    `;
    const note = await req.db.prepare(getNoteQuery).bind(result.lastInsertRowid).first();

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: note
    });
  } catch (error) {
    console.error('Add booking note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note'
    });
  }
};

// Get booking statistics for dashboard
const getBookingStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as today_bookings,
        COUNT(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 END) as week_bookings
      FROM bookings
    `;

    const stats = await req.db.prepare(statsQuery).get();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking statistics'
    });
  }
};

module.exports = {
  createDirectBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingById,
  addBookingNote,
  getBookingStats
};
