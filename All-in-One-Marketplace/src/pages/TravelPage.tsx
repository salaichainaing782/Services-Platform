import React, { useState } from 'react';
import { Search, Calendar, Users, Star, MapPin, Plane, Hotel, Camera } from 'lucide-react';
import { SearchFilters } from '../components/SearchFilters';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const TravelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Sample travel data
  const travelOptions = [
    {
      id: '1',
      title: 'Luxury Resort in Maldives - 7 Days',
      location: 'Maldives',
      price: '$2,499',
      originalPrice: '$3,299',
      rating: 4.9,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      type: 'hotel',
      duration: '7 days',
      featured: true,
      tags: ['All Inclusive', 'Spa', 'Beach']
    },
    {
      id: '2',
      title: 'Round Trip to Tokyo',
      location: 'Tokyo, Japan',
      price: '$899',
      rating: 4.7,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      type: 'flight',
      duration: '14 hours',
      tags: ['Direct Flight', 'Premium Economy']
    },
    {
      id: '3',
      title: 'European Adventure Package',
      location: 'Paris, Rome, Barcelona',
      price: '$1,899',
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
      type: 'package',
      duration: '10 days',
      featured: true,
      tags: ['Multi-City', 'Guided Tours', 'Hotels Included']
    },
    {
      id: '4',
      title: 'Safari Adventure in Kenya',
      location: 'Masai Mara, Kenya',
      price: '$3,299',
      rating: 4.9,
      reviews: 67,
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop',
      type: 'activity',
      duration: '5 days',
      tags: ['Wildlife', 'Photography', 'Luxury Camp']
    },
    {
      id: '5',
      title: 'Boutique Hotel in Santorini',
      location: 'Santorini, Greece',
      price: '$299',
      originalPrice: '$399',
      rating: 4.6,
      reviews: 178,
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
      type: 'hotel',
      duration: 'per night',
      tags: ['Ocean View', 'Infinity Pool', 'Romantic']
    },
    {
      id: '6',
      title: 'New York City Explorer Pass',
      location: 'New York, USA',
      price: '$129',
      rating: 4.5,
      reviews: 445,
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
      type: 'activity',
      duration: '3 days',
      tags: ['City Pass', 'Museums', 'Attractions']
    }
  ];

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'activities', label: 'Activities', icon: Camera }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'activity': return Camera;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flight': return 'bg-blue-500';
      case 'hotel': return 'bg-green-500';
      case 'activity': return 'bg-purple-500';
      case 'package': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Travel & Experiences</h1>
              <p className="text-muted-foreground">Discover amazing destinations and unforgettable experiences</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search destinations, hotels, activities..."
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Travel Filters
              </h3>
              <SearchFilters category="travel" />
              
              {/* Quick Filters */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">Free Cancellation</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">Instant Booking</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span className="text-sm">Best Seller</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {travelOptions.length} travel options
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {travelOptions.map((option) => {
                const TypeIcon = getTypeIcon(option.type);
                return (
                  <Card key={option.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                    {option.featured && (
                      <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                        Featured
                      </div>
                    )}
                    
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={option.image} 
                        alt={option.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-3 left-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium text-white rounded-full ${getTypeColor(option.type)}`}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {option.type.charAt(0).toUpperCase() + option.type.slice(1)}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      
                      <div className="flex items-center text-muted-foreground text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="mr-4">{option.location}</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{option.duration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">{option.price}</span>
                          {option.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">{option.originalPrice}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{option.rating}</span>
                          <span className="text-sm text-muted-foreground">({option.reviews})</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {option.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        Book Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};