'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Calendar, Shield, Zap, ArrowRight } from 'lucide-react';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA: { label: string; href: string };
  image: string;
  badge?: string;
  accentColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Protect What Matters Most',
    subtitle: 'Premium Fire Safety Equipment',
    description: 'ISI certified fire extinguishers, smoke detectors, and alarms delivered to your doorstep. Trusted by 10,000+ homes and businesses.',
    primaryCTA: { label: 'Shop Now', href: '/products' },
    secondaryCTA: { label: 'Book Service', href: '/appointments' },
    image: '/images/hero-1.png',
    badge: '🔥 Up to 30% OFF',
    accentColor: 'from-red-600 to-orange-600',
  },
  {
    id: 2,
    title: 'Expert Installation Services',
    subtitle: 'Professional Fire Safety Technicians',
    description: 'Book certified technicians for fire safety installation, annual inspection, and maintenance services. Same-week appointments available.',
    primaryCTA: { label: 'Book Appointment', href: '/appointments' },
    secondaryCTA: { label: 'Learn More', href: '/about' },
    image: '/images/hero-2.png',
    badge: '📅 Instant Booking',
    accentColor: 'from-orange-500 to-red-600',
  },
  {
    id: 3,
    title: 'Annual Maintenance Contracts',
    subtitle: 'AMC Plans for Businesses',
    description: 'Comprehensive Annual Maintenance Contracts for offices, factories, and commercial buildings. Stay compliant with fire safety regulations.',
    primaryCTA: { label: 'Get AMC Quote', href: '/appointments?type=amc' },
    secondaryCTA: { label: 'View Products', href: '/products' },
    image: '/images/hero-3.png',
    badge: '🏢 B2B Solutions',
    accentColor: 'from-red-700 to-orange-500',
  },
];

const TRUST_BADGES = [
  { icon: Shield, text: 'ISI Certified' },
  { icon: Zap, text: 'Fast Delivery' },
  { icon: Shield, text: 'Expert Techs' },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

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
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 1.02 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0, scale: 0.98 }),
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-[520px] sm:h-[580px] md:h-[660px] lg:h-[720px] overflow-hidden bg-gray-950">

      {/* ── Background Image with Overlay ──────────────────── */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover object-center"
            priority={currentSlide === 0}
            quality={90}
          />
          {/* Multi-layer overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/75 to-gray-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-gray-950/20" />

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-20 right-20 w-72 h-72 bg-red-600 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-20 left-1/3 w-96 h-96 bg-orange-600 rounded-full blur-3xl"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Slide Content ────────────────────────────────────── */}
      <div className="relative z-10 container-main h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {/* Badge */}
            {slide.badge && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.25 }}
                className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold mb-5 shadow-lg"
              >
                {slide.badge}
              </motion.div>
            )}

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-r ${slide.accentColor}`}
            >
              {slide.subtitle}
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="font-outfit text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.1] mb-5"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl"
            >
              {slide.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href={slide.primaryCTA.href}
                className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r ${slide.accentColor} text-white font-bold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all text-base`}
              >
                <ShoppingBag size={18} />
                {slide.primaryCTA.label}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={slide.secondaryCTA.href}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-all text-base"
              >
                <Calendar size={18} />
                {slide.secondaryCTA.label}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  <Icon size={13} className="text-orange-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav Arrows ─────────────────────────────────────── */}
      {['prev', 'next'].map((dir) => (
        <motion.button
          key={dir}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={dir === 'prev' ? prevSlide : nextSlide}
          className={`absolute ${dir === 'prev' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full hidden md:flex items-center justify-center transition-all backdrop-blur-md border border-white/15 shadow-xl`}
          aria-label={dir === 'prev' ? 'Previous slide' : 'Next slide'}
        >
          {dir === 'prev' ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
        </motion.button>
      ))}

      {/* ── Dots ──────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            animate={{ width: index === currentSlide ? 32 : 8, opacity: index === currentSlide ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
            className={`h-2 rounded-full ${index === currentSlide ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-white/50'}`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ── Slide counter ─────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-20 text-xs text-white/40 font-mono hidden md:block">
        {String(currentSlide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
