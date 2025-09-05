const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getUserOrders,
  getSellerOrders,
  updateSubOrderStatus
} = require('../controllers/orderController');

// All order routes require authentication
router.use(auth);

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/users/orders - Get user's orders (as customer)
router.get('/user', getUserOrders);

// GET /api/orders/seller - Get seller's orders
router.get('/seller', getSellerOrders);

// PUT /api/orders/:orderId/suborders/:subOrderId - Update sub-order status
router.put('/:orderId/suborders/:subOrderId', updateSubOrderStatus);

const Order = require('../models/Order');

// PUT /api/orders/:orderId/cancel - Cancel order
router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is the customer
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Only allow cancellation if order is pending or processing
    if (!['pending', 'processing'].includes(order.overallStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    
    // Update all sub-orders to cancelled
    order.subOrders.forEach(subOrder => {
      if (['pending', 'processing'].includes(subOrder.status)) {
        subOrder.status = 'cancelled';
      }
    });
    
    order.updateOverallStatus();
    await order.save();
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:orderId/invoice - Download invoice
router.get('/:orderId/invoice', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('customer', 'firstName lastName email')
      .populate('subOrders.items.product', 'title price');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is the customer
    if (order.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }
    
    // Generate simple HTML invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${order.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .order-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>MarketHub</h2>
        </div>
        <div class="order-info">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
          <p><strong>Email:</strong> ${order.customer.email}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.subOrders.map(subOrder => 
              subOrder.items.map(item => `
                <tr>
                  <td>${item.product.title}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')
            ).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Total Amount: $${order.total.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.html"`);
    res.send(invoiceHTML);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;