'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, AlertCircle } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { updateCartItem, removeFromCart } from '@/redux/slices/cartSlice';

interface CartItemProps {
  item: CartItemType;
  disabled?: boolean;
}

export default function CartItem({ item, disabled = false }: CartItemProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.stock || disabled) return;
    dispatch(updateCartItem({ productId: item.product, quantity: newQuantity }));
  };

  const handleRemove = () => {
    if (disabled) return;
    dispatch(removeFromCart(item.product));
  };

  return (
    <div className={`flex py-6 border-b border-gray-200 last:border-0 ${!item.inStock ? 'opacity-50 grayscale' : ''}`}>
      {/* Product Image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <Image
          src={item.image || '/images/placeholder.jpg'}
          alt={item.title}
          width={96}
          height={96}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        {/* Title and Price */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between text-base font-medium text-gray-900">
            <h3>
              <Link href={`/products/${item.product}`} className="hover:text-red-600 line-clamp-2">
                {item.title}
              </Link>
            </h3>
            <p className="mt-1 sm:mt-0 sm:ml-4 whitespace-nowrap font-bold text-red-600">₹{item.price.toLocaleString('en-IN')}</p>
          </div>
          {item.price < item.originalPrice && (
            <p className="mt-1 text-sm text-gray-500 line-through">
              ₹{item.originalPrice.toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {/* Quantity and Actions */}
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex flex-col gap-2">
            {!item.inStock ? (
              <span className="flex items-center text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 mr-1" /> Out of stock
              </span>
            ) : (
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:text-red-600 disabled:opacity-50 transition-colors"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1 || disabled}
                >
                  -
                </button>
                <span className="px-3 py-1 text-gray-900 font-medium w-10 text-center select-none">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="px-3 py-1 text-gray-600 hover:text-red-600 disabled:opacity-50 transition-colors"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= item.stock || disabled}
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="font-medium text-red-600 hover:text-red-500 flex items-center transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
