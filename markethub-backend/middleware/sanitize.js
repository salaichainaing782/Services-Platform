const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

const sanitizeInput = (req, res, next) => {
  // Sanitize against NoSQL injection
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.query);
  mongoSanitize.sanitize(req.params);
  
  // Sanitize against XSS
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  
  next();
};

module.exports = sanitizeInput;