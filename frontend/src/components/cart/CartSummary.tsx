'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { applyCoupon } from '@/redux/slices/cartSlice';
import { Cart } from '@/types';
import Button from '@/components/ui/Button';
import { Tag, ShieldCheck, ArrowRight } from 'lucide-react';

interface CartSummaryProps {
  cart: Cart;
  isLoading?: boolean;
}

export default function CartSummary({ cart, isLoading = false }: CartSummaryProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponError('');
    try {
      await dispatch(applyCoupon(couponCode)).unwrap();
      setCouponCode('');
    } catch (error) {
      setCouponError(error as string);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const hasValidItems = cart.validItems && cart.validItems.length > 0;

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>

      <dl className="space-y-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <dt>Subtotal ({cart.validItems?.length || 0} items)</dt>
          <dd className="font-medium text-gray-900">₹{cart.itemsTotal?.toLocaleString('en-IN') || 0}</dd>
        </div>
        
        <div className="flex justify-between">
          <dt>Shipping estimate</dt>
          <dd className="font-medium text-gray-900">
            {cart.shippingCharge === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              `₹${cart.shippingCharge?.toLocaleString('en-IN') || 0}`
            )}
          </dd>
        </div>

        <div className="flex justify-between">
          <dt>Tax estimate (18% GST)</dt>
          <dd className="font-medium text-gray-900">₹{cart.taxAmount?.toLocaleString('en-IN') || 0}</dd>
        </div>

        {cart.appliedCoupon && (
          <div className="flex justify-between text-green-600 border-t border-gray-200 pt-4">
            <dt className="flex items-center">
              Discount ({cart.appliedCoupon.code})
            </dt>
            <dd className="font-medium">-₹{(cart.appliedCoupon.discount || 0).toLocaleString('en-IN')}</dd>
          </div>
        )}

        <div className="flex justify-between items-center border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
          <dt>Order Total</dt>
          <dd>
            ₹{((cart.totalAmount || 0) - (cart.appliedCoupon?.discount || 0)).toLocaleString('en-IN')}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <form onSubmit={handleApplyCoupon} className="mb-6">
          <label htmlFor="coupon" className="sr-only">Coupon code</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                disabled={isLoading}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !couponCode.trim()}
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        </form>

        <Button 
          fullWidth 
          size="lg" 
          onClick={handleCheckout} 
          disabled={!hasValidItems || isLoading}
          className="shadow-md shadow-red-500/20"
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex items-center text-sm text-gray-500">
          <ShieldCheck className="w-5 h-5 text-green-500 mr-2" />
          Secure 256-bit SSL encryption
        </div>
      </div>
    </div>
  );
}
