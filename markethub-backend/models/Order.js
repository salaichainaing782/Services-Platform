const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const subOrderSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  estimatedDelivery: Date
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subOrders: [subOrderSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'cod'],
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'processing', 'partially_shipped', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Update overall status based on sub-orders
orderSchema.methods.updateOverallStatus = function() {
  const statuses = this.subOrders.map(sub => sub.status);
  
  if (statuses.every(status => status === 'delivered')) {
    this.overallStatus = 'delivered';
  } else if (statuses.every(status => status === 'cancelled')) {
    this.overallStatus = 'cancelled';
  } else if (statuses.some(status => status === 'shipped')) {
    this.overallStatus = 'partially_shipped';
  } else if (statuses.some(status => status === 'processing')) {
    this.overallStatus = 'processing';
  } else {
    this.overallStatus = 'pending';
  }
};

module.exports = mongoose.model('Order', orderSchema);