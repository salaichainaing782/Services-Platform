const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['marketplace', 'secondhand', 'jobs', 'travel'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  // Additional fields for different categories
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: function() { return this.category === 'secondhand'; }
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
    required: function() { return this.category === 'jobs'; }
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: function() { return this.category === 'jobs'; }
  },
  salary: {
    type: String,
    required: function() { return this.category === 'jobs'; }
  },
  tripType: {
    type: String,
    enum: ['flights', 'hotels', 'packages', 'activities', 'transport'],
    required: function() { return this.category === 'travel'; }
  },
  duration: {
    type: String,
    required: function() { return this.category === 'travel'; }
  },
  // Common fields
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
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better search performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ location: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;