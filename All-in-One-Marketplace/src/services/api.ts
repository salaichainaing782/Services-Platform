const API_BASE_URL = 'http://localhost:5000/api';

// API Response types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: any[];
}

interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Product types matching backend
export interface Product {
  id: string;
  title: string;
  price?: string;
  location?: string;
  rating?: number;
  image: string;
  category: 'marketplace' | 'secondhand' | 'jobs' | 'travel';
  featured?: boolean;
  description?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  experience?: 'entry' | 'mid' | 'senior' | 'executive';
  salary?: string;
  tripType?: 'flights' | 'hotels' | 'packages' | 'activities' | 'transport';
  duration?: string;
  tags?: string[];
  views?: number;
  favorites?: number;
  seller?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Category types
export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  subcategories?: Category[];
  productCount: number;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  role: 'user' | 'seller' | 'admin';
  isVerified: boolean;
  rating?: number;
  totalReviews?: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// API Client class
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data) {
      this.setToken(response.data.token);
    }
    
    return response.data!;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/users/profile');
    return response.data!;
  }

  async updateProfile(updates: Partial<User>): Promise<{ user: User; message: string }> {
    const response = await this.request<{ user: User; message: string }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
    jobType?: string;
    experience?: string;
    tripType?: string;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return response.data!;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const queryString = limit ? `?limit=${limit}` : '';
    const response = await this.request<Product[]>(`/products/featured${queryString}`);
    return response.data!;
  }

  async getProductsByCategory(
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products/category/${category}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  async createProduct(productData: Omit<Product, 'id' | 'seller' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.data!;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
    return response.data!;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories');
    return response.data!;
  }

  async getMainCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories/main');
    return response.data!;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/slug/${slug}`);
    return response.data!;
  }

  async getCategoryFilters(category: string): Promise<Record<string, any[]>> {
    const response = await this.request<Record<string, any[]>>(`/categories/filters?category=${category}`);
    return response.data!;
  }

  // User management endpoints
  async getUserProducts(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/users/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  async getUserFavorites(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/users/favorites${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<PaginatedResponse<Product>>(endpoint);
    return response.data!;
  }

  async toggleFavorite(productId: string): Promise<{ message: string; isFavorite: boolean }> {
    const response = await this.request<{ message: string; isFavorite: boolean }>(`/users/favorites/${productId}`, {
      method: 'POST',
    });
    return response.data!;
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type {
  Product,
  Category,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  PaginatedResponse,
};
