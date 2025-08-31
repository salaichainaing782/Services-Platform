// middleware/validation.js

const { body, param, query } = require('express-validator');

// Product validation
const validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('price')
    .optional()
    .isString()
    .withMessage('Price must be a string'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('image')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('category')
    .isIn(['marketplace', 'secondhand', 'jobs', 'travel'])
    .withMessage('Invalid category'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  body('jobType')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'remote', 'internship'])
    .withMessage('Invalid job type'),
  body('experience')
    .optional()
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level'),
  body('salary')
    .optional()
    .isString()
    .withMessage('Salary must be a string'),
  body('tripType')
    .optional()
    .isIn(['flights', 'hotels', 'packages', 'activities', 'transport'])
    .withMessage('Invalid trip type'),
  body('duration')
    .optional()
    .isString()
    .withMessage('Duration must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be less than 50 characters')
];

// User registration validation
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Must be a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User profile update validation
const validateUserProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Must be a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters')
];

// Category validation
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('slug')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase, alphanumeric and hyphens only'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string'),
  body('gradient')
    .optional()
    .isString()
    .withMessage('Gradient must be a string'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid MongoDB ID'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['title', 'price', 'rating', 'createdAt', 'views', 'favorites'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Flexible ID parameter validation function
const validateIdParam = (fieldName = 'id') => [
  param(fieldName)
    .isMongoId()
    .withMessage(`Invalid MongoDB ID format for '${fieldName}'`)
];

// Category slug validation
const validateCategorySlug = [
  param('slug')
    .isIn(['marketplace', 'secondhand', 'jobs', 'travel'])
    .withMessage('Invalid category slug')
];

// Category filters validation
const validateCategoryFilters = [
  param('slug')
    .isIn(['marketplace', 'secondhand', 'jobs', 'travel'])
    .withMessage('Invalid category slug')
];

module.exports = {
  validateProduct,
  validateUserRegistration,
  validateUserLogin,
  validateUserProfileUpdate,
  validateCategory,
  validatePagination,
  validateIdParam, // Use the new flexible function
  validateCategorySlug,
  validateCategoryFilters
};