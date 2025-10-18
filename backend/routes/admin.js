const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getProfile,
  getAllUsers,
  updateUserRole,
  upload,
  uploadImage,
  uploadImages,
  deleteImage,
  createContent,
  updateContent,
  deleteContent,
  getAllContent
} = require('../controllers/adminController');

const {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats
} = require('../controllers/tourController');

// Dashboard routes
router.get('/dashboard', adminAuth, getDashboardStats);

// Profile route (for token verification on page refresh)
router.get('/profile', adminAuth, getProfile);

// User management routes
router.get('/users', adminAuth, getAllUsers);
router.put('/users/:userId/role', adminAuth, updateUserRole);

// Image management routes
router.post('/upload-image', adminAuth, upload.single('image'), uploadImage);
router.post('/upload-images', adminAuth, upload.array('images', 10), uploadImages);
router.delete('/delete-image', adminAuth, deleteImage);

// Content management routes
router.get('/content', adminAuth, getAllContent);
router.post('/content', adminAuth, createContent);
router.put('/content/:contentId', adminAuth, upload.single('image'), updateContent);
router.delete('/content/:contentId', adminAuth, deleteContent);

// Tour management routes
router.get('/tours', adminAuth, getTours);
router.get('/tours/stats', adminAuth, getTourStats);
router.get('/tours/:id', adminAuth, getTour);
router.post('/tours', adminAuth, createTour);
router.put('/tours/:id', adminAuth, updateTour);
router.delete('/tours/:id', adminAuth, deleteTour);

module.exports = router;
