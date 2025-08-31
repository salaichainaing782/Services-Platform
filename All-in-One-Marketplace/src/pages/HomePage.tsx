import React from 'react';
import { ShoppingBag, Briefcase, Plane, Recycle, TrendingUp, Users, Shield, Zap } from 'lucide-react';
import { CategoryCard } from '../components/CategoryCard';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

interface HomePageProps {
  onCategoryChange: (category: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCategoryChange }) => {
  const categories = [
    {
      id: 'marketplace',
      title: 'Marketplace',
      description: 'Discover amazing products from trusted sellers worldwide. From electronics to fashion, find everything you need.',
      icon: ShoppingBag,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: 'secondhand',
      title: 'Second-hand',
      description: 'Give items a second life! Find quality pre-owned goods at great prices while helping the environment.',
      icon: Recycle,
      gradient: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      id: 'jobs',
      title: 'Jobs',
      description: 'Launch your career with opportunities from top companies. Full-time, part-time, and remote positions available.',
      icon: Briefcase,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      id: 'travel',
      title: 'Travel',
      description: 'Explore the world with curated travel experiences. Flights, hotels, and adventure packages await.',
      icon: Plane,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '2.5M+', icon: Users },
    { label: 'Listings', value: '500K+', icon: TrendingUp },
    { label: 'Secure Transactions', value: '99.9%', icon: Shield },
    { label: 'Response Time', value: '<2min', icon: Zap }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Your All-in-One
              <span className="text-gradient block mt-2">Marketplace Platform</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Buy, sell, work, and travel - all in one beautiful platform. 
              Connect with millions of users worldwide and discover endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-4">
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Explore Our Categories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need in one place. Choose your category and start exploring.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                gradient={category.gradient}
                onClick={() => onCategoryChange(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose MarketHub?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built the most comprehensive platform to meet all your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-6">
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Trusted</h3>
              <p className="text-muted-foreground">
                Advanced security measures and verified users ensure safe transactions every time.
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="inline-flex p-4 rounded-full bg-green-500/10 mb-6">
                <Zap className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed with instant search results and quick response times.
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="inline-flex p-4 rounded-full bg-purple-500/10 mb-6">
                <Users className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Global Community</h3>
              <p className="text-muted-foreground">
                Connect with millions of users worldwide in our thriving marketplace community.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of users who trust MarketHub for their buying, selling, working, and traveling needs.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
            Join MarketHub Today
          </Button>
        </div>
      </section>
    </div>
  );
};