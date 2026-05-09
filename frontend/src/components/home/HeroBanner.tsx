'use client';

/**
 * ============================================================
 * FILE: src/components/home/HeroBanner.tsx
 * PURPOSE: Full-width animated hero slider on the homepage.
 *          Shows fire safety promotional banners with:
 *          - Auto-playing carousel (Framer Motion)
 *          - Overlaid text with CTA buttons
 *          - Gradient overlays for text readability
 *          - Navigation dots and arrow controls
 *          - Responsive design (different heights mobile/desktop)
 *
 * DATA: Initially uses static placeholder slides.
 *       TODO: Fetch banners from /api/admin/banners?position=hero
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Calendar, Shield } from 'lucide-react';

/** Hero slide data structure */
interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  bgGradient: string; // Tailwind gradient classes
  badge?: string;
}

// Static hero slides (will be replaced by API data in production)
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Protect What Matters Most',
    subtitle: 'Premium Fire Safety Equipment',
    description: 'ISI certified fire extinguishers, smoke detectors, and alarms delivered to your doorstep. Trusted by 10,000+ homes and businesses.',
    primaryCTA: { label: 'Shop Now', href: '/products' },
    secondaryCTA: { label: 'Book Service', href: '/services' },
    bgGradient: 'from-gray-950 via-red-950 to-gray-900',
    badge: '🔥 Up to 30% OFF',
  },
  {
    id: 2,
    title: 'Expert Installation Services',
    subtitle: 'Professional Fire Safety Technicians',
    description: 'Book certified technicians for fire safety installation, annual inspection, and maintenance services. Same-week appointments available.',
    primaryCTA: { label: 'Book Appointment', href: '/appointments' },
    secondaryCTA: { label: 'Learn More', href: '/about' },
    bgGradient: 'from-gray-950 via-orange-950 to-gray-900',
    badge: '📅 Instant Booking',
  },
  {
    id: 3,
    title: 'Annual Maintenance Contracts',
    subtitle: 'AMC Plans for Businesses',
    description: 'Comprehensive Annual Maintenance Contracts for offices, factories, and commercial buildings. Stay compliant with fire safety regulations.',
    primaryCTA: { label: 'Get AMC Quote', href: '/appointments?type=amc' },
    secondaryCTA: { label: 'View Products', href: '/products' },
    bgGradient: 'from-gray-950 via-red-900 to-orange-950',
    badge: '🏢 B2B Solutions',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Auto-advance slides every 5 seconds
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer); // Cleanup on unmount
  }, [nextSlide]);

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-[560px] md:h-[640px] lg:h-[700px] overflow-hidden">

      {/* ── Animated Background ─────────────────────────── */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.6, ease: 'easeInOut' }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`}
        >
          {/* Decorative fire particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle, #dc2626 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Slide Content ───────────────────────────────── */}
      <div className="relative z-10 container-main h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl"
          >
            {/* Promotional badge */}
            {slide.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full text-red-300 text-sm font-semibold mb-4"
              >
                {slide.badge}
              </motion.div>
            )}

            {/* Subtitle */}
            <p className="text-orange-400 font-semibold text-sm md:text-base uppercase tracking-widest mb-2">
              {slide.subtitle}
            </p>

            {/* Main headline */}
            <h1 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href={slide.primaryCTA.href} className="btn-primary text-base px-6 py-3">
                <ShoppingBag size={18} />
                {slide.primaryCTA.label}
              </Link>
              <Link
                href={slide.secondaryCTA.href}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition-all text-base"
              >
                <Calendar size={18} />
                {slide.secondaryCTA.label}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mt-8">
              {[
                { icon: Shield, text: 'ISI Certified Products' },
                { icon: Shield, text: 'Expert Technicians' },
                { icon: Shield, text: 'Free Shipping ₹1000+' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon size={16} className="text-red-400" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation Arrows ───────────────────────────── */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dot Indicators ──────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? 'w-8 h-2 bg-red-500'     // Active dot: elongated pill
                : 'w-2 h-2 bg-white/40 hover:bg-white/60' // Inactive dot
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
