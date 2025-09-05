import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total } = location.state || {};

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate('/marketplace')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-semibold">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-semibold">${total?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p className="font-semibold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Order Confirmation</h3>
                <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
              </div>
              <div className="text-center">
                <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Processing</h3>
                <p className="text-sm text-gray-600">We'll prepare your items for shipping</p>
              </div>
              <div className="text-center">
                <Truck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium mb-1">Delivery</h3>
                <p className="text-sm text-gray-600">Your order will be delivered within 5-7 days</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/orders')} variant="outline">
              View Order History
            </Button>
            <Button onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;