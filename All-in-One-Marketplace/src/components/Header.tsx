// src/components/Header.tsx (Clerk ဖြင့် အပြီးသတ်ပြင်ဆင်ထားသော Code)

import React, { useState } from 'react';
import { Search, Menu, X, ShoppingBag, Briefcase, Plane, Recycle } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { useUser, UserButton } from "@clerk/clerk-react"; // Clerk hook နဲ့ component တွေကို import လုပ်ပါ

interface HeaderProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeCategory = 'home', onCategoryChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser(); // User login ဝင်ထား၊ မဝင်ထားကို စစ်ဆေးတဲ့ hook

  const categories = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'secondhand', label: 'Second-hand', icon: Recycle },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'travel', label: 'Travel', icon: Plane }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div 
              className="text-2xl font-bold text-gradient cursor-pointer" 
              onClick={() => onCategoryChange?.('home')}
            >
              MarketHub
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange?.(category.id)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{category.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions: Search, Login/Logout, Post Ad (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            {/* --- Login အခြေအနေကို စစ်ဆေးမည့် အဓိကအပိုင်း (Desktop) --- */}
            {isSignedIn ? (
              // User login ဝင်ထားခဲ့လျှင်
              <>
                <Button>Post Ad</Button>
                <UserButton afterSignOutUrl="/" /> {/* Clerk ရဲ့ Profile ပုံ/Logout ခလုတ် */}
              </>
            ) : (
              // User login မဝင်ထားခဲ့လျှင်
              <>
                <Button variant="ghost" onClick={() => onCategoryChange?.('login')}>
                  Login
                </Button>
                <Button onClick={() => onCategoryChange?.('signup')}>
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
              {/* ... categories.map(...) ... */}
            </nav>
            
            <div className="border-t my-4"></div>
            
            {/* --- Login အခြေအနေကို စစ်ဆေးမည့် အဓိကအပိုင်း (Mobile) --- */}
            <div className="flex flex-col space-y-2 px-4">
              {isSignedIn ? (
                // User login ဝင်ထားခဲ့လျှင်
                <>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span>Manage Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <Button>Post Ad</Button>
                </>
              ) : (
                // User login မဝင်ထားခဲ့လျှင်
                <>
                  <Button variant="outline" onClick={() => { onCategoryChange?.('login'); setIsMobileMenuOpen(false); }}>
                    Login
                  </Button>
                  <Button onClick={() => { onCategoryChange?.('signup'); setIsMobileMenuOpen(false); }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Search */}
            <div className="mt-4 px-4">{/*...Search Bar...*/}</div>
          </div>
        )}
      </div>
    </header>
  );
};