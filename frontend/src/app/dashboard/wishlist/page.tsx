'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import { addToCart } from '@/redux/slices/cartSlice';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/services/api';
import { Product } from '@/types';
import { toggleWishlist, optimisticToggle } from '@/redux/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistIds } = useSelector((state: RootState) => state.wishlist);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        const { data } = await api.get('/users/wishlist');
        setProducts(data.data);
      } catch (error) {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, []);

  const handleRemove = async (productId: string) => {
    // Optimistic update
    dispatch(optimisticToggle(productId));
    setProducts(prev => prev.filter(p => p._id !== productId));

    try {
      await dispatch(toggleWishlist(productId)).unwrap();
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
      // No easy rollback for products state here without refetching, 
      // but Redux state is rolled back by slice if needed.
    }
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      // Remove from wishlist after successful add to cart
      await dispatch(toggleWishlist(productId)).unwrap();
      setProducts(prev => prev.filter(p => p._id !== productId));
      toast.success('Moved to cart');
    } catch (error) {
      toast.error('Failed to move to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading your favorites...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your wishlist is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Explore our collection and save items you love to find them easily later.
        </p>
        <Link 
          href="/products" 
          className="btn-primary px-8 py-3 inline-flex items-center gap-2 group"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          My Wishlist <span className="text-sm font-medium text-gray-400">({products.length} items)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {products.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={product.images[0]?.url || '/placeholder.png'}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-red-600 mb-1">
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </p>
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-red-600 transition-colors">
                    {product.title}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <StarRating rating={product.ratings || 0} count={product.numReviews} />
                  {product.inStock ? (
                    <span className="text-xs font-medium text-green-600">In stock</span>
                  ) : (
                    <span className="text-xs font-medium text-red-600">Out of stock</span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {product.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                        <span className="text-lg font-bold text-red-600">₹{product.discountPrice}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveToCart(product._id)}
                      className="px-3 py-2 bg-gradient-to-br from-red-600 to-orange-500 text-white rounded-xl hover:from-red-700 hover:to-orange-600 transition-colors shadow-md flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm font-semibold">Move to cart</span>
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2.5 bg-white border border-gray-100 rounded-xl text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
