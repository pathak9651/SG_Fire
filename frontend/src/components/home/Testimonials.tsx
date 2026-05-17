'use client';

/**
 * ============================================================
 * FILE: src/components/home/Testimonials.tsx
 * PURPOSE: Displays customer testimonials/reviews as a carousel
 *          to build social proof and trust in SG Fire's products
 *          and services.
 *
 * FEATURES:
 *  - Auto-playing carousel with navigation
 *  - Star rating display
 *  - Verified purchase badge
 *  - Customer photo (initial avatar fallback)
 *  - Service type tag
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'Excellent quality fire extinguishers! The installation team was very professional and explained everything clearly. Highly recommend SG Fire for all fire safety needs.',
    service: 'Product Purchase + Installation',
    verified: true,
    initial: 'R',
    color: 'bg-red-600',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Delhi, NCR',
    rating: 5,
    comment: 'Booked an AMC plan for our office building. The technicians arrived on time, conducted a thorough inspection, and gave detailed recommendations. Best fire safety company!',
    service: 'AMC Plan',
    verified: true,
    initial: 'P',
    color: 'bg-orange-600',
  },
  {
    id: 3,
    name: 'Arjun Mehta',
    location: 'Bangalore, Karnataka',
    rating: 5,
    comment: 'Emergency service response was incredible! Called at 2 AM and technicians arrived within 1.5 hours. Fixed the faulty alarm system and ensured our factory was safe.',
    service: 'Emergency Service',
    verified: true,
    initial: 'A',
    color: 'bg-purple-600',
  },
  {
    id: 4,
    name: 'Sunita Patel',
    location: 'Pune, Maharashtra',
    rating: 4,
    comment: 'Purchased smoke detectors and fire alarms for our new home. Great product quality, fast delivery, and easy installation. Very satisfied with the purchase.',
    service: 'Product Purchase',
    verified: true,
    initial: 'S',
    color: 'bg-green-600',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Hyderabad, Telangana',
    rating: 5,
    comment: 'The consultation service was eye-opening. The expert identified 3 critical fire risks in our restaurant that we weren\'t even aware of. Now fully compliant and safe.',
    service: 'Free Consultation',
    verified: true,
    initial: 'V',
    color: 'bg-blue-600',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonial = TESTIMONIALS[current];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Large quote card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
        {/* Quote icon */}
        <Quote size={48} className="text-red-100 dark:text-red-950 absolute top-6 right-8" />

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                />
              ))}
            </div>

            {/* Review text */}
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 relative z-10">
              "{testimonial.comment}"
            </p>

            {/* Customer info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    {testimonial.verified && (
                      <BadgeCheck size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{testimonial.location}</p>
                </div>
              </div>

              <span className="text-xs px-4 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-full font-bold uppercase tracking-widest whitespace-nowrap">
                {testimonial.service}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current ? 'w-6 h-2.5 bg-red-600' : 'w-2.5 h-2.5 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrent((p) => (p + 1) % TESTIMONIALS.length)}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
