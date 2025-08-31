// routes/users/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../../controllers/users/userController');
const { auth } = require('../../middleware/auth');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateUserProfileUpdate,
  validatePagination,
  validateIdParam
} = require('../../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, userController.registerUser);
router.post('/login', validateUserLogin, userController.loginUser);

// Protected routes (require authentication)
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, validateUserProfileUpdate, userController.updateUserProfile);
router.get('/products', auth, validatePagination, userController.getUserProducts);
router.get('/favorites', auth, validatePagination, userController.getUserFavorites);
router.post('/favorites/:productId', auth, validateIdParam('productId'), userController.toggleFavorite);

module.exports = router;