'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { optimisticToggle, toggleWishlist } from '@/redux/slices/wishlistSlice';
import { addToCart } from '@/redux/slices/cartSlice';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

  const isWishlisted = wishlistItems.includes(product._id);

  const handleAddToCart = async (redirect = false) => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push(`/auth/login?returnUrl=/products/${product.slug}`);
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      toast.success('Added to cart!');
      if (redirect) {
        router.push('/cart');
      }
    } catch (error) {
      toast.error(error as string || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push(`/auth/login?returnUrl=/products/${product.slug}`);
      return;
    }
    
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      router.push('/checkout');
    } catch (error) {
      toast.error(error as string || 'Failed to initiate purchase');
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }

    dispatch(optimisticToggle(product._id));
    try {
      await dispatch(toggleWishlist(product._id)).unwrap();
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (error) {
      dispatch(optimisticToggle(product._id));
      toast.error('Failed to update wishlist');
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const price = product.discountPrice || product.price;
  const isDiscounted = !!product.discountPrice;
  const discountPercent = isDiscounted 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const safeDescription = product.description
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-red-600">Home</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link href="/products" className="hover:text-red-600">Products</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="text-gray-900 font-medium truncate">{product.title}</li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          
          {/* Product Images */}
          <div className="mb-10 lg:mb-0">
            <ProductImageGallery images={product.images} title={product.title} />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6 flex gap-2">
              {product.isFeatured && <Badge variant="warning">Featured</Badge>}
              {product.isNewArrival && <Badge variant="success">New Arrival</Badge>}
              {product.isBestSeller && <Badge variant="info">Best Seller</Badge>}
              {isDiscounted && <Badge variant="danger">Save {discountPercent}%</Badge>}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-center mb-6">
              <StarRating rating={product.ratings} />
              <span className="ml-3 text-sm font-medium text-red-600 hover:text-red-500 cursor-pointer">
                {product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            <div className="mb-6 flex items-end gap-4">
              <span className="text-4xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
              {isDiscounted && (
                <span className="text-xl text-gray-500 line-through mb-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {product.shortDescription || product.description.substring(0, 150) + '...'}
            </p>

            <div className="border-t border-b border-gray-200 py-6 mb-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Availability</span>
                {product.stock > 0 ? (
                  <span className="text-green-600 font-bold flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600 font-bold flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Brand</span>
                <span className="text-gray-900 font-medium">{product.brand}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">SKU</span>
                <span className="text-gray-900 font-mono text-xs">{product._id.substring(0, 10).toUpperCase()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8">

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600 w-20">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('dec')}
                    disabled={quantity <= 1}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="w-12 h-11 flex items-center justify-center text-gray-900 font-bold text-base border-x border-gray-200 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('inc')}
                    disabled={quantity >= product.stock}
                    className="w-11 h-11 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons Row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={product.stock === 0}
                  className="flex-1 sm:flex-1 flex items-center justify-center gap-2.5 h-14 px-4 sm:px-6 rounded-2xl border-2 border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white font-bold text-base whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                  <span>Add to Cart</span>
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-[1.5] flex items-center justify-center gap-2 h-14 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-base whitespace-nowrap transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 active:scale-[0.98]"
                >
                  <span>Buy Now</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlistToggle}
                  className={cn(
                    "w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 active:scale-95",
                    isWishlisted
                      ? "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "border-gray-200 bg-white text-gray-400 hover:border-red-400 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <Heart className={cn("w-5 h-5 flex-shrink-0", isWishlisted && "fill-current")} />
                </button>
              </div>

              {/* Out of stock notice */}
              {product.stock === 0 && (
                <p className="text-sm text-red-500 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  This product is currently out of stock
                </p>
              )}
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-auto bg-gray-50 p-6 rounded-xl">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Certified Safe</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">7-Day Returns</span>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Description & Specs */}
        <div className="mt-16 lg:mt-24 border-t border-gray-200 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            <div className="lg:col-span-2 prose prose-red max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {safeDescription}
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <dl className="divide-y divide-gray-200">
                  {Object.entries(product.specifications || {}).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-6 py-4">
                      <dt className="text-sm font-medium text-gray-500 capitalize col-span-1">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                      <dd className="text-sm text-gray-900 sm:col-span-2 font-medium">{String(value)}</dd>
                    </div>
                  ))}
                  {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                    <div className="px-6 py-4 text-sm text-gray-500 italic">No specifications provided.</div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
