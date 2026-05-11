import React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';

interface ProductFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  categories: any[];
  brands: string[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function ProductFilters({
  filters,
  setFilters,
  categories = [],
  brands = [],
  isOpen,
  onClose,
  className,
}: ProductFiltersProps) {
  const [expandedSection, setExpandedSection] = React.useState<string | null>('categories');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCategoryChange = (category: string) => {
    setFilters({ ...filters, category: filters.category === category ? undefined : category });
  };

  const handleBrandChange = (brand: string) => {
    setFilters({ ...filters, brand: filters.brand === brand ? undefined : brand });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? Number(value) : undefined;
    if (type === 'min') {
      setFilters({ ...filters, minPrice: numValue });
    } else {
      setFilters({ ...filters, maxPrice: numValue });
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 p-6 shadow-sm transition-all lg:block',
        isOpen ? 'fixed inset-0 z-50 overflow-y-auto lg:relative lg:inset-auto lg:z-0 lg:overflow-visible' : 'hidden',
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h2>
        {isOpen && (
          <button onClick={onClose} className="lg:hidden p-2 text-gray-500 hover:text-red-500">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories Section */}
        <div className="border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
          >
            Categories
            {expandedSection === 'categories' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSection === 'categories' && (
            <div className="space-y-3">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:border-red-600 checked:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all"
                      checked={filters.category === cat._id}
                      onChange={() => handleCategoryChange(cat._id)}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-red-600 transition-colors font-medium text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brands Section */}
        <div className="border-b border-gray-100 pb-6">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
          >
            Brands
            {expandedSection === 'brands' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSection === 'brands' && (
            <div className="space-y-3">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white checked:border-red-600 checked:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 transition-all"
                      checked={filters.brand === brand}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-600 group-hover:text-red-600 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="pb-6">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
          >
            Price Range
            {expandedSection === 'price' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {expandedSection === 'price' && (
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <Button variant="outline" fullWidth onClick={clearFilters} className="mt-4">
          Clear All Filters
        </Button>

        {isOpen && (
          <Button variant="primary" fullWidth onClick={onClose} className="mt-3 lg:hidden">
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
