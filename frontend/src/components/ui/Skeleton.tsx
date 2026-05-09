/**
 * ============================================================
 * FILE: src/components/ui/Skeleton.tsx
 * PURPOSE: Reusable skeleton loader component for displaying
 *          placeholder content while data is loading.
 *          Uses the shimmer animation defined in globals.css.
 *
 * USAGE:
 *   <Skeleton className="h-4 w-3/4" />       → text line
 *   <Skeleton className="h-52 w-full" />      → image placeholder
 *   <Skeleton className="h-10 w-10 rounded-full" /> → avatar
 * ============================================================
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;    // Additional Tailwind classes for sizing/rounding
}

/**
 * Skeleton Component
 * -----------------
 * Renders a gray shimmer placeholder.
 * Use instead of a spinner for layout-preserving loading states.
 *
 * WHY SKELETONS?
 * - Reduce perceived loading time (user sees layout immediately)
 * - Prevent layout shift when content loads
 * - Better UX than spinner for content-heavy pages
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',   // Shimmer animation from globals.css
        'rounded-md', // Default rounding
        className
      )}
    />
  );
}
