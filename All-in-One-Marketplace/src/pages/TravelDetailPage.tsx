import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share, MessageCircle, User, Send, ThumbsUp, MapPin, Clock, Star, Calendar, Users, Phone, Mail, Globe, Shield, Award, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
      setIsLiked(productData.isLiked || false);
    } catch (error: any) {
      setError(error.message || 'Failed to load product');
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

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    try {
      const result = await apiClient.likeProduct(id!);
      setProduct(prev => ({ ...prev, likesCount: result.likes, isLiked: result.isLiked }));
      setIsLiked(result.isLiked);
    } catch (error) {
      console.error('Failed to like product:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !commentText.trim()) return;
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
    if (!isAuthenticated) return;
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
    if (!isAuthenticated || !replyText[parentId]?.trim()) return;
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

  // Mock images for demonstration
  const productImages = [
    product?.image,
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop'
  ];

  const features = [
    { icon: Shield, text: 'Safety Certified', color: 'text-green-600' },
    { icon: Award, text: 'Best Rated', color: 'text-yellow-600' },
    { icon: CheckCircle, text: 'Instant Confirmation', color: 'text-blue-600' },
    { icon: Users, text: 'Small Group', color: 'text-purple-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button 
            onClick={() => navigate('/travel')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Travel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/travel')}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border hover:border-indigo-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Travel
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold">{product.rating || '4.8'}</span>
                <span className="text-gray-500 ml-1">({product.reviews || 124})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Product Images Carousel */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentImageIndex === index 
                          ? 'bg-white' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                      <span className="font-medium">{product.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-indigo-600">
                    ${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')}
                  </div>
                  <div className="text-gray-500">per person</div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
                    <feature.icon className={`w-5 h-5 mr-2 ${feature.color}`} />
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* Social Actions */}
              <div className="flex items-center space-x-4 py-6 border-y">
                <button 
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                    isLiked 
                      ? 'bg-red-50 text-red-600 shadow-red-100' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } shadow-sm hover:shadow-md`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{product.likesCount || 0}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <MessageCircle className="w-6 h-6" />
                  <span className="font-semibold">{comments.length}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all">
                  <Share className="w-6 h-6" />
                  <span className="font-semibold">Share</span>
                </button>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Experience Details</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {product.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {product.included && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-indigo-900 mb-2">What's Included</h4>
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
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-orange-900 mb-2">What to Bring</h4>
                      <ul className="space-y-2 text-gray-700">
                        {product.toBring.split(',').map((item, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-orange-500 mr-2" />
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-semibold mb-6 flex items-center text-gray-900">
                <MessageCircle className="w-6 h-6 mr-2 text-indigo-500" />
                Traveler Reviews ({comments.length})
              </h3>

              {/* Add Comment */}
              {isAuthenticated ? (
                <div className="flex space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 pr-16 text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          handleCommentSubmit();
                        }
                      }}
                    />
                    <button 
                      onClick={handleCommentSubmit}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors"
                      disabled={!commentText.trim()}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-8 border-2 border-dashed border-gray-200">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-lg font-medium">Sign in to share your experience</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment._id} className="flex space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {comment.userId?.avatar ? (
                        <img src={comment.userId.avatar} alt={comment.userId.firstName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-semibold text-gray-900">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl px-6 py-4 mb-4 shadow-sm">
                        <p className="text-gray-800 leading-relaxed">{comment.text}</p>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <button 
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                          }`}
                        >
                          <ThumbsUp className={`w-5 h-5 ${comment.isLiked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{comment.likes?.length || 0}</span>
                        </button>
                        <button 
                          onClick={() => setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="ml-8 mt-6 space-y-4 border-l-2 border-indigo-200 pl-6">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-sm text-gray-900">{reply.userId?.firstName}</span>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg px-4 py-3 mb-2">
                                  <p className="text-sm text-gray-700">{reply.text}</p>
                                </div>
                                <button 
                                  onClick={() => handleCommentLike(reply._id)}
                                  className={`flex items-center space-x-1 text-xs transition-colors ${
                                    reply.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
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

                      {/* Reply Input */}
                      {showReplyInput[comment._id] && (
                        <div className="ml-8 mt-4 flex space-x-3">
                          <input
                            type="text"
                            value={replyText[comment._id] || ''}
                            onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                            placeholder="Write a reply..."
                            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          />
                          <button 
                            onClick={() => handleReplySubmit(comment._id)}
                            className="bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm hover:bg-indigo-600 transition-colors flex items-center"
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-gray-900">Book Your Adventure</h3>
              
              <div className="space-y-5 mb-6">
                {product.duration && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-indigo-600" />
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
                      <div className="font-semibold">Group Size</div>
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
                        {product.availability === 'daily' && 'Daily tours available'}
                        {product.availability === 'weekends' && 'Weekends only'}
                        {product.availability === 'weekdays' && 'Weekdays only'}
                        {product.availability === 'appointment' && 'By appointment'}
                        {product.availability === 'seasonal' && 'Seasonal availability'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Host Information */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 text-gray-900">Hosted by</h4>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center">
                    {product.seller?.avatar ? (
                      <img src={product.seller.avatar} alt={product.hostName || product.seller.firstName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold">{product.hostName || `${product.seller?.firstName} ${product.seller?.lastName}`}</div>
                    <div className="text-sm text-gray-600">{product.hostExperience || 'Service Provider'}</div>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm">{product.rating || '0.0'} ({product.totalReviews || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Buttons */}
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

                {/* Price Summary */}
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

                {/* Book Button */}
                <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Book Now - ${typeof product.price === 'number' ? product.price : parseFloat(product.price || '0')}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  {product.cancellationPolicy === 'flexible' && 'Free cancellation up to 24 hours before'}
                  {product.cancellationPolicy === 'moderate' && 'Free cancellation up to 48 hours before'}
                  {product.cancellationPolicy === 'strict' && 'No free cancellation'}
                  {!product.cancellationPolicy && 'Free cancellation up to 24 hours before'}
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