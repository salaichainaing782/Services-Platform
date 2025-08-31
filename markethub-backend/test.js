const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection
const testConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub');
    console.log('✅ MongoDB connection successful');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('✅ Database collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test environment variables
const testEnvironment = () => {
  console.log('\n🔧 Environment Variables:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   PORT: ${process.env.PORT || 'not set'}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'set' : 'not set'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
  
  if (!process.env.JWT_SECRET) {
    console.log('⚠️  Warning: JWT_SECRET is not set. Please set it in your .env file.');
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Running backend tests...\n');
  
  testEnvironment();
  await testConnection();
  
  console.log('\n✅ All tests passed! Backend is ready to use.');
  console.log('\n📝 Next steps:');
  console.log('   1. Create a .env file with your configuration');
  console.log('   2. Run "npm run seed" to populate the database');
  console.log('   3. Run "npm run dev" to start the development server');
};

runTests();
