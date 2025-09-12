// routes/products/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/products/productController');
const Product = require('../../models/products/productModel');
const auth = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', optionalAuth, productController.getProductsByCategory);

// Increment views for a product (must be before /:id route)
router.post('/:id/view', productController.incrementProductViews);

router.get('/:id', optionalAuth, productController.getProductById);

// Get price range for category
router.get('/range/:category', productController.getPriceRange);

// Purchase product (decrement quantity)
router.post('/:id/purchase', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body || {};
    const q = parseInt(quantity, 10) || 1;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.quantity < q) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    product.quantity -= q;
    await product.save();
    res.json({ message: 'Purchase successful', product });
  } catch (e) {
    console.error('Purchase error:', e);
    res.status(500).json({ message: 'Failed to purchase' });
  }
});

// Protected routes
router.post('/', auth, productController.createProduct);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;