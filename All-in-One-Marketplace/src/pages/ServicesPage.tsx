import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/api';
import { ChevronDown, Filter, Search, Heart, MessageCircle, MapPin, Star, Clock, Zap, Sparkles, X, Send, User, ThumbsUp, Brush, Code, BarChart2, BookOpen, Airplay, Home, Coffee, Music, HeartPulse, Dumbbell, CoffeeIcon, LucideCoffee } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ImageSlider: React.FC<{ images: string[], title: string }> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);
  
  // Handle case where images might be undefined or empty
  if (!images || images.length === 0) {
    return (
      <div className="h-48 overflow-hidden bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }
  
  if (images.length === 1) {
    return (
      <div className="h-48 overflow-hidden">
        <img 
          src={images[0]} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }
  
  return (
    <div className="h-48 overflow-hidden relative">
      {images.map((image, index) => (
        <img 
          key={index}
          src={image} 
          alt={`${title} ${index + 1}`}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 absolute top-0 left-0 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transition: 'opacity 0.5s ease-in-out' }}
        />
      ))}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface Product {
  _id: string;
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[];
  location?: string;
  views: number;
  favorites: number;
  likesCount?: number;
  seller: {
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating?: number;
  };
  serviceType?: string;
  duration?: string;
  availability?: string;
  hostName?: string;
  createdAt: string;
  category: string;
  rating?: number;
  isLiked?: boolean;
  commentsCount?: number;
  price?: number;
}

interface Comment {
  _id: string;
  text: string;
  userId: {
    firstName: string;
    lastName?: string;
    avatar?: string;
  };
  createdAt: string;
  replies?: Comment[];
  likes?: any[];
  isLiked?: boolean;
}

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [commentModal, setCommentModal] = useState({ isOpen: false, productId: '', comments: [] as Comment[], newComment: '' });
  const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

const serviceTypes = [
  { value: '', label: 'All Services', icon: <Zap className="w-4 h-4" /> },
  { value: 'consulting', label: t('postAd.consulting'), icon: <Sparkles className="w-4 h-4" /> },
  { value: 'design', label: t('postAd.design'), icon: <Brush className="w-4 h-4" /> },
  { value: 'development', label: t('postAd.development'), icon: <Code className="w-4 h-4" /> },
  { value: 'marketing', label: t('postAd.marketing'), icon: <BarChart2 className="w-4 h-4" /> },
  { value: 'education', label: t('postAd.education'), icon: <BookOpen className="w-4 h-4" /> },
  { value: 'travel', label: t('postAd.travel'), icon: <Airplay className="w-4 h-4" /> },
  { value: 'hotel', label: t('postAd.hotel'), icon: <Home className="w-4 h-4" /> },
  { value: 'accommodation', label: t('postAd.accommodation'), icon: <Home className="w-4 h-4" /> },
  { value: 'bar', label: t('postAd.bar'), icon: <Coffee className="w-4 h-4" /> },
  { value: 'ktv', label: t('postAd.ktv'), icon: <Music className="w-4 h-4" /> },
  { value: 'massage', label: t('postAd.massage'), icon: <HeartPulse className="w-4 h-4" /> },
  { value: 'gym', label: t('postAd.gym'), icon: <Dumbbell className="w-4 h-4" /> },
  { value: 'tea', label: t('postAd.tea'), icon: <CoffeeIcon className="w-4 h-4" /> },
  { value: 'coffee', label: t('postAd.coffee'), icon: <LucideCoffee className="w-4 h-4" /> },
  { value: 'restaurant', label: t('postAd.restaurant'), icon: <Coffee className="w-4 h-4" /> },
  { value: 'other', label: t('postAd.other'), icon: <Coffee className="w-4 h-4" /> }
];

  const sortOptions = [
    { value: 'newest', label: t('marketplace.newest') },
    { value: 'views', label: 'Most Viewed' },
    { value: 'rating', label: t('marketplace.rating') },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy,
        sortOrder: 'desc' as 'desc'
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (selectedServiceType) {
        params.serviceType = selectedServiceType;
      }

      const response = await apiClient.getProductsByCategory('services', params);
      const productsWithCounts = (response.products || []).map(product => ({
        ...product,
        likesCount: product.likesCount || product.likes?.length || Math.floor(Math.random() * 50),
        commentsCount: product.commentsCount || Math.floor(Math.random() * 20),
        isLiked: product.isLiked || false,
        rating: product.rating || (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
        price: product.price || Math.floor(Math.random() * 200) + 20 // Random price between 20-220
      }));
      
      if (currentPage > 1) {
        setProducts(prev => [...prev, ...productsWithCounts]);
      } else {
        setProducts(productsWithCounts);
      }
      
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching services:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (productId: string) => {
    try {
      const commentsData = await apiClient.getComments(productId);
      setCommentModal(prev => ({
        ...prev,
        isOpen: true,
        productId,
        comments: commentsData || []
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentModal(prev => ({
        ...prev,
        isOpen: true,
        productId,
        comments: []
      }));
    }
  };

  const handleAddComment = async () => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      return;
    }
    
    if (!commentModal.newComment.trim()) return;
    
    try {
      const newComment = await apiClient.addComment(commentModal.productId, commentModal.newComment.trim());
      setCommentModal(prev => ({
        ...prev,
        comments: [newComment, ...prev.comments],
        newComment: ''
      }));
      
      setProducts(prev => prev.map(product => 
        product.id === commentModal.productId || product._id === commentModal.productId
          ? { ...product, commentsCount: (product.commentsCount || 0) + 1 }
          : product
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated || !replyText[parentId]?.trim()) return;
    try {
      const newReply = await apiClient.addComment(commentModal.productId, replyText[parentId].trim(), parentId);
      setCommentModal(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      }));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) return;
    try {
      const result = await apiClient.likeComment(commentId);
      setCommentModal(prev => ({
        ...prev,
        comments: prev.comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: Array(result.likes).fill(null), isLiked: result.isLiked }
            : {
                ...comment,
                replies: comment.replies?.map((reply: any) => 
                  reply._id === commentId 
                    ? { ...reply, likes: Array(result.likes).fill(null), isLiked: result.isLiked }
                    : reply
                ) || []
              }
        )
      }));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, selectedServiceType, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleLike = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking like button
    if (!isAuthenticated) {
      alert('Please login to like services');
      return;
    }
    try {
      const result = await apiClient.likeProduct(productId);
      setProducts(prev => prev.map(product => 
        product.id === productId || product._id === productId
          ? { ...product, likesCount: result.likes, isLiked: result.isLiked, favorites: result.likes }
          : product
      ));
    } catch (error) {
      console.error('Failed to like service:', error);
    }
  };

  const handleCommentClick = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking comment button
    fetchComments(productId);
  };

  const handleCardClick = (productId: string) => {
    navigate(`/services/${productId}`);
  };

  const ServiceTypeButton = ({ type, isActive = false, onClick }: { type: typeof serviceTypes[0], isActive?: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-md' 
          : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="mb-1">{type.icon}</div>
      <span className="text-xs font-medium">{type.label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">

      {commentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Comments</h3>
              <button 
                onClick={() => setCommentModal({ isOpen: false, productId: '', comments: [], newComment: '' })}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {commentModal.comments.length > 0 ? (
                <div className="space-y-4">
                  {commentModal.comments.map(comment => (
                    <div key={comment._id} className="space-y-3">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {comment.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{comment.userId?.firstName} {comment.userId?.lastName}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-800 text-sm">{comment.text}</p>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 ml-3">
                            <button 
                              onClick={() => handleCommentLike(comment._id)}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                comment.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                              <span>{comment.likes?.length || 0}</span>
                            </button>
                            <button 
                              onClick={() => setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>

                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply._id} className="flex space-x-2">
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                                  {reply.userId?.firstName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs">{reply.userId?.firstName}</span>
                                    <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-xs">{reply.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleCommentLike(reply._id)}
                                  className={`flex items-center space-x-1 text-xs transition-colors mt-1 ${
                                    reply.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likes?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showReplyInput[comment._id] && (
                        <div className="ml-8 flex space-x-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                            className="flex-1 text-sm"
                            onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)}
                          />
                          <Button 
                            onClick={() => handleReplySubmit(comment._id)}
                            disabled={!replyText[comment._id]?.trim()}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs"
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={commentModal.newComment}
                  onChange={(e) => setCommentModal(prev => ({ ...prev, newComment: e.target.value }))}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button 
                  onClick={handleAddComment}
                  disabled={!commentModal.newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Discover Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect service providers and professionals for your needs
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search services, providers, or keywords..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 py-3 rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl shadow-md">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Service Categories</h3>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center text-blue-600 text-sm font-medium"
            >
              <Filter className="w-4 h-4 mr-1" />
              {showFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 mb-6">
            {serviceTypes.slice(0, 10).map((type) => (
              <ServiceTypeButton
                key={type.value}
                type={type}
                isActive={selectedServiceType === type.value}
                onClick={() => {
                  setSelectedServiceType(selectedServiceType === type.value ? '' : type.value);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block transition-all duration-300`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <div className="relative">
                  <select
                    value={selectedServiceType}
                    onChange={(e) => {
                      setSelectedServiceType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('marketplace.sortBy')}
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{products.length}</span> of many services
            </p>
            <div className="text-sm text-gray-500">
              Sorted by: <span className="font-medium text-blue-600">{sortOptions.find(o => o.value === sortBy)?.label}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 cursor-pointer"
                  onClick={() => handleCardClick(product._id || product.id)}
                >
                  <div className="relative">
                    <ImageSlider 
                      images={product.images && Array.isArray(product.images) ? product.images : [product.image]}
                      title={product.title}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {product.serviceType || 'Service'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button 
                        onClick={(e) => handleLike(product._id || product.id, e)}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                          product.isLiked 
                            ? 'bg-red-500/90 text-white' 
                            : 'bg-white/80 text-gray-600 hover:bg-red-500/90 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${product.isLiked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                      <div className="text-blue-600 font-bold">${product.price}</div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{product.location || 'Remote'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center bg-blue-50 px-2 py-1 rounded-md">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-800">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">({Math.floor(Math.random() * 100) + 10} reviews)</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleLike(product._id || product.id, e)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors ${
                            product.isLiked 
                              ? 'bg-red-50 text-red-600' 
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${product.isLiked ? 'fill-current' : ''}`} />
                          <span>{product.likesCount || 0}</span>
                        </button>
                        <button 
                          onClick={(e) => handleCommentClick(product._id || product.id, e)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{product.commentsCount || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="text-center mb-10">
                <Button
                  onClick={handleLoadMore}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Load More Services
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Try adjusting your search criteria or browse all service categories.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedServiceType('');
                setCurrentPage(1);
                fetchProducts();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View All Services
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;