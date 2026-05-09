import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import Spinner from '../ui/Spinner';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  isLoading = false,
  className,
  emptyMessage = 'No products found matching your criteria.',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center min-h-[400px] bg-gray-50 rounded-2xl border border-gray-100">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 max-w-md mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
