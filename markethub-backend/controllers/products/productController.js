// controllers/productController.js

// Model ကို import လုပ်ခြင်း
const Product = require('../../models/products/productModel');
const User = require('../../models/users/userModel');
const Comment = require('../../models/Comment');
const { validationResult } = require('express-validator');

// Get all products with pagination, search, and filtering
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    // Build query object
    let query = { quantity: { $gt: 0 } }; // Only show products with stock > 0

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Category filter
    if (req.query.category) {
      const categories = req.query.category.split(',');
      query.category = { $in: categories };
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Location filter
    if (req.query.location) {
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    // Condition filter (for secondhand)
    if (req.query.condition) {
      query.condition = req.query.condition;
    }

    // Job type filter
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }

    // Experience filter
    if (req.query.experience) {
      query.experience = req.query.experience;
    }

    // Trip type filter
    if (req.query.tripType) {
      query.tripType = req.query.tripType;
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.featured = true;
    }

    // Build sort object
    let sort = { createdAt: -1 }; // default sort
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const products = await Product.find(query)
      .populate('seller', 'username firstName lastName avatar rating')
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product,
      id: product._id.toString()
    }));

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      products: productsWithId,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    const products = await Product.find({ featured: true, quantity: { $gt: 0 } })
      .populate('seller', 'username firstName lastName avatar rating')
      .limit(limit)
      .sort({ views: -1, createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get products by category with sorting
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;
    const userId = req.user?.id; // Get user ID if authenticated

    // Build sort object
    let sort = { createdAt: -1 }; // default sort
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort = { [req.query.sortBy]: sortOrder };
    }

    const products = await Product.find({ category, quantity: { $gt: 0 } })
      .populate('seller', 'username firstName lastName avatar rating')
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean();

    // Add id field, like status, and comment count for frontend compatibility
    const productsWithId = await Promise.all(products.map(async product => {
      const commentCount = await Comment.countDocuments({ productId: product._id });
      return {
        ...product,
        id: product._id.toString(),
        isLiked: userId && product.likes ? product.likes.some(likeId => likeId.toString() === userId) : false,
        commentsCount: commentCount
      };
    }));

    const total = await Product.countDocuments({ category, quantity: { $gt: 0 } });
    const totalPages = Math.ceil(total / limit);

    res.json({
      products: productsWithId,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username firstName lastName avatar rating')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Add id field for frontend compatibility
    const productWithId = {
      ...product,
      id: product._id.toString()
    };

    res.json(productWithId);
  } catch (error) {
    console.error('Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    // Clean price field - remove $ sign and convert to number
    let cleanedData = { ...req.body };
    if (cleanedData.price) {
      cleanedData.price = parseFloat(cleanedData.price.toString().replace(/[$,]/g, ''));
    }
    if (cleanedData.salary) {
      cleanedData.salary = parseFloat(cleanedData.salary.toString().replace(/[$,]/g, ''));
    }

    const productData = {
      ...cleanedData,
      seller: req.user.id
    };

    const product = new Product(productData);
    await product.save();

    // Link product to user's products array for quick access
    try {
      await User.findByIdAndUpdate(req.user.id, { $push: { products: product._id } });
    } catch (linkErr) {
      console.error('Warning: failed to link product to user.products:', linkErr);
    }

    const populatedProduct = await Product.findById(product._id)
      .populate('seller', 'username firstName lastName avatar rating');

    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Clean price field - remove $ sign and convert to number
    let cleanedData = { ...req.body };
    if (cleanedData.price) {
      cleanedData.price = parseFloat(cleanedData.price.toString().replace(/[$,]/g, ''));
    }
    if (cleanedData.salary) {
      cleanedData.salary = parseFloat(cleanedData.salary.toString().replace(/[$,]/g, ''));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      cleanedData,
      { new: true, runValidators: true }
    ).populate('seller', 'username firstName lastName avatar rating');

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns the product or is admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Remove from user's products array
    try {
      await User.findByIdAndUpdate(req.user.id, { $pull: { products: req.params.id } });
    } catch (linkErr) {
      console.error('Warning: failed to unlink product from user.products:', linkErr);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Increment product views
const incrementProductViews = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'View counted', views: product.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementProductViews
};