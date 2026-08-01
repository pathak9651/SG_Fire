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
    image: '/images/hero-3-new.png',
    badge: '🏢 B2B Solutions',
    accentColor: 'from-red-700 to-orange-500',
  },
];

const TRUST_BADGES = [
  { icon: Shield, text: 'ISI Certified' },
  { icon: Zap, text: 'Fast Delivery' },
  { icon: Shield, text: 'Expert Techs' },
];

/* Lightweight slide transition — opacity only, no scale/translate on background */
const contentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section className="relative h-[520px] sm:h-[580px] md:h-[660px] lg:h-[720px] overflow-hidden bg-gray-950">

      {/* ── Background Images — crossfade only (no translate/scale) ── */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover object-center"
            priority={i === 0}
            quality={85}
          />
          {/* Single-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-gray-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── Slide Content ─────────────────────────────── */}
      <div className="relative z-10 container-main h-full flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {/* Badge */}
            {slide.badge && (
              <div className="inline-flex items-center px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white text-sm font-bold mb-5 shadow-lg">
                {slide.badge}
              </div>
            )}

            {/* Subtitle */}
            <p className={`text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-r ${slide.accentColor}`}>
              {slide.subtitle}
            </p>

            {/* Headline */}
            <h1 className="font-outfit text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.1] mb-5">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              {slide.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={slide.primaryCTA.href}
                className={`group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r ${slide.accentColor} text-white font-bold rounded-2xl shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 transition-transform duration-200 text-base`}
              >
                <ShoppingBag size={18} />
                {slide.primaryCTA.label}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-150" />
              </Link>
              <Link
                href={slide.secondaryCTA.href}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:-translate-y-0.5 transition-transform duration-200 text-base"
              >
                <Calendar size={18} />
                {slide.secondaryCTA.label}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-8">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Icon size={13} className="text-orange-400" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Nav Arrows ─────────────────────────────────── */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-black/65 text-white rounded-full hidden md:flex items-center justify-center transition-colors duration-200 border border-white/15 shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-black/65 text-white rounded-full hidden md:flex items-center justify-center transition-colors duration-200 border border-white/15 shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Dots ──────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-gradient-to-r from-red-500 to-orange-500'
                : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ── Slide counter ─────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-20 text-xs text-white/40 font-mono hidden md:block">
        {String(currentSlide + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
