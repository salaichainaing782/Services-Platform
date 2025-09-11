const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Clear cache on start
config.resetCache = true;

module.exports = config;