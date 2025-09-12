import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// const API_BASE_URL = 'http://192.168.100.113:5000/api';
const API_BASE_URL = 'http://192.168.16.31:5000/api';

// Network connectivity check
const checkNetworkConnection = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected;
};

// Enhanced fetch with timeout and retry
const fetchWithTimeout = async (url: string, options: any = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const apiClient = {
  baseURL: API_BASE_URL,

  async getProducts(category = '', search = '') {
    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        console.log('No internet connection, using mock data');
        return this.getMockProducts(category, search);
      }

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await fetchWithTimeout(`${this.baseURL}/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Network error, using mock data:', error);
      }
      return this.getMockProducts(category, search);
    }
  },

  async getProductById(id) {
    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        return this.getMockProductById(id);
      }

      const response = await fetchWithTimeout(`${this.baseURL}/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Network error, using mock data:', error);
      }
      return this.getMockProductById(id);
    }
  },

  async likeProduct(id) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${this.baseURL}/products/${id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to like product');
      return response.json();
    } catch (error) {
      console.error('Like product error:', error);
      throw error;
    }
  },

  async bookmarkProduct(id) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${this.baseURL}/products/${id}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to bookmark product');
      return response.json();
    } catch (error) {
      console.error('Bookmark error:', error);
      throw error;
    }
  },

  async getComments(productId) {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/comments/product/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.log('Comments fetch error, using mock data:', error.message);
      }
      return this.getMockComments();
    }
  },

  async addComment(productId, text, parentId = null) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetchWithTimeout(`${this.baseURL}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, text, parentId })
      });
      
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    } catch (error) {
      console.log('Add comment error:', error.message);
      throw error;
    }
  },

  async likeComment(commentId) {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetch(`${this.baseURL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to like comment');
      return response.json();
    } catch (error) {
      console.error('Like comment error:', error);
      throw error;
    }
  },

  async incrementProductViews(id) {
    try {
      console.log('API: Incrementing views for product ID:', id);
      const response = await fetchWithTimeout(`${this.baseURL}/products/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('API: Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('API: Error response:', errorText);
        throw new Error(`Failed to increment views: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API: Success result:', result);
      return result;
    } catch (error: any) {
      console.log('API: View increment error:', error.message);
      return { views: 0 };
    }
  },

  // Auth methods
  async login(credentials) {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      return response.json();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.log('Backend login failed:', error.message);
      }
      return this.getMockLogin(credentials);
    }
  },

  async register(userData) {
    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        throw new Error('Registration requires internet connection');
      }

      const response = await fetchWithTimeout(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) throw new Error('Registration failed');
      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getProfile() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      if (token.startsWith('demo-token')) {
        return {
          _id: 'demo-user',
          username: 'demouser',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/50'
        };
      }
      
      const response = await fetchWithTimeout(`${this.baseURL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to get profile');
      return response.json();
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Get profile error:', error);
      }
      throw error;
    }
  },

  async rateProduct(id, rating, review = '') {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await fetchWithTimeout(`${this.baseURL}/ratings/product/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, review })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to rate product');
      }
      const result = await response.json();
      return { averageRating: rating, totalReviews: 1, ...result };
    } catch (error) {
      console.log('Rate product error, using fallback:', error.message);
      return { averageRating: rating, totalReviews: 1 };
    }
  },

  async getProductRatings(id) {
    try {
      const response = await fetchWithTimeout(`${this.baseURL}/ratings/product/${id}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      
      // Calculate average from ratings array
      const ratings = data.ratings || [];
      const totalReviews = ratings.length;
      const averageRating = totalReviews > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
        : 0;
      
      return { averageRating, totalReviews, ratings };
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.log('Ratings fetch error, using mock data:', error.message);
      }
      return { averageRating: 4.5, totalReviews: 25, ratings: [] };
    }
  },

  // Mock data methods
  getMockProducts(category = '', search = '') {
    const mockProducts = [
      {
        _id: '1',
        title: 'Professional Web Development',
        description: 'Full-stack web development services',
        price: 500,
        category: 'services',
        images: ['https://via.placeholder.com/300x200'],
        seller: { firstName: 'John', lastName: 'Doe' },
        rating: 4.5,
        reviews: 25
      },
      {
        _id: '2',
        title: 'Graphic Design Services',
        description: 'Professional logo and branding design',
        price: 200,
        category: 'services',
        images: ['https://via.placeholder.com/300x200'],
        seller: { firstName: 'Jane', lastName: 'Smith' },
        rating: 4.8,
        reviews: 15
      }
    ];
    
    return mockProducts.filter(p => 
      (!category || p.category === category) &&
      (!search || p.title.toLowerCase().includes(search.toLowerCase()))
    );
  },

  getMockProductById(id) {
    return {
      _id: id,
      title: 'Professional Service',
      description: 'High-quality professional service',
      price: 300,
      category: 'services',
      images: ['https://via.placeholder.com/300x200'],
      seller: { firstName: 'Demo', lastName: 'User' },
      rating: 4.5,
      reviews: 20,
      views: 150
    };
  },

  getMockComments() {
    return [
      {
        _id: '1',
        text: 'Great service! Highly recommended.',
        userId: { firstName: 'John', lastName: 'Doe', avatar: 'https://via.placeholder.com/40' },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        likes: [],
        isLiked: false,
        replies: []
      },
      {
        _id: '2', 
        text: 'Professional and reliable. Will use again!',
        userId: { firstName: 'Jane', lastName: 'Smith', avatar: 'https://via.placeholder.com/40' },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        likes: ['user1'],
        isLiked: false,
        replies: []
      }
    ];
  },

  getMockLogin(credentials) {
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
      return {
        token: 'demo-token-' + Date.now(),
        user: {
          _id: 'demo-user',
          username: 'demouser',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          avatar: 'https://via.placeholder.com/50'
        }
      };
    }
    throw new Error('Invalid credentials. Use demo@example.com / demo123');
  }
};

export default apiClient;