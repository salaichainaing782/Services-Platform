import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { items } = useCart();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/marketplace' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartItemCount },
    { icon: User, label: 'Profile', path: '/dashboard' },
    { icon: Menu, label: 'Menu', path: '/menu' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ icon: Icon, label, path, badge }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center py-1 px-2 relative ${
              location.pathname === path
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
            {badge && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;