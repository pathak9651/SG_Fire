'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCart } from '@/redux/slices/cartSlice';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, isLoading, error } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (isLoading && !cart) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center px-4">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2">Failed to load cart</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchCart())} variant="outline">Try Again</Button>
      </div>
    );
  }

  const isEmpty = !cart || !cart.validItems || cart.validItems.length === 0;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
            <ShoppingBag className="w-8 h-8 mr-3 text-red-600 dark:text-red-500" />
            Shopping Cart
          </h1>
          <Link href="/products" className="hidden sm:flex items-center text-sm font-medium text-red-600 dark:text-red-500 hover:text-red-500 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
        </div>

        {isEmpty ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed"
          >
            <div className="bg-white dark:bg-gray-950 p-4 rounded-full shadow-sm mb-4 border border-gray-100 dark:border-gray-800">
              <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-center mb-8">
              Looks like you haven't added any fire safety equipment to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg" className="shadow-md shadow-red-500/20">
                Browse Products
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 flex justify-between">
                  <span>Product</span>
                  <span>Total</span>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800 px-4 sm:px-6">
                  {cart.validItems?.map((item) => (
                    <CartItem key={item.product} item={item} disabled={isLoading} />
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <CartSummary cart={cart} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
