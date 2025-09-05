// src/components/Header.tsx (Clerk ဖြင့် အပြီးသတ်ပြင်ဆင်ထားသော Code)

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Search, Menu, X, User, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated: boolean;
  user: any;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user }) => {
  const { logout, user: authUser } = useAuth();
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === 'home') return location.pathname === '/';
    return location.pathname === `/${path}`;
  };

  const categories = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'marketplace', label: 'Marketplace', icon: null },
    { id: 'secondhand', label: 'Second-hand', icon: null },
    { id: 'jobs', label: 'Jobs', icon: null },
    { id: 'travel', label: 'Travel', icon: null }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-gradient">MarketHub</div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => window.location.href = `/${category.id === 'home' ? '' : category.id}`}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(category.id) 
                    ? "text-primary font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            ))}
          </nav>

          {/* Desktop Search */}
          {/* <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div> */}

          {/* Desktop Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <button 
              onClick={() => window.location.href = '/cart'}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {isAuthenticated ? (
              // User is logged in
              <>
                <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/orders'}>
                  Orders
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/seller-dashboard'}>
                  Seller Dashboard
                </Button>
                {authUser?.role === 'admin' && (
                  <Button variant="ghost" onClick={() => window.location.href = '/admin-dashboard'}>
                    Admin Dashboard
                  </Button>
                )}
                <Button onClick={() => window.location.href = '/post'}>Post Ad</Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                </div>
              </>
            ) : (
              // User is not logged in
              <>
                <Button variant="ghost" onClick={() => window.location.href = '/login'}>
                  Login
                </Button>
                <Button onClick={() => window.location.href = '/signup'}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              className="p-2 rounded-lg hover:bg-accent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {/* Menu Items */}
            <nav className="flex flex-col space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => { 
                    window.location.href = `/${category.id === 'home' ? '' : category.id}`;
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(category.id)
                      ? "text-primary font-semibold bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <span>{category.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="border-t my-4"></div>
            
            {/* Cart (Mobile) */}
            <div className="px-4 mb-4">
              <button 
                onClick={() => { window.location.href = '/cart'; setIsMobileMenuOpen(false); }}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">Cart</span>
                </div>
                {getTotalItems() > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
            
            {/* Authentication State (Mobile) */}
            <div className="flex flex-col space-y-2 px-4">
              {isAuthenticated ? (
                // User is logged in
                <>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Button onClick={() => { window.location.href = '/dashboard'; setIsMobileMenuOpen(false); }}>
                    Dashboard
                  </Button>
                  <Button onClick={() => { window.location.href = '/orders'; setIsMobileMenuOpen(false); }}>
                    Orders
                  </Button>
                  <Button onClick={() => { window.location.href = '/seller-dashboard'; setIsMobileMenuOpen(false); }}>
                    Seller Dashboard
                  </Button>
                  {authUser?.role === 'admin' && (
                    <Button onClick={() => { window.location.href = '/admin-dashboard'; setIsMobileMenuOpen(false); }}>
                      Admin Dashboard
                    </Button>
                  )}
                  <Button onClick={() => { window.location.href = '/post'; setIsMobileMenuOpen(false); }}>Post Ad</Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                // User is not logged in
                <>
                  <Button variant="outline" onClick={() => { window.location.href = '/login'; setIsMobileMenuOpen(false); }}>
                    Login
                  </Button>
                  <Button onClick={() => { window.location.href = '/signup'; setIsMobileMenuOpen(false); }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Search */}
            <div className="mt-4 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;