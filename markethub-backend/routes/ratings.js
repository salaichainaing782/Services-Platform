const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// Add or update rating for a product
router.post('/product/:productId', auth, ratingController.addRating);

// Get ratings for a product
router.get('/product/:productId', ratingController.getProductRatings);

module.exports = router;