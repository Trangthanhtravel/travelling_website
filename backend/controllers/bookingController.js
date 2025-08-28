const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const Service = require('../models/Service');
const nodemailer = require('nodemailer');

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send booking notification to staff
const sendStaffNotification = async (booking, customerInfo, tourOrService) => {
  try {
    const transporter = createEmailTransporter();
    
    const emailTemplate = `
      <h2>New Booking Received - ${tourOrService.title}</h2>
      <p>A new booking has been submitted through the website.</p>
      
      <h3>Customer Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${customerInfo.name}</li>
        <li><strong>Email:</strong> ${customerInfo.email}</li>
        <li><strong>Phone:</strong> ${customerInfo.phone}</li>
      </ul>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>${booking.type === 'tour' ? 'Tour' : 'Service'}:</strong> ${tourOrService.title}</li>
        <li><strong>Start Date:</strong> ${booking.startDate}</li>
        <li><strong>Travelers:</strong> ${booking.totalTravelers}</li>
        <li><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</li>
        ${booking.specialRequests ? `<li><strong>Special Requests:</strong> ${booking.specialRequests}</li>` : ''}
      </ul>
      
      <p>Please contact the customer to confirm this booking.</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.STAFF_EMAIL || process.env.EMAIL_USER,
      subject: `New Booking - ${booking.bookingNumber}`,
      html: emailTemplate
    });
  } catch (error) {
    console.error('Staff email sending error:', error);
  }
};

// Send confirmation email to customer
const sendCustomerConfirmation = async (booking, customerInfo, tourOrService) => {
  try {
    const transporter = createEmailTransporter();
    
    const emailTemplate = `
      <h2>Booking Request Received - ${tourOrService.title}</h2>
      <p>Dear ${customerInfo.name},</p>
      <p>Thank you for your booking request! We have received your information and will contact you soon to confirm your booking.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Booking Number:</strong> ${booking.bookingNumber}</li>
        <li><strong>${booking.type === 'tour' ? 'Tour' : 'Service'}:</strong> ${tourOrService.title}</li>
        <li><strong>Start Date:</strong> ${booking.startDate}</li>
        <li><strong>Travelers:</strong> ${booking.totalTravelers}</li>
        <li><strong>Total Amount:</strong> ${booking.currency} ${booking.totalAmount}</li>
      </ul>
      
      <p>Our team will contact you within 24 hours to confirm your booking and provide payment instructions.</p>
      <p>Best regards,<br>${process.env.COMPANY_NAME || 'Travel Company'}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerInfo.email,
      subject: `Booking Request Received - ${booking.bookingNumber}`,
      html: emailTemplate
    });
  } catch (error) {
    console.error('Customer email sending error:', error);
  }
};

// Create booking without user account
const createDirectBooking = async (req, res) => {
  try {
    const {
      type, // 'tour' or 'service'
      itemId, // tour or service ID
      customerInfo, // { name, email, phone }
      bookingDetails, // { startDate, totalTravelers, specialRequests }
      pricing // { totalAmount, currency }
    } = req.body;

    // Validate required fields
    if (!type || !itemId || !customerInfo || !bookingDetails || !pricing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Get tour or service details
    let tourOrService;
    if (type === 'tour') {
      tourOrService = await Tour.findBySlug(req.db, itemId);
    } else if (type === 'service') {
      tourOrService = await Service.findBySlug(req.db, itemId);
    }

    if (!tourOrService) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    // Create booking object
    const bookingData = {
      bookingNumber: `BK${Date.now()}`,
      type,
      itemId,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      startDate: bookingDetails.startDate,
      totalTravelers: bookingDetails.totalTravelers,
      specialRequests: bookingDetails.specialRequests || null,
      totalAmount: pricing.totalAmount,
      currency: pricing.currency || 'USD',
      status: 'pending',
      createdAt: new Date()
    };

    const booking = new Booking(bookingData);
    await booking.save(req.db);

    // Send emails
    await Promise.all([
      sendStaffNotification(booking, customerInfo, tourOrService),
      sendCustomerConfirmation(booking, customerInfo, tourOrService)
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. We will contact you soon!',
      bookingNumber: booking.bookingNumber
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll(req.db);
    res.json({
      success: true,
      data: bookings.map(booking => booking.toJSON())
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
    const { status } = req.body;

    const booking = await Booking.findById(req.db, id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.updateStatus(req.db, status);

    res.json({
      success: true,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status'
    });
  }
};

module.exports = {
  createDirectBooking,
  getAllBookings,
  updateBookingStatus
};
