// controllers/productController.js

// Model ကို import လုပ်ခြင်း
const Product = require('../../models/products/productModel');
const User = require('../../models/users/userModel');
const { validationResult } = require('express-validator');

// Get all products with filtering, pagination, and search
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      location,
      condition,
      jobType,
      experience,
      tripType,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (condition) filter.condition = condition;
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experience = experience;
    if (tripType) filter.tripType = tripType;

    // Price filtering
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('seller', 'username firstName lastName avatar rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Transform data to match frontend interface
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      location: product.location,
      rating: product.rating,
      image: product.image,
      category: product.category,
      featured: product.featured,
      description: product.description,
      condition: product.condition,
      jobType: product.jobType,
      experience: product.experience,
      salary: product.salary,
      tripType: product.tripType,
      duration: product.duration,
      tags: product.tags,
      views: product.views,
      favorites: product.favorites,
      seller: product.seller,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      products: transformedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('seller', 'username firstName lastName avatar rating totalReviews')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    await Product.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Transform to match frontend interface
    const transformedProduct = {
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      location: product.location,
      rating: product.rating,
      image: product.image,
      category: product.category,
      featured: product.featured,
      description: product.description,
      condition: product.condition,
      jobType: product.jobType,
      experience: product.experience,
      salary: product.salary,
      tripType: product.tripType,
      duration: product.duration,
      tags: product.tags,
      views: product.views + 1, // Include the incremented view
      favorites: product.favorites,
      seller: product.seller,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.status(200).json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = req.body;
    
    // Set seller from authenticated user
    productData.seller = req.user.id;

    const newProduct = new Product(productData);
    await newProduct.save();

    // Populate seller info
    await newProduct.populate('seller', 'username firstName lastName avatar');

    const transformedProduct = {
      id: newProduct._id.toString(),
      title: newProduct.title,
      price: newProduct.price,
      location: newProduct.location,
      rating: newProduct.rating,
      image: newProduct.image,
      category: newProduct.category,
      featured: newProduct.featured,
      description: newProduct.description,
      condition: newProduct.condition,
      jobType: newProduct.jobType,
      experience: newProduct.experience,
      salary: newProduct.salary,
      tripType: newProduct.tripType,
      duration: newProduct.duration,
      tags: newProduct.tags,
      views: newProduct.views,
      favorites: newProduct.favorites,
      seller: newProduct.seller,
      createdAt: newProduct.createdAt
    };

    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product with this title already exists' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'username firstName lastName avatar');

    const transformedProduct = {
      id: updatedProduct._id.toString(),
      title: updatedProduct.title,
      price: updatedProduct.price,
      location: updatedProduct.location,
      rating: updatedProduct.rating,
      image: updatedProduct.image,
      category: updatedProduct.category,
      featured: updatedProduct.featured,
      description: updatedProduct.description,
      condition: updatedProduct.condition,
      jobType: updatedProduct.jobType,
      experience: updatedProduct.experience,
      salary: updatedProduct.salary,
      tripType: updatedProduct.tripType,
      duration: updatedProduct.duration,
      tags: updatedProduct.tags,
      views: updatedProduct.views,
      favorites: updatedProduct.favorites,
      seller: updatedProduct.seller,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };

    res.status(200).json(transformedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featuredProducts = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
    .populate('seller', 'username firstName lastName avatar rating')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

    const transformedProducts = featuredProducts.map(product => ({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      location: product.location,
      rating: product.rating,
      image: product.image,
      category: product.category,
      featured: product.featured,
      description: product.description,
      condition: product.condition,
      jobType: product.jobType,
      experience: product.experience,
      salary: product.salary,
      tripType: product.tripType,
      duration: product.duration,
      tags: product.tags,
      views: product.views,
      favorites: product.favorites,
      seller: product.seller,
      createdAt: product.createdAt
    }));

    res.status(200).json(transformedProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { category, status: 'active' };
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('seller', 'username firstName lastName avatar rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      title: product.title,
      price: product.price,
      location: product.location,
      rating: product.rating,
      image: product.image,
      category: product.category,
      featured: product.featured,
      description: product.description,
      condition: product.condition,
      jobType: product.jobType,
      experience: product.experience,
      salary: product.salary,
      tripType: product.tripType,
      duration: product.duration,
      tags: product.tags,
      views: product.views,
      favorites: product.favorites,
      seller: product.seller,
      createdAt: product.createdAt
    }));

    res.status(200).json({
      products: transformedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory
};