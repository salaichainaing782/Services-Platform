const mongoose = require('mongoose');
const Product = require('../models/products/productModel');
const User = require('../models/users/userModel');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

const addSampleProducts = async () => {
  try {
    await connectDB();

    // Find any existing user to be the seller
    let seller = await User.findOne();
    
    if (!seller) {
      console.log('No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using seller: ${seller.firstName} ${seller.lastName}`);

    // Sample products
    const sampleProducts = [
      {
        title: 'iPhone 13 Pro Max',
        description: 'Brand new iPhone 13 Pro Max with 256GB storage.',
        price: 999.99,
        category: 'marketplace',
        image: 'https://placehold.co/400x400/007bff/ffffff?text=iPhone+13',
        location: 'New York, NY',
        condition: 'new',
        quantity: 5,
        seller: seller._id,
        featured: true
      },
      {
        title: 'MacBook Air M2',
        description: 'Lightly used MacBook Air with M2 chip.',
        price: 899.99,
        category: 'secondhand',
        image: 'https://placehold.co/400x400/28a745/ffffff?text=MacBook+Air',
        location: 'San Francisco, CA',
        condition: 'like-new',
        quantity: 2,
        seller: seller._id
      }
    ];

    // Insert sample products
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ title: productData.title });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`Created product: ${product.title}`);
      } else {
        console.log(`Product already exists: ${productData.title}`);
      }
    }

    console.log('Sample products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding sample products:', error);
    process.exit(1);
  }
};

addSampleProducts();