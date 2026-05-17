'use client';

/**
 * ============================================================
 * FILE: src/components/home/FeaturedProducts.tsx
 * PURPOSE: Displays a grid of featured products on the homepage.
 *          Fetches data from /api/products/featured using React Query.
 *          Shows skeleton loaders while loading.
 *          Each product links to its detail page.
 *
 * USED ON: Home page (src/app/page.tsx)
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { addToCart } from '@/redux/slices/cartSlice';
import { optimisticToggle } from '@/redux/slices/wishlistSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Product } from '@/types';
import { useEffect, useState } from 'react';

export default function FeaturedProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems } = useSelector((s: RootState) => s.wishlist);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch featured products — React Query handles caching and revalidation
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured?limit=8');
      return data.data as Product[];
    },
    staleTime: 5 * 60 * 1000,  // Consider data fresh for 5 minutes
  });

  // Handle add to cart action
  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to product page
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    toast.success('Added to cart!');
  };

  // Handle wishlist toggle
  const handleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist');
      return;
    }
    dispatch(optimisticToggle(productId));
  };

  if (!isMounted || isLoading) return <FeaturedProductsSkeleton />;
  if (error) return <p className="text-center text-gray-400">Failed to load products.</p>;
  if (!data || data.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {data.map((product, index) => {
          const isWishlisted = wishlistItems.includes(product._id);
          const effectivePrice = product.discountPrice || product.price;
          const discountPercent = product.discountPrice
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : 0;

          return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link href={`/products/${product.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-red-100 dark:hover:border-red-900 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="relative h-48 md:h-56 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🧯</div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discountPercent > 0 && (
                        <span className="badge badge-red">-{discountPercent}%</span>
                      )}
                      {product.isBestSeller && (
                        <span className="badge badge-orange">Best Seller</span>
                      )}
                      {product.isNewArrival && (
                        <span className="badge badge-blue">New</span>
                      )}
                      {!product.inStock && (
                        <span className="badge bg-gray-200 text-gray-500">Out of Stock</span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleWishlist(product._id, e)}
                      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isWishlisted
                          ? 'bg-red-600 text-white'
                          : 'bg-white/80 text-gray-400 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-4">
                    {/* Brand */}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{product.brand}</p>

                    {/* Title */}
                    <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 leading-snug mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    {product.numReviews > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.ratings}</span>
                        <span className="text-xs text-gray-400">({product.numReviews})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{effectivePrice.toLocaleString('en-IN')}
                      </span>
                      {product.discountPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => handleAddToCart(product._id, e)}
                      disabled={!product.inStock}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      <ShoppingCart size={15} />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="text-center mt-10">
        <Link href="/products" className="btn-secondary">
          <Zap size={16} />
          View All Products
        </Link>
      </div>
    </>
  );
}

/** Skeleton for featured products while loading */
function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="skeleton h-52 w-full" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-3 w-1/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-9 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
