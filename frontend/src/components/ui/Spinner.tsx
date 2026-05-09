import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-[2px]',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-[4px]',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-red-600 border-t-transparent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
