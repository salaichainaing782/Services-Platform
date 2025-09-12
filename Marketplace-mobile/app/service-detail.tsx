import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export default function ServiceDetailScreen() {
  const params = useLocalSearchParams();
  
  if (!params.service) {
    return (
      <View style={styles.container}>
        <Text>Service not found</Text>
      </View>
    );
  }

  const service = JSON.parse(params.service as string);
  const { user, isAuthenticated } = useAuth();
  
  const [isLiked, setIsLiked] = useState(service.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(service.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(service.likesCount || service.likes?.length || 0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(service.rating || 0);
  const [totalReviews, setTotalReviews] = useState(service.totalReviews || 0);
  const [reviews, setReviews] = useState([]);

  const serviceImages = service?.images && Array.isArray(service.images) && service.images.length > 0 
    ? service.images.slice(0, 4)
    : [service?.image].filter(Boolean).slice(0, 4);

  useEffect(() => {
    loadComments();
    loadRatings();
    if (serviceImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [serviceImages.length]);

  const loadRatings = async () => {
    try {
      if (!service?._id && !service?.id) return;
      
      const ratingsData = await apiClient.getProductRatings(service._id || service.id);
      setServiceRating(ratingsData.averageRating || 0);
      setTotalReviews(ratingsData.totalReviews || 0);
      setReviews(ratingsData.ratings || []);
    } catch (error) {
      console.log('Failed to load ratings:', error.message);
    }
  };

  const loadComments = async () => {
    try {
      if (!service?._id && !service?.id) {
        console.log('No service ID found, using empty comments');
        setComments([]);
        return;
      }
      
      const serviceId = service._id || service.id;
      console.log('Loading comments for service:', serviceId);
      
      const commentsData = await apiClient.getComments(serviceId);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.log('Comments loading failed, using empty array:', error.message);
      setComments([]);
    }
  };

  const formatDate = (dateString) => {
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

  const handleAuthAction = (action) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  const handleLike = async () => {
    try {
      const result = await apiClient.likeProduct(service._id || service.id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likes || result.likesCount || (result.isLiked ? likesCount + 1 : likesCount - 1));
    } catch (error) {
      console.error('Failed to like service:', error);
      // Optimistic update as fallback
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);
    }
  };

  const handleBookmark = async () => {
    try {
      const result = await apiClient.bookmarkProduct(service._id || service.id);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark:', error);
      // Optimistic update as fallback
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await apiClient.addComment(service._id || service.id, commentText.trim());
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to add comment:', error);
      // Fallback to optimistic update
      const newComment = {
        _id: Date.now().toString(),
        text: commentText.trim(),
        userId: {
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || '',
          avatar: user?.avatar
        },
        createdAt: new Date().toISOString(),
        likes: [],
        isLiked: false,
        replies: []
      };
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      Keyboard.dismiss();
    }
  };

  const handleCommentLike = async (commentId) => {
    try {
      const result = await apiClient.likeComment(commentId);
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              likes: Array(result.likes).fill(null),
              isLiked: result.isLiked
            }
          : {
              ...comment,
              replies: comment.replies?.map((reply) => 
                reply._id === commentId 
                  ? { ...reply, likes: Array(result.likes).fill(null), isLiked: result.isLiked }
                  : reply
              ) || []
            }
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
      // Fallback to optimistic update
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              likes: comment.isLiked 
                ? comment.likes.filter(id => id !== 'current-user')
                : [...comment.likes, 'current-user'],
              isLiked: !comment.isLiked
            }
          : comment
      ));
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText[parentId]?.trim()) return;
    try {
      const newReply = await apiClient.addComment(service._id || service.id, replyText[parentId].trim(), parentId);
      setComments(prev => prev.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
      Keyboard.dismiss();
    } catch (error) {
      console.error('Failed to add reply:', error);
      // Fallback to optimistic update
      const newReply = {
        _id: Date.now().toString(),
        text: replyText[parentId].trim(),
        userId: {
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || '',
          avatar: user?.avatar
        },
        createdAt: new Date().toISOString(),
        likes: [],
        isLiked: false
      };
      
      setComments(prev => prev.map(comment => 
        comment._id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      setReplyText(prev => ({ ...prev, [parentId]: '' }));
      setShowReplyInput(prev => ({ ...prev, [parentId]: false }));
      Keyboard.dismiss();
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    try {
      const result = await apiClient.rateProduct(service._id || service.id, rating, reviewText.trim());
      setServiceRating(result.averageRating || result.rating);
      setTotalReviews(result.totalReviews);
      setUserRating(rating);
      setShowRatingModal(false);
      setRating(0);
      setReviewText('');
      Alert.alert('Success', 'Thank you for your rating!');
      loadRatings(); // Reload ratings to show new review
      loadComments();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      const newTotalReviews = totalReviews + 1;
      const newRating = ((serviceRating * totalReviews) + rating) / newTotalReviews;
      
      setServiceRating(newRating);
      setTotalReviews(newTotalReviews);
      setUserRating(rating);
      setShowRatingModal(false);
      setRating(0);
      setReviewText('');
      Alert.alert('Success', 'Thank you for your rating!');
      loadRatings();
    }
  };

  const renderStars = (rating, size = 16, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={onPress ? () => onPress(star) : undefined}
            disabled={!onPress}
          >
            <Ionicons 
              name={star <= rating ? "star" : "star-outline"} 
              size={size} 
              color={star <= rating ? "#fbbf24" : "#d1d5db"} 
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Login Modal */}
          <Modal visible={showLoginModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sign In Required</Text>
                <Text style={styles.modalText}>You need to be signed in to perform this action.</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => {
                      setShowLoginModal(false);
                      router.push('/login');
                    }}
                  >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowLoginModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Rating Modal */}
          <Modal visible={showRatingModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Rate this Service</Text>
                <Text style={styles.modalText}>How would you rate this service?</Text>
                <View style={styles.ratingStars}>
                  {renderStars(rating, 40, setRating)}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write a review (Optional)"
                  placeholderTextColor="#9ca3af"
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.loginButton, rating === 0 && styles.loginButtonDisabled]}
                    onPress={handleRatingSubmit}
                    disabled={rating === 0}
                  >
                    <Text style={styles.loginButtonText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setShowRatingModal(false);
                      setRating(0);
                      setReviewText('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Image Modal */}
          <Modal visible={showImageModal} transparent animationType="fade">
            <View style={styles.imageModalOverlay}>
              <TouchableOpacity 
                style={styles.closeImageButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={30} color="#fff" />
              </TouchableOpacity>
              <Image 
                source={{ uri: serviceImages[currentImageIndex] }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
              <Text style={styles.imageCounter}>
                {currentImageIndex + 1} / {serviceImages.length}
              </Text>
            </View>
          </Modal>

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Service Details</Text>
            <TouchableOpacity 
              onPress={() => handleAuthAction(handleBookmark)}
              style={[styles.headerActionButton, isBookmarked && styles.bookmarked]}
            >
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setShowImageModal(true)}>
            <Image source={{ uri: serviceImages[currentImageIndex] }} style={styles.serviceImage} />
            <View style={styles.imageIndicators}>
              {serviceImages.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          </TouchableOpacity>
          
          <View style={styles.content}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{service.title}</Text>
              <Text style={styles.price}>${service.price}</Text>
            </View>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingLeft}>
                  <Text style={styles.ratingNumber}>{serviceRating.toFixed(1)}</Text>
                  {renderStars(serviceRating, 20)}
                  <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
                </View>
                <TouchableOpacity 
                  style={styles.rateButton}
                  onPress={() => handleAuthAction(() => setShowRatingModal(true))}
                >
                  <Ionicons name="star-outline" size={16} color="#3b82f6" />
                  <Text style={styles.rateButtonText}>Rate Service</Text>
                </TouchableOpacity>
              </View>
              {userRating > 0 && (
                <View style={styles.userRatingDisplay}>
                  <Text style={styles.userRatingText}>Your rating: </Text>
                  {renderStars(userRating, 16)}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => handleAuthAction(handleLike)}
                style={[styles.actionButton, isLiked && styles.liked]}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isLiked ? "#ef4444" : "#6b7280"} 
                />
                <Text style={styles.actionText}>{likesCount}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                <Text style={styles.actionText}>{comments.length}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#6b7280" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* <View style={styles.providerSection}>
              <Image 
                source={{ uri: service.seller?.avatar || 'https://via.placeholder.com/50' }} 
                style={styles.providerAvatar} 
              />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{service.seller?.username || 'Provider'}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text style={styles.rating}>{serviceRating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
                </View>
              </View>
            </View> */}

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{service.description}</Text>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="location" size={20} color="#6b7280" />
                <Text style={styles.infoText}>{service.location}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#6b7280" />
                <Text style={styles.infoText}>Available: {service.availability}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="pricetag" size={20} color="#6b7280" />
                <Text style={styles.infoText}>Category: {service.serviceType}</Text>
              </View>
            </View>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <View style={styles.commentsSection}>
                <Text style={styles.sectionTitle}>Ratings & Reviews ({reviews.length})</Text>
                {reviews.map((review, index) => (
                  <View key={review._id || `review-${index}`} style={styles.reviewItem}>
                    <View style={styles.reviewHeader}>
                      <Image 
                        source={{ uri: review.userId?.avatar || 'https://via.placeholder.com/40' }} 
                        style={styles.commentAvatar} 
                      />
                      <View style={styles.reviewInfo}>
                        <Text style={styles.reviewAuthor}>
                          {review.userId?.firstName} {review.userId?.lastName}
                        </Text>
                        <View style={styles.reviewRating}>
                          {renderStars(review.rating, 14)}
                          <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                        </View>
                      </View>
                    </View>
                    {review.review && (
                      <Text style={styles.reviewText}>{review.review}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
              
              {isAuthenticated ? (
                <View style={styles.commentInput}>
                  <Image 
                    source={{ uri: user?.avatar || 'https://via.placeholder.com/40' }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentTextInput}
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Share your experience..."
                      multiline
                    />
                    <TouchableOpacity 
                      onPress={handleCommentSubmit}
                      style={styles.commentSubmitButton}
                      disabled={!commentText.trim()}
                    >
                      <Ionicons name="send" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.loginPrompt}
                  onPress={() => setShowLoginModal(true)}
                >
                  <Text style={styles.loginPromptText}>Sign in to share your experience</Text>
                </TouchableOpacity>
              )}

              {comments.map((comment, index) => (
                <View key={comment._id || `comment-${index}`} style={styles.comment}>
                  <Image 
                    source={{ uri: comment.userId?.avatar || 'https://via.placeholder.com/40' }} 
                    style={styles.commentAvatar} 
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>
                        {comment.userId?.firstName} {comment.userId?.lastName}
                      </Text>
                      <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    
                    <View style={styles.commentActions}>
                      <TouchableOpacity 
                        onPress={() => handleAuthAction(() => handleCommentLike(comment._id))}
                        style={styles.commentAction}
                      >
                        <Ionicons 
                          name={comment.isLiked ? "thumbs-up" : "thumbs-up-outline"} 
                          size={16} 
                          color={comment.isLiked ? "#3b82f6" : "#6b7280"} 
                        />
                        <Text style={styles.commentActionText}>{comment.likes?.length || 0}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => handleAuthAction(() => 
                          setShowReplyInput(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))
                        )}
                        style={styles.commentAction}
                      >
                        <Text style={styles.commentActionText}>Reply</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Replies */}
                    {comment.replies?.map((reply, replyIndex) => (
                      <View key={reply._id || `reply-${comment._id}-${replyIndex}`} style={styles.reply}>
                        <Image 
                          source={{ uri: reply.userId?.avatar || 'https://via.placeholder.com/30' }} 
                          style={styles.replyAvatar} 
                        />
                        <View style={styles.replyContent}>
                          <Text style={styles.replyAuthor}>{reply.userId?.firstName}</Text>
                          <Text style={styles.replyText}>{reply.text}</Text>
                        </View>
                      </View>
                    ))}

                    {/* Reply Input */}
                    {showReplyInput[comment._id] && (
                      <View style={styles.replyInput}>
                        <TextInput
                          style={styles.replyTextInput}
                          value={replyText[comment._id] || ''}
                          onChangeText={(text) => setReplyText(prev => ({ ...prev, [comment._id]: text }))}
                          placeholder="Write a reply..."
                        />
                        <TouchableOpacity 
                          onPress={() => handleReplySubmit(comment._id)}
                          style={styles.replySubmitButton}
                        >
                          <Ionicons name="send" size={14} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.contactButton}>
              <Text style={styles.contactButtonText}>Contact Provider</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 20, // Add padding at the bottom for better scrolling
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3b82f6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerActionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bookmarked: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  serviceImage: {
    width: '100%',
    height: 250,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#3b82f6',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  ratingSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rateButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  userRatingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  userRatingText: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  liked: {
    backgroundColor: '#fee2e2',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 5,
  },
  detailsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 10,
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  commentInput: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  commentTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingLeft: 15,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  commentSubmitButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 20,
    marginBottom: 5,
  },
  loginPrompt: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  loginPromptText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#1f2937',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentText: {
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 12,
  },
  commentActions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  commentActionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  reply: {
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 10,
    paddingLeft: 15,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
  },
  replyInput: {
    flexDirection: 'row',
    marginLeft: 20,
    marginTop: 10,
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  replySubmitButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 15,
    justifyContent: 'center',
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 20,
    minHeight: 80,
    backgroundColor: '#f9fafb',
  },
  reviewItem: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  reviewText: {
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  fullScreenImage: {
    width: '90%',
    height: '80%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
  },
});