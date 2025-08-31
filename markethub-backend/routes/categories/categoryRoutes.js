// routes/categories/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categories/categoryController');
const { auth, adminAuth } = require('../../middleware/auth');
const { 
  validateCategory,
  validateCategorySlug,
  validateCategoryFilters,
  validateIdParam
} = require('../../middleware/validation');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/main', categoryController.getMainCategories);
router.get('/filters/:slug', validateCategoryFilters, categoryController.getCategoryFilters);
router.get('/by-slug/:slug', validateCategorySlug, categoryController.getCategoryBySlug);

// Admin only routes
router.post('/', auth, adminAuth, validateCategory, categoryController.createCategory);
router.put('/:id', auth, adminAuth, validateIdParam('id'), validateCategory, categoryController.updateCategory);
router.delete('/:id', auth, adminAuth, validateIdParam('id'), categoryController.deleteCategory);

module.exports = router;