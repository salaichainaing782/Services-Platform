const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Product types matching backend
export interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  location?: string;
  rating?: number;
  image: string;
  images?: string[];
  category: 'marketplace' | 'secondhand' | 'jobs' | 'travel';
  featured?: boolean;
  description?: string;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  jobType?: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  experience?: 'entry' | 'mid' | 'senior' | 'executive';
  salary?: number;
  tripType?: 'flights' | 'hotels' | 'packages' | 'activities' | 'transport';
  duration?: string;
  tags?: string[];
  views?: number;
  favorites?: number;
  inStock?: boolean;
  quantity?: number;
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

// Paginated response
export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
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
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

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
    
    // Backend returns response directly
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Backend returns response directly
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/users/profile');
    return response;
  }

  async updateProfile(updates: Partial<User>): Promise<{ user: User; message: string }> {
    const response = await this.request<{ user: User; message: string }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
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
    return response;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`);
    return response;
  }

  async incrementProductViews(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${id}/views`, { method: 'POST' });
  }

  async getPriceRange(category: string): Promise<{ minPrice: number; maxPrice: number }> {
    return this.request<{ minPrice: number; maxPrice: number }>(`/products/range/${category}`);
  }

  async purchaseProduct(id: string, qty: number): Promise<{ message: string; product: Product }>{
    return this.request<{ message: string; product: Product }>(`/products/${id}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ quantity: qty }),
    });
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const queryString = limit ? `?limit=${limit}` : '';
    const response = await this.request<Product[]>(`/products/featured${queryString}`);
    return response;
  }

  async getProductsByCategory(
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      condition?: string;
      sellerType?: string;
      jobType?: string;
      experience?: string;
      serviceType?: string;
      tripType?: string;
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
    return response;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const response = await this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories');
    return response;
  }

  async getMainCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories/main');
    return response;
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await this.request<Category>(`/categories/by-slug/${slug}`);
    return response;
  }

  async getCategoryFilters(category: string): Promise<Record<string, any[]>> {
    const response = await this.request<Record<string, any[]>>(`/categories/filters/${category}`);
    return response;
  }

  // User-specific product endpoints
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
    return response;
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
    return response;
  }

  async toggleFavorite(productId: string): Promise<{ message: string; isFavorite: boolean }> {
    const response = await this.request<{ message: string; isFavorite: boolean }>(`/users/favorites/${productId}`, {
      method: 'POST',
    });
    return response;
  }

  // Cart endpoints
  async getCart(): Promise<{ items: any[]; total: number }> {
    const response = await this.request<{ items: any[]; total: number }>('/users/cart');
    return response;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<{ message: string; cart: any }> {
    const response = await this.request<{ message: string; cart: any }>('/users/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return response;
  }

  async updateCartItem(productId: string, quantity: number): Promise<{ message: string; cart: any }> {
    const response = await this.request<{ message: string; cart: any }>(`/users/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return response;
  }

  async removeFromCart(productId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/users/cart/${productId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async clearCart(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/users/cart', {
      method: 'DELETE',
    });
    return response;
  }

  async createOrder(orderData: any): Promise<{ order: any; message: string }> {
    const response = await this.request<{ order: any; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response;
  }

  async getUserOrders(): Promise<{ orders: any[] }> {
    const response = await this.request<{ orders: any[] }>('/orders/user');
    return response;
  }

  async getSellerOrders(): Promise<{ orders: any[] }> {
    const response = await this.request<{ orders: any[] }>('/orders/seller');
    return response;
  }

  async updateSubOrderStatus(orderId: string, subOrderId: string, status: string, trackingNumber?: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/orders/${orderId}/suborders/${subOrderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, trackingNumber }),
    });
    return response;
  }

  // Admin endpoints
  async getAdminStats(): Promise<any> {
    const response = await this.request<any>('/admin/stats');
    return response;
  }

  async getAllUsers(): Promise<{ users: any[] }> {
    const response = await this.request<{ users: any[] }>('/admin/users');
    return response;
  }

  async getAllOrders(): Promise<{ orders: any[] }> {
    const response = await this.request<{ orders: any[] }>('/admin/orders');
    return response;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    return response;
  }

  async cancelOrder(orderId: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>(`/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
    return response;
  }

  // Comments API
  async getComments(productId: string): Promise<any[]> {
    const response = await this.request<any[]>(`/comments/product/${productId}`);
    return response;
  }

  async addComment(productId: string, text: string, parentId?: string): Promise<any> {
    const response = await this.request<any>('/comments', {
      method: 'POST',
      body: JSON.stringify({ productId, text, parentId }),
    });
    return response;
  }

  async likeComment(commentId: string): Promise<{ likes: number; isLiked: boolean }> {
    const response = await this.request<{ likes: number; isLiked: boolean }>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
    return response;
  }

  // Product likes API
  async likeProduct(productId: string): Promise<{ likes: number; isLiked: boolean }> {
    const response = await this.request<{ likes: number; isLiked: boolean }>(`/likes/product/${productId}`, {
      method: 'POST',
    });
    return response;
  }

  // Rating API
  async addRating(productId: string, rating: number, review?: string): Promise<{ message: string; rating: any }> {
    const response = await this.request<{ message: string; rating: any }>(`/ratings/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
    return response;
  }

  async getProductRatings(productId: string, params?: { page?: number; limit?: number }): Promise<{ ratings: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = `/ratings/product/${productId}${queryString ? `?${queryString}` : ''}`;
    return this.request<{ ratings: any[]; pagination: any }>(endpoint);
  }

  // Job application API
  async applyForJob(jobId: string, applicationData: {
    coverLetter: string;
    resume?: File;
    expectedSalary?: string;
    availableStartDate?: string;
  }): Promise<{ message: string; applicationId: string }> {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('coverLetter', applicationData.coverLetter);
    
    if (applicationData.resume) {
      formData.append('resume', applicationData.resume);
    }
    if (applicationData.expectedSalary) {
      formData.append('expectedSalary', applicationData.expectedSalary);
    }
    if (applicationData.availableStartDate) {
      formData.append('availableStartDate', applicationData.availableStartDate);
    }

    const response = await this.request<{ message: string; applicationId: string }>('/jobs/apply', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
    return response;
  }

  async getUserJobApplications(): Promise<{ applications: any[] }> {
    const response = await this.request<{ applications: any[] }>('/jobs/applications/user');
    return response;
  }

  async getJobApplications(jobId: string): Promise<{ applications: any[] }> {
    const response = await this.request<{ applications: any[] }>(`/jobs/${jobId}/applications`);
    return response;
  }

  async getEmployerApplications(): Promise<{ applications: any[] }> {
    const response = await this.request<{ applications: any[] }>('/jobs/applications/employer');
    return response;
  }

  async updateApplicationStatus(applicationId: string, data: { status: string; employerNotes?: string }): Promise<{ message: string; application: any }> {
    const response = await this.request<{ message: string; application: any }>(`/jobs/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
