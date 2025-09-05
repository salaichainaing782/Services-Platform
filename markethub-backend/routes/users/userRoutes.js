// routes/users/userRoutes.js

const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getUserProfile, updateUserProfile, getUserProducts, getUserFavorites, toggleFavorite } = require('../../controllers/users/userController');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const User = require('../../models/users/userModel');
const { generateToken } = require('../../utils/jwt');

const router = express.Router();

// Google OAuth routes
router.get('/auth/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=openid email profile&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  res.json({ authUrl: googleAuthUrl });
});

router.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', tokenData);
      return res.status(400).json({ message: 'Failed to exchange authorization code' });
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();
    
    if (!userInfoResponse.ok) {
      console.error('Failed to get user info from Google:', userInfo);
      return res.status(400).json({ message: 'Failed to get user information' });
    }

    // Check if user exists
    let user = await User.findOne({ email: userInfo.email });
    
    if (!user) {
      // Create new user
      user = new User({
        username: userInfo.email.split('@')[0] + '_' + Date.now(),
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        isVerified: true,
        googleId: userInfo.id,
        avatar: userInfo.picture,
      });
      
      await user.save();
    } else {
      // Update existing user with Google info
      user.googleId = userInfo.id;
      user.avatar = userInfo.picture;
      user.isVerified = true;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);
    const userResponse = user.getPublicProfile();

    res.status(200).json({
      message: 'Google login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Regular auth routes
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
], registerUser);

router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], loginUser);

router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email')
], updateUserProfile);

// User product/favorites routes
router.get('/products', auth, getUserProducts);
router.get('/favorites', auth, getUserFavorites);
router.post('/favorites/:productId', auth, toggleFavorite);

// Admin routes (simplified)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;