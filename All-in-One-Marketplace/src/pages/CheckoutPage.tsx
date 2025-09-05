import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { Button } from '../components/ui/Button';
import { CreditCard, MapPin, User, Mail, Phone } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/marketplace')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Group items by seller
      const itemsBySeller = items.reduce((acc, item) => {
        const sellerId = item.sellerId || 'default';
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          sellerId: item.sellerId
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode
        },
        paymentMethod: formData.paymentMethod,
        subtotal: getTotalPrice(),
        shipping: shippingCost,
        tax: tax,
        discount: discount,
        total: finalTotal,
        itemsBySeller: itemsBySeller
      };
      
      const response = await apiClient.createOrder(orderData);
      await clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const shippingCost = getTotalPrice() > 50 ? 0 : 5.99;
  const subtotalAfterDiscount = getTotalPrice() - discount;
  const tax = subtotalAfterDiscount * 0.08;
  const finalTotal = subtotalAfterDiscount + shippingCost + tax;
  
  const applyCoupon = () => {
    setCouponError('');
    const validCoupons = {
      'SAVE10': 0.1,
      'WELCOME20': 0.2,
      'FIRST15': 0.15
    };
    
    if (validCoupons[couponCode.toUpperCase()]) {
      const discountAmount = getTotalPrice() * validCoupons[couponCode.toUpperCase()];
      setDiscount(discountAmount);
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h2>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </h2>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 mb-4"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cod">Cash on Delivery</option>
                </select>

                {formData.paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <input
                        type="text"
                        name="cvv"
                        placeholder="CVV"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Name on Card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {isProcessing ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-green-500"
                />
                <Button onClick={applyCoupon} variant="outline" className="px-4">
                  Apply
                </Button>
              </div>
              {couponError && <p className="text-red-500 text-sm mt-1">{couponError}</p>}
            </div>
            
            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({couponCode.toUpperCase()})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;