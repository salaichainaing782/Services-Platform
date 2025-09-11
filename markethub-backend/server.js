// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { securityHeaders, rateLimiter } = require('./middleware/security');
const sanitizeInput = require('./middleware/sanitize');
const { logger, errorHandler } = require('./services/logger');
const { cacheMiddleware } = require('./services/cache');

dotenv.config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-here-change-in-production';
  console.log('Warning: JWT_SECRET not set, using default value. Please set JWT_SECRET in production.');
}

const app = express();
app.use(securityHeaders);
app.use(rateLimiter);
app.use(morgan('dev'));
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(sanitizeInput);

const connectDB = async () => {
  try {
    // Use a fallback MongoDB URI if environment variable is not set
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub';
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.log('Please make sure MongoDB is running or set MONGODB_URI environment variable');
    console.log('For development, you can use MongoDB Atlas (cloud) or install MongoDB locally');
    
    // Don't exit the process, let it continue with limited functionality
    console.log('Server will start but database operations will fail');
  }
};

connectDB();

const productRoutes = require('./routes/products/productRoutes');
const userRoutes = require('./routes/users/userRoutes');
const categoryRoutes = require('./routes/categories/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/comments');
const likeRoutes = require('./routes/likes');
const uploadRoutes = require('./routes/upload');
const jobRoutes = require('./routes/jobRoutes');
const ratingRoutes = require('./routes/ratings');

app.use('/api/products', cacheMiddleware(300), productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024)
    };
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'MarketHub API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      memory: memUsageMB,
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});