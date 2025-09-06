import React, { useEffect, useState } from 'react';
import { Compass, MessageCircle, Heart, Share, User, Send, ThumbsUp, MapPin, Clock, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';
import { ProductCard } from '../components/ProductCard';

const TravelPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await apiClient.getProductsByCategory('travel', { page: 1, limit: 12 });
        const productsWithSocial = res.products.map(product => ({
          ...product,
          likesCount: product.likes?.length || 0,
          commentsCount: product.commentsCount || 0
        }));
        setItems(productsWithSocial);
        
        // Initialize liked posts from API response
        const likedProductIds = res.products
          .filter(product => product.isLiked)
          .map(product => product._id);
        setLikedPosts(new Set(likedProductIds));
      } catch (e: any) {
        setError(e?.message || t('common.loadingError'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const handleLike = async (productId: string) => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    try {
      const result = await apiClient.likeProduct(productId);
      setItems(prev => prev.map(item => 
        item._id === productId 
          ? { ...item, likesCount: result.likes, isLiked: result.isLiked }
          : item
      ));
      if (result.isLiked) {
        setLikedPosts(prev => new Set([...prev, productId]));
      } else {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Failed to like product:', error);
    }
  };

  const loadComments = async (productId: string) => {
    try {
      const productComments = await apiClient.getComments(productId);
      setComments(prev => ({ ...prev, [productId]: productComments }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleCommentSubmit = async (productId: string) => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    if (!commentText.trim()) return;
    
    try {
      const newComment = await apiClient.addComment(productId, commentText.trim());
      setComments(prev => ({
        ...prev,
        [productId]: [newComment, ...(prev[productId] || [])]
      }));
      setItems(prev => prev.map(item => 
        item._id === productId 
          ? { ...item, commentsCount: (item.commentsCount || 0) + 1 }
          : item
      ));
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleCommentLike = async (commentId: string, productId: string) => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    try {
      const result = await apiClient.likeComment(commentId);
      setComments(prev => ({
        ...prev,
        [productId]: prev[productId]?.map(comment => 
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
        ) || []
      }));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleReplySubmit = async (productId: string, parentId: string) => {
    if (!isAuthenticated) {
      alert(t('auth.loginRequired'));
      return;
    }
    if (!replyText[parentId]?.trim()) return;
    
    try {
      const newReply = await apiClient.addComment(productId, replyText[parentId].trim(), parentId);
      setComments(prev => ({
        ...prev,
        [productId]: prev[productId]?.map(comment => 
          comment._id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ) || []
      }));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const toggleComments = async (productId: string) => {
    if (expandedPost === productId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(productId);
      if (!comments[productId]) {
        await loadComments(productId);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Compass className="h-7 w-7 text-indigo-500 mr-2" />
                {t('travel.title')}
              </h1>
              <p className="text-gray-500 text-sm">
                {t('travel.subtitle')}
              </p>
            </div>
            
            {isAuthenticated && (
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors self-start">
                {t('travel.postAd')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Intro */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
            {t('travel.exploreWorld')}
          </h2>
          <p className="text-base text-gray-600">
            {t('travel.description')}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-8 text-center shadow-sm text-sm">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p: any) => (
              <div key={p._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <ProductCard
                  id={p._id}
                  title={p.title}
                  price={p.price}
                  location={p.location || t('travel.worldwide')}
                  rating={p.rating}
                  image={p.image}
                  category={p.category}
                  featured={p.featured}
                  className="!rounded-none !shadow-none !p-0"
                />
                
                {/* Product Details */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{p.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{p.rating || '4.5'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                </div>
                
                {/* Social Interaction Section */}
                <div className="p-4">
                  {/* Like, Comment, Share Buttons */}
                  <div className="flex justify-between mb-4">
                    <button 
                      onClick={() => handleLike(p._id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        p.isLiked || likedPosts.has(p._id) 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${p.isLiked || likedPosts.has(p._id) ? 'fill-current' : ''}`} />
                      <span className="font-medium">{p.likesCount || 0}</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleComments(p._id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        expandedPost === p._id
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{p.commentsCount || 0}</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                      <Share className="w-5 h-5" />
                      <span className="font-medium">Share</span>
                    </button>
                  </div>
                  
                  {/* Posted by */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{t('productDetail.seller')}: {p.seller?.firstName || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDate(p.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Comments Section */}
                  {expandedPost === p._id && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-indigo-500" />
                        {t('productDetail.reviews')} ({p.commentsCount || 0})
                      </h4>
                      
                      {/* Comment List */}
                      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                        {comments[p._id]?.length > 0 ? (
                          comments[p._id]?.map(comment => (
                            <div key={comment._id} className="flex space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {comment.userId?.avatar ? (
                                  <img 
                                    src={comment.userId.avatar} 
                                    alt={comment.userId.firstName}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium text-sm text-gray-900">
                                    {comment.userId?.firstName} {comment.userId?.lastName}
                                  </span>
                                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                </div>
                                
                                {/* Comment Text with Beautiful Background */}
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg px-4 py-3 mb-2 shadow-sm border border-indigo-100">
                                  <p className="text-sm text-gray-800 leading-relaxed">{comment.text}</p>
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                  <button 
                                    onClick={() => handleCommentLike(comment._id, p._id)}
                                    className={`text-xs flex items-center transition-colors ${
                                      comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                    }`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                                    <span>{comment.likes?.length || 0}</span>
                                  </button>
                                  <button 
                                    onClick={() => setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    {t('common.reply')}
                                  </button>
                                </div>
                                
                                {/* Replies */}
                                {comment.replies?.length > 0 && (
                                  <div className="ml-4 mt-3 space-y-3 border-l-2 border-indigo-100 pl-4">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply._id} className="flex space-x-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                          {reply.userId?.avatar ? (
                                            <img 
                                              src={reply.userId.avatar} 
                                              alt={reply.userId.firstName}
                                              className="w-6 h-6 rounded-full object-cover"
                                            />
                                          ) : (
                                            <User className="w-4 h-4 text-blue-600" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-xs text-gray-900">
                                              {reply.userId?.firstName}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                          </div>
                                          
                                          {/* Reply Text with Beautiful Background */}
                                          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg px-3 py-2 mb-1 shadow-sm border border-blue-100">
                                            <p className="text-xs text-gray-700 leading-relaxed">{reply.text}</p>
                                          </div>
                                          
                                          <button 
                                            onClick={() => handleCommentLike(reply._id, p._id)}
                                            className={`text-xs flex items-center transition-colors ${
                                              reply.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                            }`}
                                          >
                                            <ThumbsUp className={`w-3 h-3 mr-1 ${reply.isLiked ? 'fill-current' : ''}`} />
                                            <span>{reply.likes?.length || 0}</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Reply Input */}
                                {showReplyInput[comment._id] && (
                                  <div className="ml-4 mt-3 flex space-x-2">
                                    <input
                                      type="text"
                                      value={replyText[comment._id] || ''}
                                      onChange={(e) => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                      placeholder={t('common.writeReply')}
                                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                    <button 
                                      onClick={() => handleReplySubmit(p._id, comment._id)}
                                      className="bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center"
                                      disabled={!replyText[comment._id]?.trim()}
                                    >
                                      <Send className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">{t('common.noComments')}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Add Comment */}
                      {isAuthenticated ? (
                        <div className="flex space-x-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {user?.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.firstName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder={t('common.writeComment')}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && commentText.trim()) {
                                  handleCommentSubmit(p._id);
                                }
                              }}
                            />
                            <button 
                              onClick={() => handleCommentSubmit(p._id)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-600 disabled:text-gray-300"
                              disabled={!commentText.trim()}
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">
                            {t('auth.loginToComment')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="bg-gradient-to-r from-indigo-600 to-blue-600 mt-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {t('travel.readyForJourney')}
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">
            {t('travel.bookExperiences')}
          </p>
          <button className="px-6 py-3 text-base font-semibold rounded-xl bg-white text-indigo-600 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            {t('travel.startBooking')}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TravelPage;