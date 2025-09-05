const User = require('../../models/users/userModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// User registration
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName, phone, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      location
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userResponse = user.getPublicProfile();

    res.status(200).json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.role;
    delete updateData.isVerified;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user's products
const getUserProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch products directly by seller to avoid relying on user.products linkage
    const Product = require('../../models/products/productModel');
    const [products, total] = await Promise.all([
      Product.find({ seller: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments({ seller: req.user.id })
    ]);

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user's favorites
const getUserFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      options: {
        skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const total = user.favorites.length;

    res.status(200).json({
      products: user.favorites,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Add/Remove product from favorites
const toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    const Product = require('../../models/products/productModel');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const favoriteIndex = user.favorites.indexOf(productId);
    
    if (favoriteIndex > -1) {
      // Remove from favorites
      user.favorites.splice(favoriteIndex, 1);
      await Product.findByIdAndUpdate(productId, { $inc: { favorites: -1 } });
    } else {
      // Add to favorites
      user.favorites.push(productId);
      await Product.findByIdAndUpdate(productId, { $inc: { favorites: 1 } });
    }

    await user.save();

    res.status(200).json({
      message: favoriteIndex > -1 ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: favoriteIndex === -1
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserProducts,
  getUserFavorites,
  toggleFavorite
};
