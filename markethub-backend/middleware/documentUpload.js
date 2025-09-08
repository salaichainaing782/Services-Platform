const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'), false);
  }
};

// Configure multer for documents
const documentUpload = multer({
  storage: storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

module.exports = documentUpload;