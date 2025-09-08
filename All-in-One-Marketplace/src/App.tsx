import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import SecondhandPage from './pages/SecondhandPage';
import JobsPage from './pages/JobsPage';
import TravelPage from './pages/TravelPage';
import TravelDetailPage from './pages/TravelDetailPage';
import JobDetailPage from './pages/JobDetailPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import PostAdPage from './pages/PostAdPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { isAuthenticated, isLoading, setNavigationCallback } = useAuth();

  useEffect(() => {
    // Set navigation callback for AuthContext
    setNavigationCallback((category: string) => {
      // Handle navigation based on category
      if (category === 'dashboard') {
        window.location.href = '/dashboard';
      } else if (category === 'home') {
        window.location.href = '/';
      }
    });
  }, [setNavigationCallback]);

  // Protected Route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  // Public-only Route component (hide login/signup when authenticated)
  const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
  };

  return (
    <NotificationProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen bg-background">
          <Header isAuthenticated={isAuthenticated} user={null} />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/secondhand" element={<SecondhandPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/travel/:id" element={<TravelDetailPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/post" 
              element={
                <ProtectedRoute>
                  <PostAdPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-muted/30 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="text-2xl font-bold text-gradient mb-4">MarketHub</div>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Your all-in-one platform for buying, selling, working, and traveling. 
                  Connect with millions of users worldwide.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Twitter
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Facebook
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Instagram
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    LinkedIn
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Categories</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Marketplace</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Second-hand</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Jobs</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Travel</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; 2024 MarketHub. All rights reserved. Built with ❤️ for the community.</p>
            </div>
          </div>
        </footer>
        </div>
        </Router>
      </CartProvider>
    </NotificationProvider>
  );
}

export default App;