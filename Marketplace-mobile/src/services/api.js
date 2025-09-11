import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data for mobile app
const mockProducts = [
  { _id: '1', title: 'iPhone 14', price: 999, category: 'marketplace', image: 'https://via.placeholder.com/300', location: 'Yangon', rating: 4.5 },
  { _id: '2', title: 'Used Laptop', price: 500, category: 'secondhand', image: 'https://via.placeholder.com/300', location: 'Mandalay', rating: 4.2 },
  { _id: '3', title: 'Software Developer', price: 1500, category: 'jobs', company: 'Tech Corp', location: 'Remote', type: 'Full-time' },
  { _id: '4', title: 'House Cleaning', price: 25, category: 'services', provider: 'Clean Pro', image: 'https://via.placeholder.com/300', rating: 4.8 },
  { _id: '5', title: 'Bagan Tour', price: 299, category: 'travel', duration: '3 Days', image: 'https://via.placeholder.com/300', rating: 4.9 },
];

const mockCategories = [
  { id: 'marketplace', title: 'Marketplace' },
  { id: 'secondhand', title: 'Secondhand' },
  { id: 'jobs', title: 'Jobs' },
  { id: 'services', title: 'Services' },
  { id: 'travel', title: 'Travel' },
];

class ApiClient {
  constructor() {
    this.mockMode = true; // Enable mock mode for mobile
  }

  async login(credentials) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = { id: '1', firstName: 'John', lastName: 'Doe', email: credentials.email };
      await AsyncStorage.setItem('token', 'mock-token');
      return { user: mockUser, token: 'mock-token' };
    }
  }

  async register(userData) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUser = { id: '1', ...userData };
      await AsyncStorage.setItem('token', 'mock-token');
      return { user: mockUser, token: 'mock-token' };
    }
  }

  async getProducts(params = {}) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      let filteredProducts = [...mockProducts];
      
      if (params.category) {
        filteredProducts = filteredProducts.filter(p => p.category === params.category);
      }
      
      if (params.search) {
        filteredProducts = filteredProducts.filter(p => 
          p.title.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      return {
        products: filteredProducts,
        pagination: { totalPages: 1, currentPage: 1 }
      };
    }
  }

  async getProductById(id) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = mockProducts.find(p => p._id === id);
      return product || mockProducts[0];
    }
  }

  async getCategories() {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockCategories;
    }
  }

  async addToCart(productId, quantity = 1) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
  }

  async getCart() {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        items: [
          { productId: '1', title: 'iPhone 14', price: 999, quantity: 1, image: 'https://via.placeholder.com/300' },
          { productId: '2', title: 'Used Laptop', price: 500, quantity: 2, image: 'https://via.placeholder.com/300' },
        ]
      };
    }
  }

  async removeFromCart(productId) {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
  }

  async logout() {
    await AsyncStorage.removeItem('token');
  }
}

export const apiClient = new ApiClient();