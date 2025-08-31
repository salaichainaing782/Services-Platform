import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false }) => {
  return (
    <div className={cn(
      'rounded-xl bg-card text-card-foreground shadow-sm border',
      hover && 'card-hover cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};