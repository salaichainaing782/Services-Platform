import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/Button';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Eye, 
  AlertCircle, 
  X, 
  MapPin, 
  User, 
  CreditCard, 
  Calendar,
  Phone,
  Mail,
  Download,
  Printer,
  Check,
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';

// Notification Component
const Notification = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
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
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      border: 'border-l-4 border-red-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 w-5 text-blue-500" />,
      border: 'border-l-4 border-blue-500'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      border: 'border-l-4 border-amber-500'
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
              type === 'error' ? 'bg-red-500' :
              type === 'info' ? 'bg-blue-500' : 'bg-amber-500'
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

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total: number;
  subOrders?: Array<{
    id: string;
    sellerId: string;
    sellerName: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    items: Array<{
      id: string;
      title: string;
      price: number;
      quantity: number;
      image: string;
    }>;
    subtotal: number;
  }>;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    sellerId?: string;
    sellerName?: string;
  }>;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    email: string;
  };
  paymentMethod?: string;
}

const OrderHistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
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
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUserOrders();
      setOrders(response.orders || []);
      addNotification('Orders loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load orders:', error);
      addNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancelLoading(true);
    try {
      await apiClient.cancelOrder(orderToCancel);
      await loadOrders();
      setShowCancelModal(false);
      setOrderToCancel(null);
      addNotification('Order cancelled successfully', 'success');
    } catch (error) {
      console.error('Failed to cancel order:', error);
      addNotification('Failed to cancel order', 'error');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      for (const item of order.items) {
        await apiClient.addToCart(item.id, item.quantity);
      }
      addNotification('Items added to cart for reorder', 'success');
      window.location.href = '/cart';
    } catch (error) {
      console.error('Failed to reorder:', error);
      addNotification('Failed to add items to cart', 'error');
    }
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addNotification('Invoice downloaded successfully', 'success');
      } else {
        addNotification('Failed to download invoice', 'error');
      }
    } catch (error) {
      console.error('Failed to download invoice:', error);
      addNotification('Failed to download invoice', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  // Function to handle image loading errors
  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  // Function to format image URL
  const formatImageUrl = (url: string, itemId: string) => {
    if (!url) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ0IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEM0MS45NDExIDQ4IDUwIDM5Ljk0MTEgNTAgMzJDNTAgMjQuMDU4OSA0MS45NDExIDE2IDMyIDE2QzIyLjA1ODkgMTYgMTQgMjQuMDU4OSAxNCAzMkMxNCAzOS45NDExIDIyLjA1ODkgNDggMzIgNDgiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
    }
    
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      return `http://localhost:5000${url}`;
    }
    
    return url;
  };

  // Safe function to format order ID
  const formatOrderId = (orderId: string | undefined) => {
    if (!orderId) return 'N/A';
    return orderId.slice(-8).toUpperCase();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your order history</p>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <div className="text-sm text-gray-500">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Button onClick={() => window.location.href = '/marketplace'}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
                <div className="p-6 border-b bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Order #{formatOrderId(order.id)}</p>
                        <p className="text-gray-600 text-sm">Placed on {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-bold text-lg text-green-600">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {order.subOrders && order.subOrders.length > 0 ? (
                    <div className="space-y-6">
                      {order.subOrders.map((subOrder, subIndex) => (
                        <div key={`${order.id}-${subOrder.id}-${subIndex}`} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{subOrder.sellerName}</h3>
                              <p className="text-gray-600 text-sm">Sub-order #{formatOrderId(subOrder.id)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(subOrder.status)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subOrder.status)}`}>
                                {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {subOrder.items.map((item, itemIndex) => {
                              const itemId = `${subOrder.id}-${item.id}-${itemIndex}`;
                              const imageUrl = formatImageUrl(item.image, itemId);
                              const hasError = imageErrors[itemId];
                              
                              return (
                                <div key={itemId} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                                  <div className="relative">
                                    {!hasError ? (
                                      <img
                                        src={imageUrl}
                                        alt={item.title}
                                        className="w-12 h-12 object-cover rounded-lg"
                                        onError={() => handleImageError(itemId)}
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-909">{item.title}</h4>
                                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <span className="font-semibold">Subtotal: ${subOrder.subtotal.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {order.items.map((item, itemIndex) => {
                        const itemId = `${order.id}-${item.id}-${itemIndex}`;
                        const imageUrl = formatImageUrl(item.image, itemId);
                        const hasError = imageErrors[itemId];
                        
                        return (
                          <div key={itemId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="relative">
                              {!hasError ? (
                                <img
                                  src={imageUrl}
                                  alt={item.title}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={() => handleImageError(itemId)}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <AlertCircle className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                              {item.sellerName && (
                                <p className="text-blue-600 text-sm mt-1">Seller: {item.sellerName}</p>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="flex items-center space-x-2 border-gray-300"
                      onClick={() => handleViewDetails(order)}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                    {order.status === 'delivered' && (
                      <Button 
                        variant="outline" 
                        className="border-green-200 text-green-600"
                        onClick={() => handleReorder(order)}
                      >
                        Reorder
                      </Button>
                    )}
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-600"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Enhanced Order Details Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                  <p className="text-gray-600 mt-1">Order #{formatOrderId(selectedOrder.id)}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Content */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Summary */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Order Status Card */}
                    <div className="bg-white rounded-lg border p-5 shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-500" />
                        Order Status
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(selectedOrder.status)}
                          <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">${selectedOrder.total.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-lg border p-5 shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-500" />
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, index) => {
                          const itemId = `modal-${item.id}-${index}`;
                          const imageUrl = formatImageUrl(item.image, itemId);
                          const hasError = imageErrors[itemId];
                          
                          return (
                            <div key={itemId} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="relative flex-shrink-0">
                                {!hasError ? (
                                  <img
                                    src={imageUrl}
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                    onError={() => handleImageError(itemId)}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 ml-4">
                                <p className="font-medium text-gray-900">{item.title}</p>
                                <div className="flex flex-wrap gap-4 mt-1">
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                  <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                </div>
                                {item.sellerName && (
                                  <p className="text-sm text-blue-600 mt-1">Sold by: {item.sellerName}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Information Sidebar */}
                  <div className="space-y-6">
                    {/* Order Timeline */}
                    <div className="bg-white rounded-lg border p-5 shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                        Order Timeline
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Order Placed</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                          <div>
                            <p className="text-sm font-medium">Order Confirmed</p>
                            <p className="text-xs text-gray-500">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}></div>
                          <div>
                            <p className="text-sm font-medium">Shipped</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' 
                                ? 'On ' + new Date(selectedOrder.date).toLocaleDateString() 
                                : 'Pending'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'} mr-3`}></div>
                          <div>
                            <p className="text-sm font-medium">Delivered</p>
                            <p className="text-xs text-gray-500">
                              {selectedOrder.status === 'delivered' 
                                ? 'On ' + new Date(selectedOrder.date).toLocaleDateString() 
                                : 'Pending'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white rounded-lg border p-5 shadow-sm">
                      <h3 className="font-semibold text-lg mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                        Payment Summary
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax</span>
                          <span className="font-medium">$0.00</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-green-600">${selectedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <p className="text-sm text-gray-500">Paid with Credit Card</p>
                          <p className="text-xs text-gray-400">Transaction ID: TRX-{formatOrderId(selectedOrder.id)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Support */}
                    <div className="bg-blue-50 rounded-lg border border-blue-100 p-5">
                      <h3 className="font-semibold text-lg mb-2 text-blue-800">Need Help?</h3>
                      <p className="text-sm text-blue-600 mb-3">Our support team is here to help with your order</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-blue-700">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>+95 945 700 2063</span>
                        </div>
                        <div className="flex items-center text-sm text-blue-700">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>lovenaing386@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t p-6 bg-gray-50">
                <div className="flex flex-wrap gap-3 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="border-gray-300"
                  >
                    Close
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownloadInvoice(selectedOrder.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="border-green-200 text-green-600">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Order</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCancelModal(false);
                      setOrderToCancel(null);
                    }}
                    className="flex-1"
                    disabled={cancelLoading}
                  >
                    Keep Order
                  </Button>
                  <Button 
                    onClick={confirmCancelOrder}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      'Cancel Order'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;