import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  setNavigationCallback: (callback: (category: string) => void) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [navigationCallback, setNavigationCallback] = useState<((category: string) => void) | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const userProfile = await apiClient.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({ email, password });
      const { token: newToken, user: userData } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Navigate to dashboard after successful login
      if (navigationCallback) {
        navigationCallback('dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiClient.register(userData);
      const { token: newToken, user: userProfile } = response;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userProfile);
      
      // Navigate to dashboard after successful registration
      if (navigationCallback) {
        navigationCallback('dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    // Navigate to home after logout
    if (navigationCallback) {
      navigationCallback('home');
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiClient.updateProfile(userData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    setNavigationCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
