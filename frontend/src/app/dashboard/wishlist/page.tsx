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
import DashboardLayout from '@/components/dashboard/DashboardLayout';

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

  return (
    <DashboardLayout 
      title="My Wishlist" 
      subtitle={`Manage your saved fire safety equipment (${products.length} items)`}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xs">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500 font-medium text-sm">Loading your saved items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-sm">
            Explore our collection and save items you love to find them easily later.
          </p>
          <Link 
            href="/products" 
            className="btn-primary px-8 py-3.5 inline-flex items-center gap-2 group rounded-2xl text-sm font-bold shadow-lg shadow-red-500/20"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-950">
                    <Image
                      src={product.images[0]?.url || '/placeholder.png'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">
                      {typeof product.category === 'string' ? product.category : product.category.name}
                    </p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1 group-hover:text-red-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <StarRating rating={product.ratings || 0} count={product.numReviews} />
                      {product.inStock ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">In stock</span>
                      ) : (
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">Out of stock</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3">
                    <div>
                      {product.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
                          <span className="text-base font-extrabold text-red-600 dark:text-red-500">₹{product.discountPrice}</span>
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-gray-900 dark:text-white">₹{product.price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveToCart(product._id)}
                        className="px-3.5 py-2 bg-gradient-to-br from-red-600 to-orange-500 text-white rounded-xl hover:from-red-700 hover:to-orange-600 transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </DashboardLayout>
  );
}
