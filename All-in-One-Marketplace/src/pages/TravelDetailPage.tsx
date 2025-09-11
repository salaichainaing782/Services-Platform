import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, MessageCircle, User, Send, ThumbsUp, MapPin, Clock, Star, Calendar, Users, Phone, Mail, Globe, Shield, Award, CheckCircle, ChevronRight, Image, Video, Bookmark, Flag, Eye, Download, X, ChevronLeft, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import RatingComponent from '../components/RatingComponent';

// Login Modal Component
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Sign In Required</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            You need to be signed in to perform this action. Please log in or create an account to continue.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => {
              onClose();
              navigate('/login', { state: { from: window.location.pathname } });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate('/register', { state: { from: window.location.pathname } });
            }}
            className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

const TravelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<() => void>(() => {});
  
  const isService = product?.category === 'services';
  const isTravel = product?.category === 'travel';

  useEffect(() => {
    if (id) {
      loadProduct();
      loadComments();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await apiClient.getProductById(id!);
      setProduct(productData);
      // Check if current user has liked this product
      const userHasLiked = isAuthenticated && user && productData.likes && 
        productData.likes.some(likeId => likeId === user.id || likeId.toString() === user.id);
      setIsLiked(userHasLiked || productData.isLiked || false);
      setIsBookmarked(productData.isBookmarked || false);
      
      // Increment view count
      try {
        await apiClient.incrementProductViews(id!);
        setProduct(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
      } catch (e) {
        console.error('Failed to increment view count:', e);
      }
    } catch (error: any) {
      setError(error.message || `Failed to load ${product?.category === 'services' ? 'service' : 'product'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const commentsData = await apiClient.getComments(id!);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('common.justNow');
    if (diffInMinutes < 60) return t('common.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('common.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('common.daysAgo', { count: diffInDays });
    
    return date.toLocaleDateString();
  };

  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      setLoginAction(() => action);
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleLike = async () => {
    try {
      const result = await apiClient.likeProduct(id!);
      setProduct(prev => ({ 
        ...prev, 
        likesCount: result.likes, 
        isLiked: result.isLiked,
        likes: result.isLiked 
          ? [...(prev.likes || []), user?.id] 
          : (prev.likes || []).filter(likeId => likeId !== user?.id)
      }));
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error(`Failed to like ${isService ? 'service' : 'product'}:`, error);
    }
  };

  const handleBookmark = async () => {
    try {
      const result = await apiClient.bookmarkProduct(id!);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await apiClient.addComment(id!, commentText.trim());
      setComments(prev => [newComment, ...prev]);
      setProduct(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const result = await apiClient.likeComment(commentId);
      setComments(prev => prev.map(comment => 
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
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText[parentId]?.trim()) return;
    try {
      const newReply = await apiClient.addComment(id!, replyText[parentId].trim(), parentId);
      setComments(prev => prev.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images.slice(0, 4)
    : [product?.image].filter(Boolean).slice(0, 4);
  
  // Auto-slide functionality
  useEffect(() => {
    if (productImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [productImages.length]);

  const getServiceTypeLabel = (serviceType: string) => {
    const serviceTypes = {
      consulting: t('postAd.consulting'),
      design: t('postAd.design'),
      development: t('postAd.development'),
      marketing: t('postAd.marketing'),
      education: t('postAd.education'),
      travel: t('postAd.travel'),
      hotel: t('postAd.hotel'),
      accommodation: t('postAd.accommodation'),
      bar: t('postAd.bar'),
      ktv: t('postAd.ktv'),
      massage: t('postAd.massage'),
      gym: t('postAd.gym'),
      tea: t('postAd.tea'),
      coffee: t('postAd.coffee'),
      restaurant: t('postAd.restaurant'),
      other: t('postAd.other')
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const features = isService ? [
    { icon: Shield, text: 'Verified Provider', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Award, text: 'Top Rated', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { icon: CheckCircle, text: 'Quick Response', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Users, text: 'Professional Service', color: 'text-purple-600', bg: 'bg-purple-100' }
  ] : [
    { icon: Shield, text: 'Safety Certified', color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Award, text: 'Best Rated', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { icon: CheckCircle, text: 'Instant Confirmation', color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Users, text: 'Small Group', color: 'text-purple-600', bg: 'bg-purple-100' }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isService ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 ${isService ? 'border-amber-600' : 'border-indigo-600'} mx-auto mb-4`}></div>
          <p className="text-gray-600">Loading {isService ? 'service' : 'travel'} details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`min-h-screen ${isService ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{isService ? 'Service' : 'Experience'} not found</h2>
          <p className="text-gray-600 mb-6">The {isService ? 'service' : 'experience'} you're looking for doesn't exist or may have been removed.</p>
          <button 
            onClick={() => navigate(isService ? '/services' : '/travel')}
            className={`${isService ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center mx-auto`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to {isService ? 'Services' : 'Travel'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isService ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={() => {
          setShowLoginModal(false);
          loginAction();
        }}
      />

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={productImages[currentImageIndex]} 
              alt={product.title}
              className="w-full h-auto max-h-screen object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {productImages.length}
            </div>
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <button className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(isService ? '/services' : '/travel')}
              className={`flex items-center ${isService ? 'text-amber-600 hover:text-amber-700' : 'text-indigo-600 hover:text-indigo-700'} transition-colors bg-white px-4 py-2 rounded-xl border ${isService ? 'border-amber-200 hover:border-amber-300' : 'border-indigo-200 hover:border-indigo-300'} shadow-sm`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to {isService ? 'Services' : 'Travel'}
            </button>
            
            <div className="flex items-center space-x-4">
              {isService && product.serviceType && (
                <div className={`${isService ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'} px-3 py-1 rounded-full text-sm font-medium`}>
                  {getServiceTypeLabel(product.serviceType)}
                </div>
              )}
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <Eye className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">{product.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className={`aspect-video ${isService ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-blue-100 to-indigo-100'} relative cursor-pointer`} onClick={() => setShowImageModal(true)}>
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Image className="w-12 h-12 text-white/80" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentImageIndex === index 
                          ? (isService ? 'bg-amber-500' : 'bg-indigo-500') 
                          : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-4 gap-2">
                {productImages.map((img, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      currentImageIndex === index 
                        ? (isService ? 'border-amber-500' : 'border-indigo-500') 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h1 className="text-4xl font-bold text-gray-900 mr-3">{product.title}</h1>
                    <button 
                      onClick={() => handleAuthAction(handleBookmark)}
                      className={`p-2 rounded-full transition-colors ${
                        isBookmarked 
                          ? (isService ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600')
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className={`w-5 h-5 mr-2 ${isService ? 'text-amber-500' : 'text-indigo-500'}`} />
                      <span className="font-medium">{product.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className={`w-5 h-5 mr-2 ${isService ? 'text-amber-500' : 'text-indigo-500'}`} />
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {!isService && (
                  <div className="text-right">
                    <div className="text-4xl font-bold text-indigo-600">
                      ${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')}
                    </div>
                    <div className="text-gray-500">per person</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className={`flex items-center p-3 ${feature.bg} rounded-xl`}>
                    <feature.icon className={`w-5 h-5 mr-2 ${feature.color}`} />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4 py-6 border-y">
                <button 
                  onClick={() => handleAuthAction(handleLike)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 shadow-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  } shadow-sm hover:shadow-md`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-red-600' : 'text-gray-600'}`} />
                  <span className="font-semibold">{product.likesCount || product.likes?.length || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">{comments.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <Share className="w-6 h-6" />
                  <span className="font-semibold">Share</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <Flag className="w-6 h-6" />
                  <span className="font-semibold">Report</span>
                </button>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{isService ? 'Service Details' : 'Experience Details'}</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Rating Section */}
              <div className="mt-8 border-t pt-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-900">Ratings & Reviews</h3>
                <RatingComponent 
                  productId={product._id || product.id}
                  currentRating={product.rating || 0}
                  totalReviews={product.totalReviews || 0}
                  onRatingUpdate={(rating, totalReviews) => {
                    setProduct(prev => prev ? { ...prev, rating, totalReviews } : null);
                  }}
                  requireAuth={() => handleAuthAction(() => {})}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {product.included && (
                    <div className={`${isService ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} p-4 rounded-xl`}>
                      <h4 className={`font-semibold ${isService ? 'text-amber-900' : 'text-indigo-900'} mb-2`}>What's Included</h4>
                      <ul className="space-y-2 text-gray-700">
                        {product.included.split(',').map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product.toBring && (
                    <div className={`${isService ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-orange-50 to-amber-50'} p-4 rounded-xl`}>
                      <h4 className={`font-semibold ${isService ? 'text-blue-900' : 'text-orange-900'} mb-2`}>{isService ? 'Requirements' : 'What to Bring'}</h4>
                      <ul className="space-y-2 text-gray-700">
                        {product.toBring.split(',').map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className={`w-4 h-4 ${isService ? 'text-blue-500' : 'text-orange-500'} mr-2`} />
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-900">
                <MessageCircle className={`w-6 h-6 mr-2 ${isService ? 'text-amber-500' : 'text-indigo-500'}`} />
                {isService ? 'Customer Reviews' : 'Traveler Reviews'} ({comments.length})
              </h3>

              {isAuthenticated ? (
                <div className="flex space-x-4 mb-8">
                  <div className={`w-12 h-12 ${isService ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-indigo-100 to-blue-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className={`w-6 h-6 ${isService ? 'text-amber-600' : 'text-indigo-600'}`} />
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your experience..."
                      className={`w-full border-2 border-gray-200 rounded-xl px-6 py-4 pr-16 text-lg focus:outline-none ${isService ? 'focus:border-amber-500 focus:ring-2 focus:ring-amber-200' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'} transition-all`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          handleCommentSubmit();
                        }
                      }}
                    />
                    <button 
                      onClick={handleCommentSubmit}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${isService ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white p-2 rounded-lg transition-colors`}
                      disabled={!commentText.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-6 ${isService ? 'bg-gradient-to-r from-gray-50 to-amber-50' : 'bg-gradient-to-r from-gray-50 to-blue-50'} rounded-xl mb-8 border-2 border-dashed border-gray-200`}>
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <button 
                    onClick={() => handleAuthAction(() => {})}
                    className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                  >
                    Sign in to share your experience
                  </button>
                </div>
              )}
              
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment._id} className="flex space-x-4">
                    <div className={`w-12 h-12 ${isService ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-indigo-100 to-blue-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {comment.userId?.avatar ? (
                        <img src={comment.userId.avatar} alt={comment.userId.firstName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className={`w-6 h-6 ${isService ? 'text-amber-600' : 'text-indigo-600'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-900">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      <div className={`${isService ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-indigo-50 to-blue-50'} rounded-xl px-6 py-4 mb-4 shadow-sm`}>
                        <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => handleAuthAction(() => handleCommentLike(comment._id))}
                          className={`flex items-center space-x-2 transition-colors ${
                            comment.isLiked ? (isService ? 'text-amber-600' : 'text-blue-600') : (isService ? 'text-gray-500 hover:text-amber-600' : 'text-gray-500 hover:text-blue-600')
                          }`}
                        >
                          <ThumbsUp className={`w-5 h-5 ${comment.isLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{comment.likes?.length || 0}</span>
                        </button>
                        <button 
                          onClick={() => handleAuthAction(() => setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] })))}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Reply
                        </button>
                      </div>

                      {comment.replies?.length > 0 && (
                        <div className={`ml-8 mt-6 space-y-4 border-l-2 ${isService ? 'border-amber-200' : 'border-indigo-200'} pl-6`}>
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex space-x-3">
                              <div className={`w-10 h-10 ${isService ? 'bg-gradient-to-br from-orange-100 to-amber-100' : 'bg-gradient-to-br from-blue-100 to-sky-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                                <User className={`w-5 h-5 ${isService ? 'text-orange-600' : 'text-blue-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-sm text-gray-900">{reply.userId?.firstName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <div className={`${isService ? 'bg-gradient-to-r from-orange-50 to-amber-50' : 'bg-gradient-to-r from-blue-50 to-sky-50'} rounded-lg px-4 py-3 mb-2`}>
                                  <p className="text-sm text-gray-700">{reply.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleAuthAction(() => handleCommentLike(reply._id))}
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    reply.isLiked ? (isService ? 'text-amber-600' : 'text-blue-600') : (isService ? 'text-gray-500 hover:text-amber-600' : 'text-gray-500 hover:text-blue-600')
                                  }`}
                                >
                                  <ThumbsUp className={`w-4 h-4 ${reply.isLiked ? 'fill-current' : ''}`} />
                                  <span>{reply.likes?.length || 0}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showReplyInput[comment._id] && (
                        <div className="ml-8 mt-4 flex space-x-3">
                          <input
                            type="text"
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className={`flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none ${isService ? 'focus:border-amber-500 focus:ring-2 focus:ring-amber-200' : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}`}
                          />
                          <button 
                            onClick={() => handleReplySubmit(comment._id)}
                            className={`${isService ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white px-4 py-3 rounded-xl text-sm transition-colors flex items-center`}
                            disabled={!replyText[comment._id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-gray-900">{isService ? 'Service Information' : 'Book Your Adventure'}</h3>
              
              <div className="space-y-5 mb-6">
                {product.duration && (
                  <div className={`flex items-center space-x-4 p-4 ${isService ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-indigo-50 to-blue-50'} rounded-xl`}>
                    <Calendar className={`w-6 h-6 ${isService ? 'text-amber-600' : 'text-indigo-600'}`} />
                    <div>
                      <div className="font-semibold">Duration</div>
                      <div className="text-gray-600">{product.duration}</div>
                    </div>
                  </div>
                )}
                
                {product.groupSize && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <Users className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-semibold">{isService ? 'Capacity' : 'Group Size'}</div>
                      <div className="text-gray-600">{product.groupSize}</div>
                    </div>
                  </div>
                )}
                
                {product.availability && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-semibold">Availability</div>
                      <div className="text-gray-600">
                        {product.availability === 'daily' && (isService ? 'Available daily' : 'Daily tours available')}
                        {product.availability === 'weekends' && 'Weekends only'}
                        {product.availability === 'weekdays' && 'Weekdays only'}
                        {product.availability === 'appointment' && 'By appointment'}
                        {product.availability === 'seasonal' && 'Seasonal availability'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-gray-900">{isService ? 'Service Provider' : 'Hosted by'}</h4>
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-14 h-14 ${isService ? 'bg-gradient-to-br from-amber-100 to-orange-100' : 'bg-gradient-to-br from-indigo-100 to-blue-100'} rounded-full flex items-center justify-center`}>
                    {product.seller?.avatar ? (
                      <img src={product.seller.avatar} alt={product.hostName || product.seller.firstName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className={`w-8 h-8 ${isService ? 'text-amber-600' : 'text-indigo-600'}`} />
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{product.hostName || `${product.seller?.firstName} ${product.seller?.lastName}`}</div>
                    <div className="text-sm text-gray-600">{product.hostExperience || (isService ? 'Professional Service Provider' : 'Service Provider')}</div>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{product.rating || '0.0'} ({product.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Message</span>
                  </button>
                </div>

                {!isService && (
                  <>
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')} x 1 person</span>
                        <span className="font-semibold">${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Service fee</span>
                        <span className="font-semibold">${product.serviceFee || 15}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-bold text-lg text-indigo-600">
                            ${(typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')) + (product.serviceFee || 15)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAuthAction(() => {})}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Book Now - ${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')}
                    </button>
                  </>
                )}

                {isService && (
                  <button 
                    onClick={() => handleAuthAction(() => {})}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Contact Provider
                  </button>
                )}

                <p className="text-center text-sm text-gray-500 mt-4">
                  {isService ? (
                    <>
                      {product.cancellationPolicy === 'flexible' && 'Flexible cancellation policy'}
                      {product.cancellationPolicy === 'moderate' && 'Moderate cancellation policy'}
                      {product.cancellationPolicy === 'strict' && 'Strict cancellation policy'}
                      {!product.cancellationPolicy && 'Contact for cancellation policy'}
                    </>
                  ) : (
                    <>
                      {product.cancellationPolicy === 'flexible' && 'Free cancellation up to 24 hours before'}
                      {product.cancellationPolicy === 'moderate' && 'Free cancellation up to 48 hours before'}
                      {product.cancellationPolicy === 'strict' && 'No free cancellation'}
                      {!product.cancellationPolicy && 'Free cancellation up to 24 hours before'}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailPage;