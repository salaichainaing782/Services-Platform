const express = require('express');
const router = express.Router();
const Product = require('../models/products/productModel');
const auth = require('../middleware/auth');

// Toggle like on product
router.post('/product/:productId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const isLiked = product.likes && product.likes.includes(userId);
    
    let updatedProduct;
    if (isLiked) {
      updatedProduct = await Product.findByIdAndUpdate(
        req.params.productId,
        { $pull: { likes: userId } },
        { new: true, runValidators: false }
      );
    } else {
      updatedProduct = await Product.findByIdAndUpdate(
        req.params.productId,
        { $addToSet: { likes: userId } },
        { new: true, runValidators: false }
      );
    }
    
    res.json({ 
      likes: updatedProduct.likes ? updatedProduct.likes.length : 0, 
      isLiked: !isLiked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;