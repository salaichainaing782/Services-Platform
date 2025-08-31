const mongoose = require('mongoose');
const Category = require('../models/categories/categoryModel');
const Product = require('../models/products/productModel');
const User = require('../models/users/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    const categories = [
      {
        name: 'Marketplace',
        slug: 'marketplace',
        description: 'New products and services from verified sellers',
        icon: 'shopping-bag',
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-600',
        sortOrder: 1,
        filters: {
          priceRanges: [
            { id: 'under-50', label: 'Under $50', min: 0, max: 50 },
            { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
            { id: '100-500', label: '$100 - $500', min: 100, max: 500 },
            { id: 'over-500', label: 'Over $500', min: 500, max: null }
          ],
          conditions: [
            { id: 'new', label: 'New' },
            { id: 'like-new', label: 'Like New' },
            { id: 'good', label: 'Good' }
          ]
        }
      },
      {
        name: 'Secondhand',
        slug: 'secondhand',
        description: 'Quality used items at great prices',
        icon: 'recycle',
        gradient: 'bg-gradient-to-r from-green-500 to-teal-600',
        sortOrder: 2,
        filters: {
          priceRanges: [
            { id: 'under-50', label: 'Under $50', min: 0, max: 50 },
            { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
            { id: '100-500', label: '$100 - $500', min: 100, max: 500 },
            { id: 'over-500', label: 'Over $500', min: 500, max: null }
          ],
          conditions: [
            { id: 'like-new', label: 'Like New' },
            { id: 'good', label: 'Good' },
            { id: 'fair', label: 'Fair' }
          ]
        }
      },
      {
        name: 'Jobs',
        slug: 'jobs',
        description: 'Find your next career opportunity',
        icon: 'briefcase',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-600',
        sortOrder: 3,
        filters: {
          jobTypes: [
            { id: 'full-time', label: 'Full-time' },
            { id: 'part-time', label: 'Part-time' },
            { id: 'contract', label: 'Contract' },
            { id: 'remote', label: 'Remote' }
          ],
          experienceLevels: [
            { id: 'entry', label: 'Entry Level' },
            { id: 'mid', label: 'Mid Level' },
            { id: 'senior', label: 'Senior Level' }
          ]
        }
      },
      {
        name: 'Travel',
        slug: 'travel',
        description: 'Plan your next adventure',
        icon: 'plane',
        gradient: 'bg-gradient-to-r from-orange-500 to-red-600',
        sortOrder: 4,
        filters: {
          tripTypes: [
            { id: 'flights', label: 'Flights' },
            { id: 'hotels', label: 'Hotels' },
            { id: 'packages', label: 'Packages' },
            { id: 'activities', label: 'Activities' }
          ]
        }
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    return createdCategories;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        username: 'admin',
        email: 'admin@markethub.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        location: 'Yangon, Myanmar'
      },
      {
        username: 'seller1',
        email: 'seller1@markethub.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'seller',
        isVerified: true,
        location: 'Yangon, Myanmar'
      },
      {
        username: 'user1',
        email: 'user1@markethub.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        isVerified: true,
        location: 'Mandalay, Myanmar'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded successfully');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedProducts = async (users, categories) => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const adminUser = users.find(u => u.role === 'admin');
    const sellerUser = users.find(u => u.role === 'seller');

    const products = [
      // Marketplace products
      {
        title: 'iPhone 15 Pro Max - 256GB',
        price: '$1,199',
        location: 'Yangon, Myanmar',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        category: 'marketplace',
        featured: true,
        description: 'Brand new iPhone 15 Pro Max with 256GB storage. Latest features including A17 Pro chip and titanium design.',
        condition: 'new',
        tags: ['electronics', 'smartphone', 'apple', 'iphone'],
        seller: sellerUser._id
      },
      {
        title: 'MacBook Air M2 - 13 inch',
        price: '$1,099',
        location: 'Yangon, Myanmar',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        category: 'marketplace',
        featured: true,
        description: 'Latest MacBook Air with M2 chip, 8GB RAM, and 256GB SSD. Perfect for work and creativity.',
        condition: 'new',
        tags: ['electronics', 'laptop', 'apple', 'macbook'],
        seller: sellerUser._id
      },
      {
        title: 'Samsung 4K Smart TV - 55 inch',
        price: '$699',
        location: 'Mandalay, Myanmar',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
        category: 'marketplace',
        description: 'Samsung 4K Ultra HD Smart TV with HDR and built-in streaming apps.',
        condition: 'new',
        tags: ['electronics', 'tv', 'samsung', '4k'],
        seller: sellerUser._id
      },

      // Secondhand products
      {
        title: 'Used iPhone 13 - 128GB',
        price: '$599',
        location: 'Yangon, Myanmar',
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
        category: 'secondhand',
        description: 'Good condition iPhone 13 with 128GB storage. Minor scratches on screen protector.',
        condition: 'good',
        tags: ['electronics', 'smartphone', 'apple', 'iphone', 'used'],
        seller: sellerUser._id
      },
      {
        title: 'Pre-owned Gaming Laptop',
        price: '$450',
        location: 'Yangon, Myanmar',
        rating: 4.0,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
        category: 'secondhand',
        description: 'Gaming laptop with RTX 3060, 16GB RAM, 512GB SSD. Great for gaming and work.',
        condition: 'like-new',
        tags: ['electronics', 'laptop', 'gaming', 'rtx', 'used'],
        seller: sellerUser._id
      },

      // Job listings
      {
        title: 'Senior Frontend Developer',
        price: '$3,500 - $5,000/month',
        location: 'Yangon, Myanmar',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
        category: 'jobs',
        description: 'We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies.',
        jobType: 'full-time',
        experience: 'senior',
        salary: '$3,500 - $5,000/month',
        tags: ['frontend', 'react', 'typescript', 'developer', 'senior'],
        seller: adminUser._id
      },
      {
        title: 'UX/UI Designer - Remote',
        price: '$2,500 - $4,000/month',
        location: 'Remote',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
        category: 'jobs',
        description: 'Creative UX/UI Designer needed for a fast-growing tech company. Remote work available.',
        jobType: 'remote',
        experience: 'mid',
        salary: '$2,500 - $4,000/month',
        tags: ['ux', 'ui', 'designer', 'remote', 'creative'],
        seller: adminUser._id
      },

      // Travel packages
      {
        title: 'Bagan Temple Tour Package',
        price: '$299',
        location: 'Bagan, Myanmar',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1548013146-79deddfb9cd4?w=500',
        category: 'travel',
        description: '3-day temple tour package in Bagan including accommodation, guide, and transportation.',
        tripType: 'packages',
        duration: '3 days',
        tags: ['travel', 'bagan', 'temples', 'myanmar', 'culture'],
        seller: adminUser._id
      },
      {
        title: 'Inle Lake Adventure',
        price: '$199',
        location: 'Inle Lake, Myanmar',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
        category: 'travel',
        description: '2-day adventure at Inle Lake with boat tours, fishing villages, and traditional crafts.',
        tripType: 'activities',
        duration: '2 days',
        tags: ['travel', 'inle', 'lake', 'adventure', 'myanmar'],
        seller: adminUser._id
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log('Products seeded successfully');

    // Update category product counts
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category.slug });
      await Category.findOneAndUpdate(
        { slug: category.slug },
        { productCount: count }
      );
    }

    return createdProducts;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const categories = await seedCategories();
    const users = await seedUsers();
    await seedProducts(users, categories);
    
    console.log('Database seeding completed successfully!');
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${users.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
