'use client';

/**
 * ============================================================
 * FILE: src/components/home/CategoryGrid.tsx
 * PURPOSE: Displays product categories as clickable icon cards
 *          on the homepage. Acts as quick navigation to filtered
 *          product listings.
 *
 * FEATURES:
 *  - Animated entrance with staggered delays (Framer Motion)
 *  - Hover animations (scale + shadow)
 *  - Gradient icon backgrounds
 *  - Mobile: 3-column | Tablet: 4-column | Desktop: 5-column
 *
 * DATA: Static for now. TODO: fetch from /api/categories
 * ============================================================
 */

import Link from 'next/link';
import { motion } from 'framer-motion';

/** Category item data structure */
interface CategoryItem {
  name: string;
  href: string;
  emoji: string;       // Emoji icon for visual identity
  count: string;       // Product count (approximate)
  gradient: string;    // Tailwind gradient for icon background
}

// Static category data with fire safety product types
const CATEGORIES: CategoryItem[] = [
  { name: 'Fire Extinguishers', href: '/products?category=fire-extinguishers', emoji: '🧯', count: '50+ Products', gradient: 'from-red-500 to-red-700' },
  { name: 'Smoke Detectors', href: '/products?category=smoke-detectors', emoji: '🔔', count: '30+ Products', gradient: 'from-orange-500 to-orange-700' },
  { name: 'Fire Alarms', href: '/products?category=fire-alarms', emoji: '🚨', count: '25+ Products', gradient: 'from-amber-500 to-red-600' },
  { name: 'Safety Helmets', href: '/products?category=safety-helmets', emoji: '⛑️', count: '20+ Products', gradient: 'from-yellow-500 to-orange-600' },
  { name: 'Fire Sprinklers', href: '/products?category=fire-sprinklers', emoji: '💧', count: '15+ Products', gradient: 'from-blue-500 to-cyan-600' },
  { name: 'Emergency Exit', href: '/products?category=emergency-exit', emoji: '🚪', count: '18+ Products', gradient: 'from-green-500 to-green-700' },
  { name: 'Safety Gloves', href: '/products?category=safety-gloves', emoji: '🧤', count: '22+ Products', gradient: 'from-purple-500 to-purple-700' },
  { name: 'CCTV & Security', href: '/products?category=cctv-security', emoji: '📹', count: '40+ Products', gradient: 'from-gray-600 to-gray-800' },
  { name: 'Industrial Kits', href: '/products?category=industrial-kits', emoji: '🏭', count: '12+ Products', gradient: 'from-red-600 to-orange-700' },
  { name: 'View All', href: '/products', emoji: '→', count: 'All Categories', gradient: 'from-gray-700 to-gray-900' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      {CATEGORIES.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}   // Animate as it enters viewport
          viewport={{ once: true }}              // Only animate once
          transition={{ duration: 0.4, delay: index * 0.06 }} // Staggered entrance
        >
          <Link href={category.href}>
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}  // Lift on hover
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            >
              {/* Icon with gradient background */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl mb-3 shadow-md group-hover:shadow-lg transition-shadow`}
              >
                {category.emoji}
              </div>

              {/* Category name */}
              <span className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 text-center leading-tight group-hover:text-red-600 transition-colors">
                {category.name}
              </span>

              {/* Product count */}
              <span className="text-xs text-gray-400 mt-1 text-center">
                {category.count}
              </span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
