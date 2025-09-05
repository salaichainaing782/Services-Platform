const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['marketplace', 'secondhand', 'jobs', 'travel']
  },
  image: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Job-specific fields
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote', 'internship']
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive']
  },
  salary: {
    type: Number,
    min: 0
  },
  // Travel-specific fields
  tripType: {
    type: String,
    enum: ['flights', 'hotels', 'packages', 'activities', 'transport']
  },
  duration: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ views: -1 });
productSchema.index({ rating: -1 });

module.exports = mongoose.model('Product', productSchema);