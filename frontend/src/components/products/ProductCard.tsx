import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import StarRating from '../ui/StarRating';
import Badge from '../ui/Badge';
import { cn } from '@/lib/utils';

import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { optimisticToggle, toggleWishlist } from '@/redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const isWishlisted = wishlistItems.includes(product._id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }

    // Optimistic update
    dispatch(optimisticToggle(product._id));
    
    // Server sync
    dispatch(toggleWishlist(product._id))
      .unwrap()
      .then((res) => {
        toast.success(res.message);
      })
      .catch((err) => {
        // Rollback on error (optimisticToggle again)
        dispatch(optimisticToggle(product._id));
        toast.error(err || 'Failed to update wishlist');
      });
  };

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        'group relative flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discountPercentage > 0 && (
          <Badge variant="danger" size="sm">
            {discountPercentage}% OFF
          </Badge>
        )}
        {product.isFeatured && (
          <Badge variant="warning" size="sm">
            Featured
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        type="button"
        className={cn(
          "absolute top-3 right-3 z-10 rounded-full p-2 shadow-sm transition-all active:scale-90",
          isWishlisted 
            ? "bg-red-50 text-red-500 opacity-100" 
            : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 focus:opacity-100"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
      </button>

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images[0]?.url || '/placeholder.png'}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {typeof product.category === 'string' ? product.category : product.category.name}
          </p>
          <StarRating rating={product.ratings} count={product.reviews?.length || 0} size="sm" />
        </div>

        <Link href={`/products/${product.slug}`} className="group-hover:text-red-600 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2 leading-tight">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-xl font-bold text-red-600">₹{product.discountPrice.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          
          <button
            type="button"
            disabled={product.stock <= 0}
            className="flex items-center justify-center rounded-full bg-gray-900 p-3 text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-gray-900 disabled:cursor-not-allowed group-hover:shadow-md"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
