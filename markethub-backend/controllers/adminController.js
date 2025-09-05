const User = require('../models/users/userModel');
const Product = require('../models/products/productModel');
const Order = require('../models/Order');

// Get admin statistics
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueResult] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithId = users.map(user => ({
      ...user.toObject(),
      id: user._id.toString(),
      isActive: user.isActive !== false // Default to true if not set
    }));

    res.json({ users: usersWithId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const ordersWithId = orders.map(order => ({
      ...order.toObject(),
      id: order._id.toString(),
      status: order.overallStatus
    }));

    res.json({ orders: ordersWithId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deactivating admin users
    if (user.role === 'admin' && !isActive) {
      return res.status(403).json({ message: 'Cannot deactivate admin users' });
    }

    await User.findByIdAndUpdate(userId, { isActive });
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  getAllOrders,
  deleteUser,
  updateUserStatus
};