/**
 * ============================================================
 * FILE: src/app/page.tsx
 * PURPOSE: Home page — the main landing page of SG Fire.
 *          Server Component for SEO (no 'use client').
 *          Renders all homepage sections in order:
 *          1. Hero Banner (Swiper slider)
 *          2. Category Grid
 *          3. Featured Products
 *          4. Fire Safety Awareness section
 *          5. Service Highlights
 *          6. Testimonials
 *          7. Brands section
 *
 * SEO: Custom metadata exported for this specific page.
 * PERFORMANCE: Uses React Suspense for streaming SSR of product sections.
 * ============================================================
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import FireSafetyAwareness from '@/components/home/FireSafetyAwareness';
import ServiceHighlights from '@/components/home/ServiceHighlights';
import Testimonials from '@/components/home/Testimonials';
import BrandsSection from '@/components/home/BrandsSection';
import { Skeleton } from '@/components/ui/Skeleton';

// Page-specific SEO metadata (overrides defaults in layout.tsx)
export const metadata: Metadata = {
  title: 'SG Fire — Premium Fire Safety Equipment & Professional Services',
  description:
    'India\'s most trusted fire safety store. Shop ISI certified fire extinguishers, smoke detectors, alarms, and more. Book professional installation and inspection services.',
  openGraph: {
    title: 'SG Fire — Premium Fire Safety Equipment',
    description: 'Shop certified fire safety equipment and book professional services.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Banner */}
      <HeroBanner />

      {/* 2. Category Grid */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-3xl" />
        </div>
        <div className="container-main relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 font-bold text-xs uppercase tracking-[0.2em] rounded-full border border-red-100 dark:border-red-900/50 mb-4">
              Browse By Category
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
              Find What You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Need</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              From extinguishers to detectors — everything to keep you safe.
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="section-padding bg-white dark:bg-gray-950">
        <div className="container-main">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 font-bold text-xs uppercase tracking-[0.2em] rounded-full border border-orange-100 dark:border-orange-900/40 mb-4">
              Top Picks
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
              Featured{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                Products
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
              ISI certified and BIS approved fire safety equipment trusted by thousands of homes and businesses across India.
            </p>
          </div>
          <Suspense fallback={<ProductGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* 4. Fire Safety Awareness */}
      <FireSafetyAwareness />

      {/* 5. Service Highlights */}
      <section className="section-padding bg-gray-950 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl" />
          {/* Dot grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>
        <div className="container-main relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-orange-500/10 text-orange-400 font-bold text-xs uppercase tracking-[0.2em] rounded-full border border-orange-500/20 mb-4">
              Professional Services
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black text-white">
              Expert Fire Safety{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Services
              </span>
            </h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              From installation to annual maintenance, our certified technicians ensure your fire safety systems are always operational.
            </p>
          </div>
          <ServiceHighlights />
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-orange-500/[0.04] rounded-full blur-3xl" />
        </div>
        <div className="container-main relative">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-[0.2em] rounded-full border border-amber-100 dark:border-amber-900/40 mb-4">
              Customer Reviews
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
              Trusted by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                10,000+
              </span>{' '}
              Customers
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* 7. Brands */}
      <BrandsSection />
    </>
  );
}


/** Skeleton loader for featured products grid while data loads */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden">
          <div className="skeleton h-52 w-full" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
