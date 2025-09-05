import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/Button';
import { Package, Truck, CheckCircle, Clock, Eye, Edit } from 'lucide-react';

const SellerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadSellerOrders();
    }
  }, [isAuthenticated]);

  const loadSellerOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSellerOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to load seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, subOrderId: string, status: string) => {
    try {
      await apiClient.updateSubOrderStatus(orderId, subOrderId, status);
      await loadSellerOrders(); // Reload orders
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Seller Dashboard</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600">Orders from customers will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={`${order.id}-${order.subOrderId}`} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                      <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                      <p className="text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-gray-600">Customer: {order.customer.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-green-600 font-semibold">${item.price.toFixed(2)} each</p>
                        </div>
                        <p className="font-semibold">${item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                    <p>Email: {order.shippingAddress.email}</p>
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-3">
                    {order.status === 'pending' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, order.subOrderId, 'confirmed')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Confirm Order
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, order.subOrderId, 'processing')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Start Processing
                      </Button>
                    )}
                    {order.status === 'processing' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, order.subOrderId, 'shipped')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Mark as Shipped
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button 
                        onClick={() => updateOrderStatus(order.id, order.subOrderId, 'delivered')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;