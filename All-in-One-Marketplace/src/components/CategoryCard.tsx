import React from 'react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onClick?: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
  className
}) => {
  return (
    <Card 
      hover 
      onClick={onClick}
      className={cn('group relative overflow-hidden', className)}
    >
      <div className={cn('absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity', gradient)} />
      
      <div className="relative p-6">
        <div className={cn('inline-flex p-3 rounded-xl mb-4', gradient)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        
        <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
          Explore
          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Card>
  );
};