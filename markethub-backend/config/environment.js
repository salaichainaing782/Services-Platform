const dotenv = require('dotenv');

dotenv.config();

const config = {
  development: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/markethub',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  },
  production: {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI_PROD || process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },
  test: {
    port: process.env.PORT || 5001,
    mongoUri: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/markethub_test',
    jwtSecret: 'test-secret-key',
    frontendUrl: 'http://localhost:3000',
    bcryptRounds: 1,
  }
};

const env = process.env.NODE_ENV || 'development';

if (env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

module.exports = config[env];