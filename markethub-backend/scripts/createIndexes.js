const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const createIndexes = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub';
    await mongoose.connect(mongoUri);
    
    const db = mongoose.connection.db;
    
    // Products collection indexes
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ title: 'text', description: 'text' });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ 'seller.id': 1 });
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    
    // Orders collection indexes
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1 });
    
    // Cart collection indexes
    await db.collection('carts').createIndex({ userId: 1 }, { unique: true });
    
    // Comments collection indexes
    await db.collection('comments').createIndex({ productId: 1 });
    await db.collection('comments').createIndex({ userId: 1 });
    
    // Ratings collection indexes
    await db.collection('ratings').createIndex({ productId: 1 });
    await db.collection('ratings').createIndex({ userId: 1 });
    
    console.log('Database indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();