const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  getAdminStats,
  getAllUsers,
  getAllOrders,
  deleteUser,
  updateUserStatus
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminAuth);

// GET /api/admin/stats - Get admin statistics
router.get('/stats', getAdminStats);

// GET /api/admin/users - Get all users
router.get('/users', getAllUsers);

// GET /api/admin/orders - Get all orders
router.get('/orders', getAllOrders);

// DELETE /api/admin/users/:userId - Delete user
router.delete('/users/:userId', deleteUser);

// PUT /api/admin/users/:userId/status - Update user status
router.put('/users/:userId/status', updateUserStatus);

module.exports = router;