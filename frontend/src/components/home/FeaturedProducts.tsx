'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, Zap, ArrowRight, Flame } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { addToCart } from '@/redux/slices/cartSlice';
import { optimisticToggle } from '@/redux/slices/wishlistSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Product } from '@/types';
import { useEffect, useState } from 'react';

const STAGGER_DELAYS = ['0ms', '50ms', '100ms', '150ms', '200ms', '250ms'];

export default function FeaturedProducts() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems } = useSelector((s: RootState) => s.wishlist);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured?limit=8');
      return data.data as Product[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    dispatch(addToCart({ productId, quantity: 1 }));
    toast.success('Added to cart!');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push('/cart');
    }
  };

  const handleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to save to wishlist');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }
    dispatch(optimisticToggle(productId));
  };

  if (!isMounted || isLoading) return <FeaturedProductsSkeleton />;
  if (error) return <p className="text-center text-gray-400 py-10">Failed to load products.</p>;
  if (!data || data.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {data.map((product, index) => {
          const isWishlisted = wishlistItems.includes(product._id);
          const effectivePrice = product.discountPrice || product.price;
          const discountPercent = product.discountPrice
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : 0;

          return (
            <div
              key={product._id}
              className="card-fade-in"
              style={{ animationDelay: STAGGER_DELAYS[Math.min(index % 6, 5)] }}
            >
              <Link href={`/products/${product.slug}`}>
                {/* Product card — CSS-only hover */}
                <div className="product-card group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-[transform,box-shadow] duration-200 h-full flex flex-col">

                  {/* ── Product Image ── */}
                  <div className="relative h-44 md:h-52 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.title}
                        className="w-full h-full object-contain p-3 group-hover:scale-[1.04] transition-transform duration-300 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🧯</div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discountPercent > 0 && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full shadow">
                          -{discountPercent}%
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full shadow flex items-center gap-0.5">
                          <Flame size={8} /> Hot
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full shadow">
                          New
                        </span>
                      )}
                    </div>

                    {/* Wishlist button — appears on hover via CSS */}
                    <button
                      onClick={(e) => handleWishlist(product._id, e)}
                      className={`absolute bottom-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center shadow transition-colors duration-200 opacity-0 group-hover:opacity-100 ${
                        isWishlisted
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-500 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>

                    {/* Out of stock overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-xs font-bold text-white bg-gray-800 px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* ── Product Info ── */}
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{product.brand}</p>

                    <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100 leading-snug mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 flex-1">
                      {product.title}
                    </h3>

                    {/* Rating */}
                    {product.numReviews > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={10} className={i < Math.floor(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">{product.ratings}</span>
                        <span className="text-[10px] text-gray-400">({product.numReviews})</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base md:text-lg font-black text-gray-900 dark:text-white">
                        ₹{effectivePrice.toLocaleString('en-IN')}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <button
                      onClick={(e) => handleAddToCart(product._id, e)}
                      disabled={!product.inStock}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white text-xs md:text-sm font-bold rounded-xl transition-[background,box-shadow] duration-200 shadow-sm hover:shadow-red-500/20 disabled:shadow-none"
                    >
                      <ShoppingCart size={14} />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* View All */}
      <div className="text-center mt-12">
        <Link
          href="/products"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 text-base"
        >
          <Zap size={18} />
          View All Products
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-150" />
        </Link>
      </div>
    </>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="skeleton h-48 w-full" />
          <div className="p-4 space-y-2.5">
            <div className="skeleton h-2.5 w-1/4 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-5 w-1/2 rounded" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
