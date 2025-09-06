import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/Button';
import { Package, Truck, CheckCircle, Clock, Eye, Edit, AlertCircle, Check, X, Info } from 'lucide-react';

// Notification Component
const Notification = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: <Check className="w-5 h-5 text-green-500" />,
      border: 'border-l-4 border-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      border: 'border-l-4 border-red-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 w-5 text-blue-500" />,
      border: 'border-l-4 border-blue-500'
    }
  };
  
  const currentStyle = typeStyles[type];
  
  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`${currentStyle.bg} ${currentStyle.border} rounded-lg shadow-lg p-4 min-w-80 max-w-sm border`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {currentStyle.icon}
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${currentStyle.text}`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ 
              width: isVisible ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Notification Container
const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </>
  );
};

const SellerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

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
      addNotification('Orders loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load seller orders:', error);
      addNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, subOrderId: string, status: string) => {
    try {
      setUpdatingStatus(`${orderId}-${subOrderId}`);
      await apiClient.updateSubOrderStatus(orderId, subOrderId, status);
      await loadSellerOrders();
      addNotification(`Order status updated to ${status}`, 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
      addNotification('Failed to update order status', 'error');
    } finally {
      setUpdatingStatus(null);
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return { label: 'Confirm Order', status: 'confirmed', color: 'blue' };
      case 'confirmed':
        return { label: 'Start Processing', status: 'processing', color: 'orange' };
      case 'processing':
        return { label: 'Mark as Shipped', status: 'shipped', color: 'purple' };
      case 'shipped':
        return { label: 'Mark as Delivered', status: 'delivered', color: 'green' };
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access the seller dashboard</p>
          <Button 
            onClick={() => window.location.href = '/login'} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Notification Container */}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Seller Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your orders and track their status</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={loadSellerOrders}
              variant="outline"
              className="border-gray-300 hover:border-gray-400"
            >
              Refresh Orders
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800">No orders yet</h2>
            <p className="text-gray-600 mb-6">Orders from customers will appear here once you start selling</p>
            <Button 
              onClick={() => window.location.href = '/marketplace'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Browse Marketplace
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const nextAction = getNextStatusAction(order.status);
              const isUpdating = updatingStatus === `${order.id}-${order.subOrderId}`;
              
              return (
                <div key={`${order.id}-${order.subOrderId}`} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Order Header */}
                  <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="mb-4 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <p className="font-semibold text-lg text-gray-800">Order #{order.orderNumber}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} border`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </div>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Date: {new Date(order.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Customer: {order.customer.name}</span>
                          <span>•</span>
                          <span className="font-semibold text-green-600">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      {nextAction && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, order.subOrderId, nextAction.status)}
                          disabled={isUpdating}
                          className={`bg-${nextAction.color}-600 hover:bg-${nextAction.color}-700 text-white min-w-[140px]`}
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : (
                            nextAction.label
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-6">
                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-500" />
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg border"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MS45NDExIDQ4IDUwIDM5Ljk0MTEgNTAgMzJDNTAgMjQuMDU4OSA0MS45NDExIDE2IDMyIDE2QzIyLjA1ODkgMTYgMTQgMjQuMDU4OSAxNCAzMkMxNCAzOS45NDExIDIyLjA1ODkgNDggMzIgNDgiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{item.title}</h4>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                                <span>Qty: {item.quantity}</span>
                                <span>•</span>
                                <span>${item.price.toFixed(2)} each</span>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-800">${item.total.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Truck className="h-5 w-5 mr-2 text-blue-500" />
                        Shipping Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-gray-800">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                            <p className="text-gray-600">{order.shippingAddress.address}</p>
                            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">📱 {order.shippingAddress.phone}</p>
                            <p className="text-gray-600">✉️ {order.shippingAddress.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-500" />
                        Order Timeline
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className={`w-3 h-3 rounded-full ${order.status !== 'pending' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span>Order Placed</span>
                        
                        <div className="flex-1 h-px bg-gray-300"></div>
                        
                        <div className={`w-3 h-3 rounded-full ${['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span>Confirmed</span>
                        
                        <div className="flex-1 h-px bg-gray-300"></div>
                        
                        <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        <span>Shipped</span>
                        
                        <div className="flex-1 h-px bg-gray-300"></div>
                        
                        <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;