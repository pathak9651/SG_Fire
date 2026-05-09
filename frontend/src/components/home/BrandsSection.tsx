'use client';

/**
 * ============================================================
 * FILE: src/components/home/BrandsSection.tsx
 * PURPOSE: Displays logos of partner brands and certifications.
 *          Builds trust through association with known fire safety
 *          equipment manufacturers.
 *
 * FEATURES:
 *  - Scrolling marquee animation (infinite loop)
 *  - Brand logos as styled text (replace with actual logos in prod)
 *  - Duplicated list for seamless loop effect
 * ============================================================
 */

import { motion } from 'framer-motion';

const BRANDS = [
  { name: 'Kanex Fire', category: 'Extinguishers' },
  { name: 'Minimax', category: 'Fire Systems' },
  { name: 'Ceasefire', category: 'Fire Safety' },
  { name: 'Safex', category: 'Alarms' },
  { name: 'Honeywell', category: 'Detectors' },
  { name: 'Hochiki', category: 'Alarms' },
  { name: 'Bosch', category: 'Security' },
  { name: 'Johnson Controls', category: 'Fire Control' },
  { name: 'Nitco', category: 'Safety Equipment' },
  { name: 'Amerex', category: 'Extinguishers' },
];

export default function BrandsSection() {
  return (
    <section className="py-12 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="container-main mb-6 text-center">
        <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold">
          Trusted Partner Brands
        </p>
      </div>

      {/* Infinite scrolling marquee */}
      <div className="relative flex overflow-hidden">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />

        {/* Scrolling track — duplicated for seamless loop */}
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="flex gap-10 items-center"
        >
          {/* Original list + duplicate for seamless loop */}
          {[...BRANDS, ...BRANDS].map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex flex-col items-center flex-shrink-0 px-6 py-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 min-w-[140px]"
            >
              <span className="font-outfit font-bold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
                {brand.name}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{brand.category}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
