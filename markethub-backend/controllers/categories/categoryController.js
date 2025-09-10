const Category = require('../../models/categories/categoryModel');
const Product = require('../../models/products/productModel');
const { validationResult } = require('express-validator');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Transform to match frontend interface
    const transformedCategories = categories.map(category => ({
      id: category._id.toString(),
      title: category.name,
      description: category.description,
      icon: category.icon,
      gradient: category.gradient,
      subcategories: category.subcategories,
      productCount: category.productCount
    }));

    res.status(200).json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug, isActive: true })
      .populate('subcategories')
      .lean();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get main categories (parent categories)
const getMainCategories = async (req, res) => {
  try {
    const mainCategories = await Category.find({ 
      parentCategory: null, 
      isActive: true 
    })
    .populate('subcategories')
    .sort({ sortOrder: 1, name: 1 })
    .lean();

    // Transform to match frontend CategoryCard interface
    const transformedCategories = mainCategories.map(category => ({
      id: category._id.toString(),
      title: category.name,
      description: category.description,
      icon: category.icon,
      gradient: category.gradient,
      subcategories: category.subcategories,
      productCount: category.productCount
    }));

    res.status(200).json(transformedCategories);
  } catch (error) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get category filters (for SearchFilters component)
const getCategoryFilters = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'Category parameter is required' });
    }
    
    const categoryData = await Category.findOne({ 
      slug: category, 
      isActive: true 
    }).lean();

    if (!categoryData) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get filter options based on category
    let filters = {};

    switch (category) {
      case 'marketplace':
        filters = {
          'Price Range': [
            { id: 'under-50', label: 'Under $50', count: await getProductCountByPriceRange(category, 0, 50) },
            { id: '50-100', label: '$50 - $100', count: await getProductCountByPriceRange(category, 50, 100) },
            { id: '100-500', label: '$100 - $500', count: await getProductCountByPriceRange(category, 100, 500) },
            { id: 'over-500', label: 'Over $500', count: await getProductCountByPriceRange(category, 500, null) }
          ],
          'Condition': [
            { id: 'new', label: 'New', count: await getProductCountByCondition(category, 'new') },
            { id: 'like-new', label: 'Like New', count: await getProductCountByCondition(category, 'like-new') },
            { id: 'good', label: 'Good', count: await getProductCountByCondition(category, 'good') }
          ]
        };
        break;

      case 'jobs':
        filters = {
          'Job Type': [
            { id: 'full-time', label: 'Full-time', count: await getProductCountByJobType(category, 'full-time') },
            { id: 'part-time', label: 'Part-time', count: await getProductCountByJobType(category, 'part-time') },
            { id: 'contract', label: 'Contract', count: await getProductCountByJobType(category, 'contract') },
            { id: 'remote', label: 'Remote', count: await getProductCountByJobType(category, 'remote') }
          ],
          'Experience': [
            { id: 'entry', label: 'Entry Level', count: await getProductCountByExperience(category, 'entry') },
            { id: 'mid', label: 'Mid Level', count: await getProductCountByExperience(category, 'mid') },
            { id: 'senior', label: 'Senior Level', count: await getProductCountByExperience(category, 'senior') }
          ]
        };
        break;

      case 'travel':
        filters = {
          'Trip Type': [
            { id: 'flights', label: 'Flights', count: await getProductCountByTripType(category, 'flights') },
            { id: 'hotels', label: 'Hotels', count: await getProductCountByTripType(category, 'hotels') },
            { id: 'packages', label: 'Packages', count: await getProductCountByTripType(category, 'packages') },
            { id: 'activities', label: 'Activities', count: await getProductCountByTripType(category, 'activities') }
          ]
        };
        break;

      default:
        filters = {};
    }

    res.status(200).json(filters);
  } catch (error) {
    console.error('Error fetching category filters:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Helper functions for getting product counts
const getProductCountByPriceRange = async (category, min, max) => {
  const filter = { category, status: 'active' };
  if (max) {
    filter.price = { $gte: min, $lt: max };
  } else {
    filter.price = { $gte: min };
  }
  return await Product.countDocuments(filter);
};

const getProductCountByCondition = async (category, condition) => {
  return await Product.countDocuments({ category, condition, status: 'active' });
};

const getProductCountByJobType = async (category, jobType) => {
  return await Product.countDocuments({ category, jobType, status: 'active' });
};

const getProductCountByExperience = async (category, experience) => {
  return await Product.countDocuments({ category, experience, status: 'active' });
};

const getProductCountByTripType = async (category, tripType) => {
  return await Product.countDocuments({ category, tripType, status: 'active' });
};

// Create new category (admin only)
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create categories' });
    }

    const categoryData = req.body;
    const newCategory = new Category(categoryData);
    await newCategory.save();

    res.status(201).json({
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update categories' });
    }

    const { id } = req.params;
    const updateData = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete categories' });
    }

    const { id } = req.params;

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing products' 
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  getMainCategories,
  getCategoryFilters,
  createCategory,
  updateCategory,
  deleteCategory
};
