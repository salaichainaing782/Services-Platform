import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load cart from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCart();
      setItems(response.items || []);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      await apiClient.addToCart(product.id, quantity);
      await loadCart(); // Reload cart from server
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      await apiClient.removeFromCart(id);
      await loadCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated) return;
    
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    try {
      setLoading(true);
      await apiClient.updateCartItem(id, quantity);
      await loadCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      await apiClient.clearCart();
      setItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};