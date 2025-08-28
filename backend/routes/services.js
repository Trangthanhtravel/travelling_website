const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { requireAuth, adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', serviceController.getServices);
router.get('/:slug', serviceController.getServiceBySlug);

// Protected routes for customers
router.post('/bookings', requireAuth, serviceController.createServiceBooking);
router.get('/bookings/my', requireAuth, serviceController.getUserServiceBookings);

// Admin routes for service management
router.post('/admin/services', adminAuth, serviceController.upload.array('images', 10), serviceController.createService);
router.put('/admin/services/:id', adminAuth, serviceController.upload.array('images', 10), serviceController.updateService);
router.delete('/admin/services/:id', adminAuth, serviceController.deleteService);
router.patch('/admin/services/:id/status', adminAuth, serviceController.updateServiceStatus);

// Admin routes for booking management
router.get('/admin/bookings', adminAuth, serviceController.getAllServiceBookings);
router.patch('/admin/bookings/:id/status', adminAuth, serviceController.updateServiceBookingStatus);

module.exports = router;
