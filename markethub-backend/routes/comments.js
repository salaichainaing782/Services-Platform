const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Get comments for a product
router.get('/product/:productId', optionalAuth, async (req, res) => {
  try {
    const comments = await Comment.find({ productId: req.params.productId, parentId: null })
      .populate('userId', 'firstName lastName')
      .populate({
        path: 'replies',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .sort({ createdAt: -1 })
      .lean();
    
    // Add isLiked status for authenticated user
    const userId = req.user?.id;
    const commentsWithLikeStatus = comments.map(comment => ({
      ...comment,
      isLiked: userId && comment.likes ? comment.likes.some(likeId => likeId.toString() === userId) : false,
      replies: comment.replies?.map(reply => ({
        ...reply,
        isLiked: userId && reply.likes ? reply.likes.some(likeId => likeId.toString() === userId) : false
      })) || []
    }));
    
    res.json(commentsWithLikeStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment or reply
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({
      productId: req.body.productId,
      userId: req.user.id,
      text: req.body.text,
      parentId: req.body.parentId || null
    });
    await comment.save();
    await comment.populate('userId', 'firstName lastName');
    
    // If this is a reply, add it to parent's replies array
    if (req.body.parentId) {
      await Comment.findByIdAndUpdate(
        req.body.parentId,
        { $push: { replies: comment._id } }
      );
    }
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle like on comment
router.post('/:commentId/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const userId = req.user.id;
    
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }
    
    await comment.save();
    res.json({ likes: comment.likes.length, isLiked: comment.likes.includes(userId) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;