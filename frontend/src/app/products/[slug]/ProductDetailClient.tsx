'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { optimisticToggle, toggleWishlist } from '@/redux/slices/wishlistSlice';
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
      const res = await dispatch(toggleWishlist(product._id)).unwrap();
      toast.success(res.message);
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

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><a href="/" className="hover:text-red-600">Home</a></li>
          <li><span className="mx-2">/</span></li>
          <li><a href="/products" className="hover:text-red-600">Products</a></li>
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
              {isDiscounted && <Badge variant="error">Save {discountPercent}%</Badge>}
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
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <button 
                  onClick={() => handleQuantityChange('dec')}
                  className="px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-gray-50 focus:outline-none transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-3 text-gray-900 font-medium w-12 text-center select-none">
                  {quantity}
                </span>
                <button 
                  onClick={() => handleQuantityChange('inc')}
                  className="px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-gray-50 focus:outline-none transition-colors"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handleAddToCart(false)}
                  disabled={product.stock === 0}
                  size="lg"
                  variant="outline"
                  className="flex-1 text-base border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>

                <Button 
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  size="lg"
                  className="flex-[1.5] text-base shadow-lg shadow-red-500/30 bg-red-600 hover:bg-red-700"
                >
                  Buy Now
                </Button>
                
                <Button 
                  onClick={handleWishlistToggle}
                  variant="outline" 
                  size="lg" 
                  className={cn(
                    "px-4 border-gray-300 transition-all",
                    isWishlisted ? "text-red-600 border-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:border-red-600"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isWishlisted && "fill-current")} />
                </Button>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 prose prose-red max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
              <div className="text-gray-600 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br />') }} />
            </div>
            
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                <dl className="divide-y divide-gray-200">
                  {Object.entries(product.specifications || {}).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 px-6 py-4">
                      <dt className="text-sm font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                      <dd className="text-sm text-gray-900 col-span-2 font-medium">{String(value)}</dd>
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
