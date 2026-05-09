'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface ProductsClientProps {
  initialProducts: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}

export default function ProductsClient({
  initialProducts,
  totalProducts,
  totalPages,
  currentPage,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // We use the initialProducts passed from the server by default.
  // We could fetch client-side if filters change, but for best UX we can just push URL changes
  // and let Next.js re-run the server component.
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');

  const handleFilterChange = (filters: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 on new filter
    params.set('page', '1');
    
    if (filters.category) params.set('category', filters.category);
    else params.delete('category');
    
    if (filters.minPrice) params.set('price[gte]', filters.minPrice);
    else params.delete('price[gte]');
    
    if (filters.maxPrice) params.set('price[lte]', filters.maxPrice);
    else params.delete('price[lte]');
    
    if (filters.sort) params.set('sort', filters.sort);
    else params.delete('sort');
    
    router.push(`/products?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('keyword', searchQuery.trim());
    } else {
      params.delete('keyword');
    }
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      {/* Search Header */}
      <div className="bg-red-600 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Fire Safety Equipment
          </h1>
          <p className="mt-4 text-xl text-red-100">
            Premium products for ultimate protection
          </p>
          
          <form onSubmit={handleSearchSubmit} className="mt-8 flex justify-center max-w-xl mx-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-l-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm transition-colors"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 text-white px-6 py-3 rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <ProductFilters 
              initialFilters={{
                category: searchParams.get('category') || '',
                minPrice: searchParams.get('price[gte]') || '',
                maxPrice: searchParams.get('price[lte]') || '',
                sort: searchParams.get('sort') || '-createdAt'
              }}
              onFilterChange={handleFilterChange} 
            />
          </div>

          {/* Product Grid Area */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {initialProducts.length} of {totalProducts} products
              </p>
            </div>

            <ProductGrid 
              products={initialProducts} 
              emptyMessage="No products match your filters. Try clearing some criteria."
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-400">
                  Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
