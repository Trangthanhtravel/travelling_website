const express = require('express');
const router = express.Router();
const adminManagementController = require('../controllers/adminManagementController');
const { superAdminAuth } = require('../middleware/auth');

// All routes require super admin authentication
router.use(superAdminAuth);

// Get all admins
router.get('/', adminManagementController.getAllAdmins);

// Create new admin
router.post('/', adminManagementController.createAdmin);

// Update admin
router.put('/:id', adminManagementController.updateAdmin);

// Delete admin (soft delete)
router.delete('/:id', adminManagementController.deleteAdmin);

// Reset admin password
router.post('/:id/reset-password', adminManagementController.resetAdminPassword);

module.exports = router;

