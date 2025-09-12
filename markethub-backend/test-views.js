// Test script to verify view increment functionality
const mongoose = require('mongoose');
const Product = require('./models/products/productModel');

async function testViewIncrement() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/markethub');
    console.log('Connected to MongoDB');

    // Find a product to test with
    const product = await Product.findOne();
    if (!product) {
      console.log('No products found in database');
      return;
    }

    console.log(`Testing with product: ${product.title}`);
    console.log(`Current views: ${product.views}`);

    // Increment views
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $inc: { views: 1 } },
      { new: true }
    );

    console.log(`Updated views: ${updatedProduct.views}`);
    console.log('View increment test successful!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testViewIncrement();