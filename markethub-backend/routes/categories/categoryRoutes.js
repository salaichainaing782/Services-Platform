// routes/categories/categoryRoutes.js

const express = require('express');
const router = express.Router();

// Placeholder category routes
router.get('/', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Marketplace',
      description: 'Buy and sell items',
      icon: '🛍️',
      gradient: 'from-blue-500 to-purple-600',
      productCount: 0
    },
    {
      id: '2',
      title: 'Secondhand',
      description: 'Used items in good condition',
      icon: '♻️',
      gradient: 'from-green-500 to-teal-600',
      productCount: 0
    },
    {
      id: '3',
      title: 'Jobs',
      description: 'Find your next opportunity',
      icon: '💼',
      gradient: 'from-orange-500 to-red-600',
      productCount: 0
    },
    {
      id: '4',
      title: 'Travel',
      description: 'Explore the world',
      icon: '✈️',
      gradient: 'from-indigo-500 to-blue-600',
      productCount: 0
    }
  ]);
});

router.get('/main', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Marketplace',
      description: 'Buy and sell items',
      icon: '🛍️',
      gradient: 'from-blue-500 to-purple-600',
      productCount: 0
    },
    {
      id: '2',
      title: 'Secondhand',
      description: 'Used items in good condition',
      icon: '♻️',
      gradient: 'from-green-500 to-teal-600',
      productCount: 0
    },
    {
      id: '3',
      title: 'Jobs',
      description: 'Find your next opportunity',
      icon: '💼',
      gradient: 'from-orange-500 to-red-600',
      productCount: 0
    },
    {
      id: '4',
      title: 'Travel',
      description: 'Explore the world',
      icon: '✈️',
      gradient: 'from-indigo-500 to-blue-600',
      productCount: 0
    }
  ]);
});

router.get('/by-slug/:slug', (req, res) => {
  const { slug } = req.params;
  const categories = {
    'marketplace': {
      id: '1',
      title: 'Marketplace',
      description: 'Buy and sell items',
      icon: '🛍️',
      gradient: 'from-blue-500 to-purple-600',
      productCount: 0
    },
    'secondhand': {
      id: '2',
      title: 'Secondhand',
      description: 'Used items in good condition',
      icon: '♻️',
      gradient: 'from-green-500 to-teal-600',
      productCount: 0
    },
    'jobs': {
      id: '3',
      title: 'Jobs',
      description: 'Find your next opportunity',
      icon: '💼',
      gradient: 'from-orange-500 to-red-600',
      productCount: 0
    },
    'travel': {
      id: '4',
      title: 'Travel',
      description: 'Explore the world',
      icon: '✈️',
      gradient: 'from-indigo-500 to-blue-600',
      productCount: 0
    }
  };

  const category = categories[slug];
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json(category);
});

router.get('/filters/:category', (req, res) => {
  const { category } = req.params;
  
  const filters = {
    marketplace: {
      condition: ['new', 'like-new', 'good', 'fair', 'poor'],
      priceRange: ['0-100', '100-500', '500-1000', '1000+']
    },
    secondhand: {
      condition: ['like-new', 'good', 'fair', 'poor'],
      priceRange: ['0-50', '50-200', '200-500', '500+']
    },
    jobs: {
      jobType: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      experience: ['entry', 'mid', 'senior', 'executive']
    },
    travel: {
      tripType: ['flights', 'hotels', 'packages', 'activities', 'transport'],
      duration: ['1-3 days', '4-7 days', '1-2 weeks', '2+ weeks']
    }
  };

  res.json(filters[category] || {});
});

module.exports = router;