import React from 'react';
import { Heart, Star, MapPin } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface ProductCardProps {
  id: string;
  title: string;
  price?: string;
  location?: string;
  rating?: number;
  image: string;
  category: 'marketplace' | 'secondhand' | 'jobs' | 'travel';
  featured?: boolean;
  className?: string;
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
  className
}) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'marketplace': return 'bg-blue-500';
      case 'secondhand': return 'bg-green-500';
      case 'jobs': return 'bg-purple-500';
      case 'travel': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'marketplace': return 'New';
      case 'secondhand': return 'Used';
      case 'jobs': return 'Job';
      case 'travel': return 'Trip';
      default: return '';
    }
  };

  return (
    <Card hover className={cn('group relative overflow-hidden', className)}>
      {featured && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
          Featured
        </div>
      )}
      
      <div className="absolute top-3 right-3 z-10">
        <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-3 left-3">
          <span className={cn('px-2 py-1 text-xs font-medium text-white rounded-full', getCategoryColor())}>
            {getCategoryLabel()}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          {price && (
            <span className="text-xl font-bold text-primary">{price}</span>
          )}
          
          {rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          )}
        </div>
        
        {location && (
          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{location}</span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
        >
          {category === 'jobs' ? 'Apply Now' : category === 'travel' ? 'Book Now' : 'View Details'}
        </Button>
      </div>
    </Card>
  );
};