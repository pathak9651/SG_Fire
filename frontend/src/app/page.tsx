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
      {/* 1. Hero Banner — Full-width animated slider */}
      <HeroBanner />

      {/* 2. Category Grid — Quick browse icons */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mb-2">
              Browse By Category
            </p>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Find What You Need
            </h2>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* 3. Featured Products — Lazy loaded with Suspense */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mb-2">
              Top Picks
            </p>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Featured Products
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
              ISI certified and BIS approved fire safety equipment trusted by thousands of homes and businesses across India.
            </p>
          </div>
          {/* Suspense: streams the product grid while server fetches data */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <FeaturedProducts />
          </Suspense>
        </div>
      </section>

      {/* 4. Fire Safety Awareness Section */}
      <FireSafetyAwareness />

      {/* 5. Service Highlights */}
      <section className="section-padding bg-gray-950 text-white">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-orange-400 font-semibold text-sm uppercase tracking-widest mb-2">
              Professional Services
            </p>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold">
              Expert Fire Safety Services
            </h2>
            <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
              From installation to annual maintenance, our certified technicians ensure your fire safety systems are always operational.
            </p>
          </div>
          <ServiceHighlights />
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="section-padding bg-gray-50 dark:bg-gray-900">
        <div className="container-main">
          <div className="text-center mb-10">
            <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mb-2">
              Customer Reviews
            </p>
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Trusted by 10,000+ Customers
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* 7. Partner Brands */}
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
