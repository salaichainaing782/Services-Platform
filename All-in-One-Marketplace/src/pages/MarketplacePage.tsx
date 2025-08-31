import React, { useState } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { SearchFilters } from '../components/SearchFilters';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const MarketplacePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Sample data - in a real app, this would come from an API
  const products = [
    {
      id: '1',
      title: 'iPhone 15 Pro Max - 256GB Natural Titanium',
      price: '$1,199',
      location: 'New York, NY',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
      category: 'marketplace' as const,
      featured: true
    },
    {
      id: '2',
      title: 'MacBook Air M2 - Space Gray 13-inch',
      price: '$999',
      location: 'San Francisco, CA',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
      category: 'marketplace' as const
    },
    {
      id: '3',
      title: 'Sony WH-1000XM5 Wireless Headphones',
      price: '$349',
      location: 'Los Angeles, CA',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      category: 'marketplace' as const
    },
    {
      id: '4',
      title: 'Nintendo Switch OLED Console',
      price: '$299',
      location: 'Chicago, IL',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
      category: 'marketplace' as const
    },
    {
      id: '5',
      title: 'Canon EOS R5 Mirrorless Camera',
      price: '$3,299',
      location: 'Miami, FL',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      category: 'marketplace' as const,
      featured: true
    },
    {
      id: '6',
      title: 'Tesla Model 3 Performance Wheels',
      price: '$1,899',
      location: 'Austin, TX',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
      category: 'marketplace' as const
    }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
              <p className="text-muted-foreground">Discover amazing products from trusted sellers</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </h3>
              <SearchFilters category="marketplace" />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                Showing {products.length} results
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

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};