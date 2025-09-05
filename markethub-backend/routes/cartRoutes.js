const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(auth);

// GET /api/users/cart - Get user's cart
router.get('/', getCart);

// POST /api/users/cart - Add item to cart
router.post('/', addToCart);

// PUT /api/users/cart/:productId - Update cart item quantity
router.put('/:productId', updateCartItem);

// DELETE /api/users/cart/:productId - Remove item from cart
router.delete('/:productId', removeFromCart);

// DELETE /api/users/cart - Clear entire cart
router.delete('/', clearCart);

module.exports = router;