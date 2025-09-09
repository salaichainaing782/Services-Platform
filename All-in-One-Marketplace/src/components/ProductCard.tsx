import React, { useState } from 'react';
import { Heart, Star, MapPin, Eye } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  id: string;
  title: string;
  price?: string;
  location?: string;
  rating?: number;
  image: string;
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
        <img 
          src={image} 
          alt={title}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { 
            const target = e.target as HTMLImageElement;
            target.onerror = null; 
            target.src='https://placehold.co/400x400/cccccc/ffffff?text=Image+Not+Found'; 
          }}
        />
        <div className="absolute top-2 left-2">
          <span className={cn('text-white text-xs font-bold px-2 py-1 rounded', getCategoryColor())}>
            {getCategoryLabel()}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate mb-1" title={title}>
          {title}
        </h3>
        
        {price && (
          <p className="text-lg font-bold text-green-600 mt-1">${typeof price === 'string' ? parseFloat(price.replace('$', '') || '0').toFixed(2) : price}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location || 'Not specified'}</span>
          </div>
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-400" fill="currentColor" />
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