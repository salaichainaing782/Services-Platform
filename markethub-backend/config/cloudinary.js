const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'diw2bc9ya',
  api_key: '897993483449418',
  api_secret: 'eoHvIfcka2Qw39aMXZ1p59JydwM'
});

module.exports = cloudinary;