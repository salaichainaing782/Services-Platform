import React, { useState, useEffect } from 'react';
import { Heart, Star, MapPin, Eye } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ImageSlider: React.FC<{ images: string[], title: string }> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [images.length]);
  
  if (images.length === 1) {
    return (
      <img 
        src={images[0]} 
        alt={title}
        className="h-32 sm:h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => { 
          const target = e.target as HTMLImageElement;
          target.onerror = null; 
          target.src='https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found'; 
        }}
      />
    );
  }
  
  return (
    <div className="relative h-32 sm:h-40">
      <img 
        src={images[currentIndex]} 
        alt={`${title} ${currentIndex + 1}`}
        className="h-32 sm:h-40 w-full object-cover transition-all duration-500 group-hover:scale-105"
        onError={(e) => { 
          const target = e.target as HTMLImageElement;
          target.onerror = null; 
          target.src='https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found'; 
        }}
      />
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface ProductCardProps {
  id: string;
  title: string;
  price?: string;
  location?: string;
  rating?: number;
  image: string;
  images?: string[];
  category: 'marketplace' | 'secondhand' | 'jobs' | 'services' | 'travel';
  featured?: boolean;
  className?: string;
  views?: number;
  favorites?: number;
  linkTo?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  location,
  rating,
  image,
  images,
  category,
  featured = false,
  className,
  views = 0,
  favorites = 0,
  linkTo
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(favorites);
  const [isToggling, setIsToggling] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const handleCardClick = () => {
    if (linkTo) {
      window.location.href = linkTo;
    } else {
      // Default routing based on category
      switch (category) {
        case 'jobs':
          window.location.href = `/jobs/${id}`;
          break;
        case 'services':
          window.location.href = `/services/${id}`;
          break;
        case 'travel':
          window.location.href = `/travel/${id}`;
          break;
        case 'marketplace':
        case 'secondhand':
        default:
          window.location.href = `/products/${id}`;
          break;
      }
    }
  };

  // Check if product is in user's favorites on mount
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const checkFavorite = async () => {
        try {
          const userFavorites = await apiClient.getUserFavorites({ limit: 1000 });
          const isInFavorites = userFavorites.products.some(fav => fav.id === id || fav._id === id);
          setIsFavorite(isInFavorites);
        } catch (error) {
          console.error('Failed to check favorites:', error);
        }
      };
      checkFavorite();
    }
  }, [id, isAuthenticated, user]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (isToggling) return;

    try {
      setIsToggling(true);
      const response = await apiClient.toggleFavorite(id);
      setIsFavorite(response.isFavorite);
      setFavoriteCount(prev => response.isFavorite ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginModal(false);
    window.location.href = '/login';
  };
  const getCategoryColor = () => {
    switch (category) {
      case 'marketplace': return 'bg-blue-500';
      case 'secondhand': return 'bg-green-500';
      case 'jobs': return 'bg-purple-500';
      case 'services': return 'bg-amber-500';
      case 'travel': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'marketplace': return 'New';
      case 'secondhand': return 'Used';
      case 'jobs': return 'Job';
      case 'services': return 'Service';
      case 'travel': return 'Trip';
      default: return '';
    }
  };

  return (
    <div onClick={handleCardClick} className={cn('bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer', className)}>
      {featured && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
          Featured
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-10">
        <button 
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 transition-colors ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'}`} />
        </button>
      </div>

      <div className="relative">
        {category === 'jobs' && !image && (!images || images.length === 0) ? (
          <div className="h-32 sm:h-40 w-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">💼</div>
              <div className="text-sm text-purple-600 font-medium">Job Opportunity</div>
            </div>
          </div>
        ) : (
          <ImageSlider 
            images={images && Array.isArray(images) ? images : (image ? [image] : ['https://placehold.co/400x400/cccccc/ffffff?text=No+Image'])}
            title={title}
          />
        )}
        <div className="absolute top-2 left-2">
          <span className={cn('text-white text-xs font-bold px-2 py-1 rounded', getCategoryColor())}>
            {getCategoryLabel()}
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-3">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 truncate mb-1" title={title}>
          {title}
        </h3>
        
        {price && (
          <p className="text-sm sm:text-lg font-bold text-green-600 mt-1">${typeof price === 'string' ? parseFloat(price.replace('$', '') || '0').toFixed(2) : price}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1 sm:mt-2">
          <div className="flex items-center">
            <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            <span>{location || 'Not specified'}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-yellow-400" fill="currentColor" />
            <span>{rating || '0.0'}</span>
          </div>
        </div>
        

      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Login Required</h3>
            <p className="text-gray-600 mb-6">Please login to add favorites</p>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowLoginModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleLoginRedirect}
                className="flex-1"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};