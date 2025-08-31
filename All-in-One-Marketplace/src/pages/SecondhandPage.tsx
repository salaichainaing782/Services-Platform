import React, { useState } from 'react';
import { Search, Grid, List, Recycle, Leaf, Award } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SearchFilters } from '../components/SearchFilters';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const SecondhandPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Sample second-hand data
  const secondhandItems = [
    {
      id: '1',
      title: 'Vintage Leather Jacket - Excellent Condition',
      price: '$89',
      location: 'Brooklyn, NY',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
      category: 'secondhand' as const,
      featured: true
    },
    {
      id: '2',
      title: 'Mid-Century Modern Coffee Table',
      price: '$245',
      location: 'Portland, OR',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      category: 'secondhand' as const
    },
    {
      id: '3',
      title: 'Canon 5D Mark III - Gently Used',
      price: '$899',
      location: 'San Diego, CA',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      category: 'secondhand' as const,
      featured: true
    },
    {
      id: '4',
      title: 'Antique Wooden Bookshelf',
      price: '$156',
      location: 'Nashville, TN',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      category: 'secondhand' as const
    },
    {
      id: '5',
      title: 'Designer Handbag - Like New',
      price: '$320',
      location: 'Miami, FL',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      category: 'secondhand' as const
    },
    {
      id: '6',
      title: 'Acoustic Guitar - Martin D-28',
      price: '$1,200',
      location: 'Austin, TX',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop',
      category: 'secondhand' as const,
      featured: true
    }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'condition', label: 'Best Condition' },
    { value: 'distance', label: 'Nearest First' }
  ];

  const sustainabilityStats = [
    { label: 'CO₂ Saved', value: '2.3M kg', icon: Leaf },
    { label: 'Items Reused', value: '150K+', icon: Recycle },
    { label: 'Verified Sellers', value: '25K+', icon: Award }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Recycle className="h-8 w-8 text-green-500 mr-3" />
                Second-hand Marketplace
              </h1>
              <p className="text-muted-foreground">Give items a second life while saving money and the planet</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search second-hand items..."
                  className="pl-10 pr-4 py-3 w-full rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">🌱 Making a Difference Together</h2>
            <p className="text-green-700">Every second-hand purchase helps reduce waste and protect our environment</p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            {sustainabilityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 rounded-full bg-green-100 mb-2">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-800">{stat.value}</div>
                  <div className="text-sm text-green-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4 flex items-center">
                <Recycle className="h-5 w-5 mr-2 text-green-500" />
                Filters
              </h3>
              <SearchFilters category="secondhand" />
              
              {/* Condition Filter */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Condition</h4>
                <div className="space-y-2">
                  {['Like New', 'Excellent', 'Good', 'Fair'].map((condition) => (
                    <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                      <span className="text-sm">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Seller Type */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">Seller Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                    <span className="text-sm">Verified Seller</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                    <span className="text-sm">Individual</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-green-500 focus:ring-green-500" />
                    <span className="text-sm">Store</span>
                  </label>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {secondhandItems.length} second-hand items
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
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
                
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {secondhandItems.map((item) => (
                <ProductCard
                  key={item.id}
                  {...item}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Items
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Your Items CTA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have Items to Sell?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Turn your unused items into cash while helping others find great deals. It's a win-win!
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
            Start Selling Today
          </Button>
        </div>
      </div>
    </div>
  );
};