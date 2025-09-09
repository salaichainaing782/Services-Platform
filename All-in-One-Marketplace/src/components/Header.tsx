// src/components/Header.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Search, Menu, X, User, ShoppingCart, Globe, LogOut, Settings, Home, BarChart3, Store, Shield, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  isAuthenticated: boolean;
  user: any;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, user }) => {
  const { t, i18n } = useTranslation();
  const { logout, user: authUser } = useAuth();
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user menu
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userButtonRef.current && !userButtonRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      
      // Close language menu
      if (isLanguageMenuOpen && languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node) &&
          languageButtonRef.current && !languageButtonRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isLanguageMenuOpen]);

  const isActive = (path: string) => {
    if (path === 'home') return location.pathname === '/';
    return location.pathname === `/${path}`;
  };

  const categories = [
    { id: 'home', label: t('home.title'), icon: null },
    { id: 'marketplace', label: t('marketplace.title'), icon: null },
    { id: 'secondhand', label: t('secondhand.title'), icon: null },
    { id: 'jobs', label: t('jobs.title'), icon: null },
    { id: 'services', label: 'Services', icon: null },
    { id: 'travel', label: t('travel.title'), icon: null }
  ];

  const languages = [
    { code: 'en', name: 'English', display: 'EN' },
    { code: 'my', name: 'မြန်မာ', display: 'မြန်မာ' },
    { code: 'th', name: 'ไทย', display: 'ไทย' },
    { code: 'zh', name: '中文', display: '中文' }
  ];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageMenuOpen(false);
  };

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === i18n.language) || languages[0];
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const UserMenu = () => (
    <div 
      ref={userMenuRef}
      className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-90 zoom-in-90"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
            <p className="text-indigo-100 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => { window.location.href = '/dashboard'; setIsUserMenuOpen(false); }}
          className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
        >
          <BarChart3 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
          <span>{t('dashboard.overview')}</span>
        </button>

        <button
          onClick={() => { window.location.href = '/orders'; setIsUserMenuOpen(false); }}
          className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
        >
          <Home className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
          <span>{t('orders.pending')}</span>
        </button>

        <button
          onClick={() => { window.location.href = '/seller-dashboard'; setIsUserMenuOpen(false); }}
          className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
        >
          <Store className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
          <span>{t('seller.title')}</span>
        </button>

        {authUser?.role === 'admin' && (
          <button
            onClick={() => { window.location.href = '/admin-dashboard'; setIsUserMenuOpen(false); }}
            className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <Shield className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
            <span>{t('admin.title')}</span>
          </button>
        )}

        <button
          onClick={() => { window.location.href = '/settings'; setIsUserMenuOpen(false); }}
          className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
        >
          <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
          <span>{t('settings.title')}</span>
        </button>
      </div>

      {/* Footer with Logout */}
      <div className="border-t p-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>{t('dashboard.logout')}</span>
        </button>
      </div>
    </div>
  );

  const LanguageMenu = () => (
    <div 
      ref={languageMenuRef}
      className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in-90 zoom-in-90 border"
    >
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={cn(
            "flex items-center w-full px-4 py-2 text-sm transition-colors",
            i18n.language === language.code
              ? "bg-indigo-50 text-indigo-600 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          )}
        >
          {language.name}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-2xl font-bold text-gradient hover:opacity-80 transition-opacity"
            >
              MarketHub
            </button>
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

          {/* Desktop Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                ref={languageButtonRef}
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-1 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{getCurrentLanguage().display}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {/* Language Dropdown Menu */}
              {isLanguageMenuOpen && <LanguageMenu />}
            </div>
            
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
              // User is logged in - only show essential buttons
              <>
                <Button onClick={() => window.location.href = '/post'}>{t('postAd.title')}</Button>
                
                {/* User Profile with Dropdown Menu */}
                <div className="relative">
                  <button 
                    ref={userButtonRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && <UserMenu />}
                </div>
              </>
            ) : (
              // User is not logged in
              <>
                <Button variant="ghost" onClick={() => window.location.href = '/login'}>
                  {t('auth.login')}
                </Button>
                <Button onClick={() => window.location.href = '/signup'}>
                  {t('auth.signup')}
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
          <div className="md:hidden py-4 border-t z-40">
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
                  <span className="font-medium">{t('cart.title')}</span>
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
                // User is logged in - only show essential buttons
                <>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                    <div 
                      className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => { setIsUserMenuOpen(true); setIsMobileMenuOpen(false); }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <Button onClick={() => { window.location.href = '/post'; setIsMobileMenuOpen(false); }}>
                    {t('postAd.title')}
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    {t('dashboard.logout')}
                  </Button>
                </>
              ) : (
                // User is not logged in
                <>
                  <Button variant="outline" onClick={() => { window.location.href = '/login'; setIsMobileMenuOpen(false); }}>
                    {t('auth.login')}
                  </Button>
                  <Button onClick={() => { window.location.href = '/signup'; setIsMobileMenuOpen(false); }}>
                    {t('auth.signup')}
                  </Button>
                </>
              )}
            </div>
            
            {/* Language Switcher (Mobile) */}
            <div className="mt-4 px-4">
              <div className="border rounded-lg overflow-hidden">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => { changeLanguage(language.code); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "flex items-center justify-center w-full p-3 transition-colors",
                      i18n.language === language.code
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Menu Modal for Mobile */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm md:hidden">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in-90 zoom-in-90"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-indigo-100 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              <button
                onClick={() => { window.location.href = '/dashboard'; setIsUserMenuOpen(false); }}
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
              >
                <BarChart3 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
                <span>{t('dashboard.overview')}</span>
              </button>

              <button
                onClick={() => { window.location.href = '/orders'; setIsUserMenuOpen(false); }}
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
              >
                <Home className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
                <span>{t('orders.pending')}</span>
              </button>

              <button
                onClick={() => { window.location.href = '/seller-dashboard'; setIsUserMenuOpen(false); }}
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
              >
                <Store className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
                <span>{t('seller.title')}</span>
              </button>

              {authUser?.role === 'admin' && (
                <button
                  onClick={() => { window.location.href = '/admin-dashboard'; setIsUserMenuOpen(false); }}
                  className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                >
                  <Shield className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
                  <span>{t('admin.title')}</span>
                </button>
              )}

              <button
                onClick={() => { window.location.href = '/settings'; setIsUserMenuOpen(false); }}
                className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
              >
                <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-indigo-500" />
                <span>{t('settings.title')}</span>
              </button>
            </div>

            {/* Footer with Logout */}
            <div className="border-t p-2">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full p-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors group"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;