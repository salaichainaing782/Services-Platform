const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: ''
  },
  gradient: {
    type: String,
    default: 'bg-gradient-to-r from-blue-500 to-purple-600'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  productCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // Category-specific fields
  filters: {
    priceRanges: [{
      id: String,
      label: String,
      min: Number,
      max: Number
    }],
    conditions: [{
      id: String,
      label: String
    }],
    jobTypes: [{
      id: String,
      label: String
    }],
    experienceLevels: [{
      id: String,
      label: String
    }],
    tripTypes: [{
      id: String,
      label: String
    }]
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
