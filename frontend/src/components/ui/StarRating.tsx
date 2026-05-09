import React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  count,
  size = 'sm',
  showCount = true,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconSize = sizes[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={cn(iconSize, 'fill-current')} />
        ))}
        {hasHalfStar && <StarHalf className={cn(iconSize, 'fill-current')} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={cn(iconSize, 'text-gray-300')} />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-sm text-gray-500 font-medium">({count})</span>
      )}
    </div>
  );
}
