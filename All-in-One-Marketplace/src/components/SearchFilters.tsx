import React, { useState } from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface SearchFiltersProps {
  category: string;
  onFiltersChange?: (filters: Record<string, string[]>) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ category, onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const getFiltersForCategory = (): Record<string, FilterOption[]> => {
    switch (category) {
      case 'marketplace':
        return {
          'Price Range': [
            { id: 'under-50', label: 'Under $50', count: 234 },
            { id: '50-100', label: '$50 - $100', count: 156 },
            { id: '100-500', label: '$100 - $500', count: 89 },
            { id: 'over-500', label: 'Over $500', count: 45 }
          ],
          'Condition': [
            { id: 'new', label: 'New', count: 312 },
            { id: 'like-new', label: 'Like New', count: 178 },
            { id: 'good', label: 'Good', count: 234 }
          ],
          'Category': [
            { id: 'electronics', label: 'Electronics', count: 145 },
            { id: 'clothing', label: 'Clothing', count: 203 },
            { id: 'home', label: 'Home & Garden', count: 167 },
            { id: 'sports', label: 'Sports', count: 89 }
          ]
        };
      case 'jobs':
        return {
          'Job Type': [
            { id: 'full-time', label: 'Full-time', count: 456 },
            { id: 'part-time', label: 'Part-time', count: 234 },
            { id: 'contract', label: 'Contract', count: 123 },
            { id: 'remote', label: 'Remote', count: 345 }
          ],
          'Experience': [
            { id: 'entry', label: 'Entry Level', count: 234 },
            { id: 'mid', label: 'Mid Level', count: 345 },
            { id: 'senior', label: 'Senior Level', count: 123 }
          ],
          'Salary Range': [
            { id: 'under-50k', label: 'Under $50k', count: 123 },
            { id: '50k-100k', label: '$50k - $100k', count: 234 },
            { id: 'over-100k', label: 'Over $100k', count: 145 }
          ]
        };
      case 'travel':
        return {
          'Trip Type': [
            { id: 'flights', label: 'Flights', count: 234 },
            { id: 'hotels', label: 'Hotels', count: 345 },
            { id: 'packages', label: 'Packages', count: 123 },
            { id: 'activities', label: 'Activities', count: 89 }
          ],
          'Price Range': [
            { id: 'budget', label: 'Budget', count: 156 },
            { id: 'mid-range', label: 'Mid-range', count: 234 },
            { id: 'luxury', label: 'Luxury', count: 89 }
          ]
        };
      default:
        return {};
    }
  };

  const filters = getFiltersForCategory();

  const toggleFilter = (filterGroup: string, filterId: string) => {
    const newFilters = { ...activeFilters };
    if (!newFilters[filterGroup]) {
      newFilters[filterGroup] = [];
    }
    
    const index = newFilters[filterGroup].indexOf(filterId);
    if (index > -1) {
      newFilters[filterGroup].splice(index, 1);
      if (newFilters[filterGroup].length === 0) {
        delete newFilters[filterGroup];
      }
    } else {
      newFilters[filterGroup].push(filterId);
    }
    
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFiltersChange?.({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((total, filters) => total + filters.length, 0);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
            {getActiveFilterCount()}
          </span>
        )}
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <div className="flex items-center space-x-2">
              {getActiveFilterCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(filters).map(([groupName, options]) => (
              <div key={groupName}>
                <h4 className="font-medium mb-2">{groupName}</h4>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeFilters[groupName]?.includes(option.id) || false}
                        onChange={() => toggleFilter(groupName, option.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm flex-1">{option.label}</span>
                      {option.count && (
                        <span className="text-xs text-muted-foreground">({option.count})</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};