import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface RatingComponentProps {
  productId: string;
  currentRating?: number;
  totalReviews?: number;
  onRatingUpdate?: (rating: number, totalReviews: number) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({
  productId,
  currentRating = 0,
  totalReviews = 0,
  onRatingUpdate
}) => {
  const { isAuthenticated, user } = useAuth();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [productId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProductRatings(productId, { limit: 5 });
      setRatings(response.ratings);
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!isAuthenticated || userRating === 0) return;
    
    try {
      setSubmitting(true);
      await apiClient.addRating(productId, userRating, userReview);
      
      // Reload ratings and update parent component
      await loadRatings();
      
      // Calculate new average (simplified)
      const newTotal = totalReviews + 1;
      const newAverage = ((currentRating * totalReviews) + userRating) / newTotal;
      
      if (onRatingUpdate) {
        onRatingUpdate(Math.round(newAverage * 10) / 10, newTotal);
      }
      
      setShowRatingForm(false);
      setUserRating(0);
      setUserReview('');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const StarRating = ({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate && onRate(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <StarRating rating={currentRating} />
            <span className="ml-2 text-lg font-semibold">{currentRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-600">({totalReviews} reviews)</span>
        </div>
        
        {isAuthenticated && (
          <button
            onClick={() => setShowRatingForm(!showRatingForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Form */}
      {showRatingForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Rate this {productId.includes('job') ? 'job' : 'product'}</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <StarRating rating={userRating} interactive onRate={setUserRating} />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
            <textarea
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSubmitRating}
              disabled={userRating === 0 || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit
            </button>
            <button
              onClick={() => setShowRatingForm(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="font-semibold mb-4">Recent Reviews</h4>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating._id} className="border-b border-gray-200 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {rating.userId?.avatar ? (
                      <img src={rating.userId.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{rating.userId?.firstName} {rating.userId?.lastName}</span>
                      <span className="text-sm text-gray-500">{formatDate(rating.createdAt)}</span>
                    </div>
                    <StarRating rating={rating.rating} />
                    {rating.review && (
                      <p className="text-gray-700 mt-2">{rating.review}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default RatingComponent;