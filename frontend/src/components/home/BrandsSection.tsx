'use client';

import { motion } from 'framer-motion';

const BRANDS = [
  { name: 'Kanex Fire', category: 'Extinguishers', color: 'from-red-500 to-rose-600' },
  { name: 'Minimax', category: 'Fire Systems', color: 'from-orange-500 to-red-500' },
  { name: 'Ceasefire', category: 'Fire Safety', color: 'from-amber-500 to-orange-600' },
  { name: 'Safex', category: 'Alarms', color: 'from-red-600 to-orange-500' },
  { name: 'Honeywell', category: 'Detectors', color: 'from-blue-500 to-cyan-600' },
  { name: 'Hochiki', category: 'Alarms', color: 'from-violet-500 to-purple-600' },
  { name: 'Bosch', category: 'Security', color: 'from-gray-600 to-gray-800' },
  { name: 'Johnson Controls', category: 'Fire Control', color: 'from-emerald-500 to-green-600' },
  { name: 'Nitco', category: 'Safety Equipment', color: 'from-rose-500 to-red-600' },
  { name: 'Amerex', category: 'Extinguishers', color: 'from-orange-600 to-red-600' },
];

// Initial letters for the brand logos
const getInitials = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function BrandsSection() {
  return (
    <section className="py-14 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-950 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container-main mb-8 text-center"
      >
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] font-bold mb-1">Trusted Partner Brands</p>
        <h3 className="font-outfit text-xl font-bold text-gray-800 dark:text-gray-200">
          India's Leading Fire Safety Manufacturers
        </h3>
      </motion.div>

      {/* Dual-direction marquee for premium feel */}
      <div className="space-y-4">
        {/* Row 1 — scrolls left */}
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
            className="flex gap-4 items-center"
          >
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <motion.div
                key={`a-${index}`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center gap-3 flex-shrink-0 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all cursor-default min-w-[170px] group"
              >
                {/* Brand initial logo */}
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md`}>
                  {getInitials(brand.name)}
                </div>
                <div>
                  <p className="font-outfit font-bold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
                    {brand.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{brand.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Row 2 — scrolls right (opposite direction for depth effect) */}
        <div className="relative flex overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          <motion.div
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
            className="flex gap-4 items-center"
          >
            {[...BRANDS.slice(5), ...BRANDS.slice(0, 5), ...BRANDS.slice(5), ...BRANDS.slice(0, 5)].map((brand, index) => (
              <motion.div
                key={`b-${index}`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="flex items-center gap-3 flex-shrink-0 px-5 py-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all cursor-default min-w-[170px]"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-md`}>
                  {getInitials(brand.name)}
                </div>
                <div>
                  <p className="font-outfit font-bold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
                    {brand.name}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{brand.category}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Certification badges */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="container-main mt-10 flex flex-wrap justify-center gap-4"
      >
        {['ISI Certified', 'BIS Approved', 'ISO 9001:2015', 'CE Marked', 'NBC Compliant'].map((badge) => (
          <div
            key={badge}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400 shadow-sm"
          >
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-black">✓</span>
            </div>
            {badge}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
