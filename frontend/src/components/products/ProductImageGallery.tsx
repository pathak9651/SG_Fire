'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback if no images
  const displayImages = images?.length > 0 ? images : [{ url: '/placeholder.png', public_id: 'placeholder', alt: title }];

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={displayImages[activeIndex].url}
              alt={displayImages[activeIndex].alt || title}
              fill
              priority
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-500 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="View fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {displayImages.map((img, idx) => (
            <button
              key={img.public_id || idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                activeIndex === idx ? 'border-red-600 ring-2 ring-red-600/20' : 'border-transparent hover:border-gray-200'
              )}
            >
              <div className="absolute inset-0 bg-gray-50" />
              <Image
                src={img.url}
                alt={img.alt || `Thumbnail ${idx + 1}`}
                fill
                className="object-cover p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-6 top-6 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative h-full max-h-[80vh] w-full max-w-5xl px-4">
              <Image
                src={displayImages[activeIndex].url}
                alt={displayImages[activeIndex].alt || title}
                fill
                className="object-contain"
                sizes="100vw"
              />
              
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-4 text-white transition-colors hover:bg-white/20"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>
            
            {/* Minimal thumbnails for fullscreen */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, idx) => (
                  <button
                    key={`fs-dot-${idx}`}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all',
                      activeIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
