import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  // Initialize all state hooks first
  const [isBookmarked, setIsBookmarked] = useState(false);
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
  const [productRating, setProductRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showCartModal, setShowCartModal] = useState(false);
  const [views, setViews] = useState(0);
  
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, styles.authRequired]}>
        <Ionicons name="lock-closed" size={80} color="#6b7280" />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authMessage}>You need to sign in to view product details</Text>
        <TouchableOpacity 
          style={styles.authButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!params.product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const product = JSON.parse(params.product as string);
  
  // Update state with product data after initialization
  React.useEffect(() => {
    setIsBookmarked(product.isBookmarked || false);
    setProductRating(product.rating || 0);
    setTotalReviews(product.totalReviews || 0);
    setViews(product.views || 0);
    console.log('Product data loaded:', { id: product._id || product.id, views: product.views });
  }, [product]);

  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images.slice(0, 4)
    : [product?.image].filter(Boolean).slice(0, 4);

  useEffect(() => {
    loadComments();
    loadRatings();
    
    // Prevent double increment in React Strict Mode
    let hasIncremented = false;
    if (!hasIncremented) {
      hasIncremented = true;
      incrementViews();
    }
    
    if (productImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, []);

  const incrementViews = async () => {
    try {
      if (!product?._id && !product?.id) return;
      
      const productId = product._id || product.id;
      console.log('Incrementing views for product:', productId);
      
      // Send to backend first
      const result = await apiClient.incrementProductViews(productId);
      console.log('View increment result:', result);
      
      if (result && result.views !== undefined) {
        setViews(result.views);
      } else {
        // Fallback: increment locally
        const currentViews = views || product.views || 0;
        setViews(currentViews + 1);
      }
    } catch (error) {
      console.log('View increment failed:', error);
      // Fallback: increment locally
      const currentViews = views || product.views || 0;
      setViews(currentViews + 1);
    }
  };

  const loadRatings = async () => {
    try {
      if (!product?._id && !product?.id) return;
      
      const ratingsData = await apiClient.getProductRatings(product._id || product.id);
      setProductRating(ratingsData.averageRating || 0);
      setTotalReviews(ratingsData.totalReviews || 0);
      setReviews(ratingsData.ratings || []);
    } catch (error) {
      console.log('Failed to load ratings:', error.message);
    }
  };

  const loadComments = async () => {
    try {
      if (!product?._id && !product?.id) {
        console.log('No product ID found, using empty comments');
        setComments([]);
        return;
      }
      
      const productId = product._id || product.id;
      console.log('Loading comments for product:', productId);
      
      const commentsData = await apiClient.getComments(productId);
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



  const handleBookmark = async () => {
    try {
      const result = await apiClient.bookmarkProduct(product._id || product.id);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark:', error);
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      // Add to cart logic here
      setShowCartModal(true);
      Alert.alert('Success', `Added ${quantity} item(s) to cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    try {
      const result = await apiClient.rateProduct(product._id || product.id, rating, reviewText.trim());
      setProductRating(result.averageRating || result.rating);
      setTotalReviews(result.totalReviews);
      setUserRating(rating);
      setShowRatingModal(false);
      setRating(0);
      setReviewText('');
      Alert.alert('Success', 'Thank you for your rating!');
      loadRatings();
      loadComments();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      const newTotalReviews = totalReviews + 1;
      const newRating = ((productRating * totalReviews) + rating) / newTotalReviews;
      
      setProductRating(newRating);
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
    <ScrollView style={styles.container}>
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
            <Text style={styles.modalTitle}>Rate this Product</Text>
            <Text style={styles.modalText}>How would you rate this product?</Text>
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

      {/* Cart Modal */}
      <Modal visible={showCartModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Added to Cart!</Text>
            <View style={styles.cartItemPreview}>
              <Image source={{ uri: productImages[0] }} style={styles.cartItemImage} />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemTitle}>{product.title}</Text>
                <Text style={styles.cartItemQuantity}>Quantity: {quantity}</Text>
                <Text style={styles.cartItemPrice}>${(product.price * quantity).toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  setShowCartModal(false);
                  router.push('/cart');
                }}
              >
                <Text style={styles.loginButtonText}>View Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowCartModal(false)}
              >
                <Text style={styles.cancelButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity 
          onPress={() => handleAuthAction(handleBookmark)}
          style={[styles.headerActionButton, isBookmarked && styles.bookmarked]}
        >
          <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
        </TouchableOpacity>
      </View> */}

      <Image source={{ uri: productImages[currentImageIndex] }} style={styles.productImage} />
      
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <View style={styles.ratingOverview}>
            <View style={styles.ratingLeft}>
              <Text style={styles.ratingNumber}>{productRating.toFixed(1)}</Text>
              {renderStars(productRating, 16)}
              <Text style={styles.reviewCount}>({totalReviews} reviews)</Text>
            </View>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => handleAuthAction(() => setShowRatingModal(true))}
            >
              <Ionicons name="star-outline" size={16} color="#3b82f6" />
              <Text style={styles.rateButtonText}>Rate Product</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={styles.actionText}>{reviews.length} Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color="#6b7280" />
            <Text style={styles.actionText}>{views} Views</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6b7280" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Ratings & Reviews ({reviews.length})</Text>
            {reviews.map(review => (
              <View key={review._id} style={styles.reviewItem}>
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

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addToCartButtonText}>Add to Cart - ${(product.price * quantity).toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3b82f6',
    paddingTop: 10,
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
  productImage: {
    width: '100%',
    height: 250,
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
    fontSize: 22,
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
  quantitySection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
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
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  cartItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  authRequired: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10,
  },
  authMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});