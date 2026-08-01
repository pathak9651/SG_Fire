'use client';

/**
 * ============================================================
 * FILE: src/components/home/CategoryGrid.tsx
 * PURPOSE: Displays product categories as clickable icon cards
 *          on the homepage. Dynamically synchronized with MongoDB.
 *
 * FEATURES:
 *  - Dynamically fetches categories from backend /api/categories
 *  - CSS-only scroll entrance (useReveal hook — no Framer Motion whileInView)
 *  - Hover animations via CSS group-hover
 *  - Premium gradient icon backgrounds and emojis mapped heuristically
 *  - Mobile: 2-column | Tablet: 4-column | Desktop: 5-column
 * ============================================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';

/** Category item data structure for rendering */
interface CategoryItem {
  name: string;
  href: string;
  emoji: string;       // Emoji icon for visual identity
  count: string;       // Action text or product count
  gradient: string;    // Tailwind gradient for icon background
}

/**
 * Maps category names/slugs dynamically to professional emojis and vibrant gradients.
 */
const getCategoryMetadata = (slug: string, name: string) => {
  const normalized = slug.toLowerCase();

  if (normalized.includes('extinguisher')) return { emoji: '🧯', gradient: 'from-red-500 to-red-700' };
  if (normalized.includes('smoke') || normalized.includes('detector') || normalized.includes('sensor')) return { emoji: '🔔', gradient: 'from-orange-500 to-orange-700' };
  if (normalized.includes('alarm') || normalized.includes('siren') || normalized.includes('bell')) return { emoji: '🚨', gradient: 'from-amber-500 to-red-600' };
  if (normalized.includes('helmet') || normalized.includes('head') || normalized.includes('cap')) return { emoji: '⛑️', gradient: 'from-yellow-500 to-orange-600' };
  if (normalized.includes('sprinkler') || normalized.includes('water') || normalized.includes('hose') || normalized.includes('nozzle')) return { emoji: '💧', gradient: 'from-blue-500 to-cyan-600' };
  if (normalized.includes('exit') || normalized.includes('sign') || normalized.includes('door') || normalized.includes('emergency-lights') || normalized.includes('light')) return { emoji: '🚪', gradient: 'from-green-500 to-green-700' };
  if (normalized.includes('glove') || normalized.includes('hand')) return { emoji: '🧤', gradient: 'from-purple-500 to-purple-700' };
  if (normalized.includes('cctv') || normalized.includes('camera') || normalized.includes('security') || normalized.includes('surveillance')) return { emoji: '📹', gradient: 'from-gray-600 to-gray-800' };
  if (normalized.includes('industrial') || normalized.includes('kit') || normalized.includes('gear') || normalized.includes('suit') || normalized.includes('apparel') || normalized.includes('safety-gear')) return { emoji: '🦺', gradient: 'from-red-600 to-orange-700' };

  const fallbackEmojis = ['🔥', '🛡️', '📦', '🚒', '⚠️', '🚨'];
  const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const emoji = fallbackEmojis[charCodeSum % fallbackEmojis.length];
  const gradients = [
    'from-red-500 to-orange-600',
    'from-orange-500 to-yellow-600',
    'from-blue-500 to-indigo-600',
    'from-green-500 to-teal-600',
    'from-purple-500 to-pink-600',
  ];
  return { emoji, gradient: gradients[charCodeSum % gradients.length] };
};

const STAGGER_DELAYS = ['0ms', '50ms', '100ms', '150ms', '200ms', '250ms'];

export default function CategoryGrid() {
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  // No useReveal here — data is async, observer would fire before cards exist

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const dbCategories = response.data?.data || [];
        if (!isMounted) return;

        const mapped: CategoryItem[] = dbCategories.map((cat: any) => {
          const meta = getCategoryMetadata(cat.slug || '', cat.name || '');
          return { name: cat.name, href: `/products?category=${cat.slug}`, emoji: meta.emoji, count: 'Explore Category', gradient: meta.gradient };
        });
        mapped.push({ name: 'View All', href: '/products', emoji: '→', count: 'All Products', gradient: 'from-gray-700 to-gray-900' });

        setCategoriesList(mapped);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dynamic categories:', error);
        if (isMounted) { setIsError(true); setIsLoading(false); }
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-100 dark:bg-gray-700 rounded hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || categoriesList.length === 0) {
    return <div className="text-center py-6"><p className="text-red-500 font-bold">Failed to load categories. Please try again later.</p></div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      {categoriesList.map((category, index) => (
        <div
          key={category.name}
          className="card-fade-in"
          style={{ animationDelay: STAGGER_DELAYS[Math.min(index, 5)] }}
        >
          <Link href={category.href}>
            <div className="category-card group relative flex flex-col items-center p-4 sm:p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 cursor-pointer overflow-hidden">
              {/* Gradient wash on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />

              {/* Gradient Icon */}
              <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl sm:text-3xl mb-3 shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                {category.emoji}
              </div>

              {/* Category name */}
              <span className={`relative text-[11px] sm:text-sm font-bold text-gray-800 dark:text-gray-200 text-center leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${category.gradient} transition-colors duration-200`}>
                {category.name}
              </span>

              {/* Action text */}
              <span className="relative text-[10px] text-gray-400 mt-1.5 text-center hidden sm:block">
                {category.count}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
