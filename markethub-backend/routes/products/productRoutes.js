// routes/products/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/products/productController');
const { auth, sellerAuth, adminAuth } = require('../../middleware/auth');
const { validateProduct, validatePagination, validateIdParam } = require('../../middleware/validation');

router.get('/', validatePagination, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/category/:category', validatePagination, productController.getProductsByCategory);
router.get('/:id', validateIdParam('id'), productController.getProductById);

router.post('/', auth, sellerAuth, validateProduct, productController.createProduct);
router.put('/:id', auth, validateIdParam('id'), validateProduct, productController.updateProduct);
router.delete('/:id', auth, validateIdParam('id'), productController.deleteProduct);

module.exports = router;