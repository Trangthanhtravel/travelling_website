const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { requireAuth, adminAuth, superAdminAuth } = require('../middleware/auth');
const { createAuditMiddleware } = require('../middleware/auditLog');

// Public routes
router.get('/', serviceController.getServices);
router.get('/:slug', serviceController.getServiceBySlug);

// Protected routes for customers
router.post('/bookings', requireAuth, serviceController.createServiceBooking);
router.get('/bookings/my', requireAuth, serviceController.getUserServiceBookings);

// Admin routes for service management
router.post('/admin/services', adminAuth, createAuditMiddleware('create', 'service'), serviceController.upload.single('image'), serviceController.createService);
router.put('/admin/services/:id', adminAuth, createAuditMiddleware('update', 'service'), serviceController.upload.single('image'), serviceController.updateService);
router.delete('/admin/services/:id', superAdminAuth, createAuditMiddleware('delete', 'service'), serviceController.deleteService);
router.patch('/admin/services/:id/status', adminAuth, createAuditMiddleware('update', 'service'), serviceController.updateServiceStatus);

// Admin routes for service gallery management (keep as array for gallery)
router.put('/admin/services/:id/gallery', adminAuth, createAuditMiddleware('update', 'service'), serviceController.upload.array('images', 10), serviceController.updateServiceGallery);
router.delete('/admin/services/:id/gallery/:photoUrl', superAdminAuth, createAuditMiddleware('update', 'service'), serviceController.deleteServiceGalleryPhoto);

// Admin routes for booking management
router.get('/admin/bookings', adminAuth, serviceController.getAllServiceBookings);
router.patch('/admin/bookings/:id/status', adminAuth, serviceController.updateServiceBookingStatus);

module.exports = router;
