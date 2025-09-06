const Order = require('../models/Order');
const Product = require('../models/products/productModel');
const Cart = require('../models/Cart');

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, subtotal, shipping, tax, discount, total } = req.body;
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability and update product quantities
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product._id);
      if (!product) {
        return res.status(400).json({ message: `Product ${cartItem.product.title} not found` });
      }
      
      if (product.quantity < cartItem.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.title}. Available: ${product.quantity}, Requested: ${cartItem.quantity}` 
        });
      }
      
      // Update product stock
      product.quantity -= cartItem.quantity;
      await product.save();
    }

    // Group cart items by seller
    const itemsBySeller = {};
    
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      const sellerId = product.seller ? product.seller.toString() : req.user.id;
      
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      
      itemsBySeller[sellerId].push({
        product: product._id,
        seller: sellerId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        total: cartItem.price * cartItem.quantity
      });
    }
    
    console.log('Items by seller:', Object.keys(itemsBySeller));

    // Create sub-orders for each seller
    const subOrders = [];
    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      subOrders.push({
        seller: sellerId,
        items: items,
        subtotal: subtotal,
        status: 'pending'
      });
    }

    // Create main order
    const order = new Order({
      orderNumber: 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      customer: req.user.id,
      subOrders: subOrders,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      discount,
      total
    });

    await order.save();
    console.log('Order created with ID:', order._id);
    console.log('Sub-orders count:', order.subOrders.length);

    // Clear cart after successful order
    cart.items = [];
    cart.total = 0;
    await cart.save();

    // Populate order for response
    await order.populate([
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'subOrders.seller', select: 'firstName lastName email' },
      { path: 'subOrders.items.product', select: 'title image price' }
    ]);

    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate([
        { path: 'subOrders.seller', select: 'firstName lastName email' },
        { path: 'subOrders.items.product', select: 'title image price' }
      ])
      .sort({ createdAt: -1 });

    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      date: order.createdAt.toISOString().split('T')[0],
      status: order.overallStatus,
      total: order.total,
      items: order.subOrders.flatMap(subOrder => 
        subOrder.items.map(item => ({
          id: item.product._id,
          title: item.product.title,
          price: item.price,
          quantity: item.quantity,
          image: item.product.image,
          seller: subOrder.seller.firstName + ' ' + subOrder.seller.lastName,
          subOrderStatus: subOrder.status
        }))
      ),
      subOrders: order.subOrders
    }));

    res.json({ orders: transformedOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller's orders
const getSellerOrders = async (req, res) => {
  try {
    console.log('Getting orders for seller:', req.user.id);
    
    const orders = await Order.find({ 'subOrders.seller': req.user.id })
      .populate([
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'subOrders.items.product', select: 'title image price' }
      ])
      .sort({ createdAt: -1 });
      
    console.log('Found orders:', orders.length);

    // Filter and transform orders to show only seller's sub-orders
    const sellerOrders = [];
    
    orders.forEach(order => {
      const sellerSubOrders = order.subOrders.filter(
        subOrder => subOrder.seller.toString() === req.user.id
      );
      
      sellerSubOrders.forEach(subOrder => {
        sellerOrders.push({
          id: order._id,
          orderNumber: order.orderNumber,
          subOrderId: subOrder._id,
          date: order.createdAt.toISOString().split('T')[0],
          status: subOrder.status,
          total: subOrder.subtotal,
          customer: {
            name: order.customer.firstName + ' ' + order.customer.lastName,
            email: order.customer.email,
            phone: order.customer.phone
          },
          shippingAddress: order.shippingAddress,
          items: subOrder.items.map(item => ({
            id: item.product._id,
            title: item.product.title,
            price: item.price,
            quantity: item.quantity,
            image: item.product.image,
            total: item.total
          }))
        });
      });
    });

    console.log('Returning seller orders:', sellerOrders.length);
    res.json({ orders: sellerOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update sub-order status (for sellers)
const updateSubOrderStatus = async (req, res) => {
  try {
    const { orderId, subOrderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      return res.status(404).json({ message: 'Sub-order not found' });
    }

    // Check if user is the seller of this sub-order
    if (subOrder.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    subOrder.status = status;
    if (trackingNumber) {
      subOrder.trackingNumber = trackingNumber;
    }

    // Update overall order status
    order.updateOverallStatus();
    
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getSellerOrders,
  updateSubOrderStatus
};