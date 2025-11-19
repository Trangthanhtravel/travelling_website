const express = require('express');
const router = express.Router();
const { adminAuth, superAdminAuth } = require('../middleware/auth');
const {
  getActivityLogs,
  getActivityStats,
  cleanupOldLogs
} = require('../controllers/activityLogController');

// All routes require at least admin authentication
router.get('/', adminAuth, getActivityLogs);
router.get('/stats', adminAuth, getActivityStats);

// Only super admins can cleanup logs
router.post('/cleanup', superAdminAuth, cleanupOldLogs);

module.exports = router;

