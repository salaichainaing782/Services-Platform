const Rating = require('../models/Rating');
const Product = require('../models/products/productModel');

// Add or update rating
const addRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user already rated this product
    let existingRating = await Rating.findOne({ productId, userId });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || '';
      await existingRating.save();
    } else {
      // Create new rating
      existingRating = new Rating({
        productId,
        userId,
        rating,
        review: review || ''
      });
      await existingRating.save();
    }

    // Update product rating statistics
    await updateProductRating(productId);

    res.json({ message: 'Rating submitted successfully', rating: existingRating });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get ratings for a product
const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ productId })
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ productId });

    res.json({
      ratings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product rating statistics
const updateProductRating = async (productId) => {
  try {
    const ratings = await Rating.find({ productId });
    const totalReviews = ratings.length;
    
    if (totalReviews === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        totalReviews: 0
      });
      return;
    }

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = {
  addRating,
  getProductRatings
};