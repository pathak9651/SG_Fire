'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { label: 'Fire Extinguishers', href: '/products?category=fire-extinguishers', icon: '🧯', description: 'Portable & reliable fire suppression' },
  { label: 'Smoke Detectors', href: '/products?category=smoke-detectors', icon: '🔔', description: 'Early warning systems for home & office' },
  { label: 'Fire Alarms', href: '/products?category=fire-alarms', icon: '🚨', description: 'Advanced emergency alert systems' },
  { label: 'Safety Helmets', href: '/products?category=safety-helmets', icon: '⛑️', description: 'Industrial grade head protection' },
  { label: 'Fire Sprinklers', href: '/products?category=fire-sprinklers', icon: '💧', description: 'Automatic suppression solutions' },
  { label: 'Emergency Exit', href: '/products?category=emergency-exit', icon: '🚪', description: 'Evacuation lighting & signage' },
  { label: 'Safety Gloves', href: '/products?category=safety-gloves', icon: '🧤', description: 'Heat resistant hand protection' },
  { label: 'CCTV & Security', href: '/products?category=cctv-security', icon: '📹', description: '24/7 surveillance for safety' },
];

interface MegaMenuProps {
  isOpen: boolean;
}

export default function MegaMenu({ isOpen }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[900px] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 z-50 overflow-hidden"
        >
          {/* Background Decorative Element */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-12 gap-8 relative">
            {/* Left Column: Categories Grid */}
            <div className="col-span-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-3">
                Safety Categories
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="group flex items-start gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-xl group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors shadow-sm">
                      {cat.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                        {cat.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {cat.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Featured Section */}
            <div className="col-span-4 border-l border-gray-100 dark:border-gray-800 pl-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                Featured Protection
              </h3>
              
              <div className="bg-fire-gradient rounded-2xl p-6 text-white relative overflow-hidden shadow-lg group">
                <div className="relative z-10">
                  <Shield size={32} className="mb-4 text-white/90" />
                  <h4 className="font-bold text-lg leading-tight mb-2">
                    Home Safety <br /> Essential Kit
                  </h4>
                  <p className="text-white/80 text-xs mb-4">
                    Complete protection for your family with our top-rated essentials.
                  </p>
                  <Link 
                    href="/products/home-safety-kit" 
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold transition-all group-hover:gap-3"
                  >
                    Explore Now <ArrowRight size={14} />
                  </Link>
                </div>
                
                {/* Decorative Flame */}
                <Flame className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12 transition-transform group-hover:scale-110" />
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <Link href="/services" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors">Emergency Support</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/appointments" className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 transition-colors">Schedule Site Visit</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/products" className="text-sm font-bold text-red-600 hover:underline inline-flex items-center gap-1">
                  View All Products <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
