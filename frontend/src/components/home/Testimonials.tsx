'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, BadgeCheck, MapPin } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    location: 'Mumbai, Maharashtra',
    rating: 5,
    comment: 'Excellent quality fire extinguishers! The installation team was very professional and explained everything clearly. Highly recommend SG Fire for all fire safety needs.',
    service: 'Installation',
    verified: true,
    initial: 'R',
    gradient: 'from-red-500 to-rose-600',
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
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 3,
    name: 'Arjun Mehta',
    location: 'Bangalore, Karnataka',
    rating: 5,
    comment: 'Emergency service response was incredible! Called at 2 AM and technicians arrived within 1.5 hours. Fixed the faulty alarm system and ensured our factory was safe.',
    service: 'Emergency',
    verified: true,
    initial: 'A',
    gradient: 'from-violet-500 to-purple-600',
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
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 5,
    name: 'Vikram Singh',
    location: 'Hyderabad, Telangana',
    rating: 5,
    comment: 'The consultation service was eye-opening. The expert identified 3 critical fire risks in our restaurant that we weren\'t even aware of. Now fully compliant and safe.',
    service: 'Consultation',
    verified: true,
    initial: 'V',
    gradient: 'from-blue-500 to-cyan-600',
  },
];

const slideVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAuto, setIsAuto] = useState(true);

  useEffect(() => {
    if (!isAuto) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isAuto]);

  const testimonial = TESTIMONIALS[current];

  const handleNav = (dir: 'prev' | 'next') => {
    setIsAuto(false);
    setCurrent((p) =>
      dir === 'next'
        ? (p + 1) % TESTIMONIALS.length
        : (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* Decorative large quote */}
        <div className={`absolute -top-4 -right-4 text-[12rem] font-serif leading-none bg-gradient-to-br ${testimonial.gradient} bg-clip-text text-transparent opacity-[0.05] select-none pointer-events-none`}>
          "
        </div>

        {/* Quote icon */}
        <div className={`inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonial.gradient} items-center justify-center mb-6 shadow-md`}>
          <Quote size={20} className="text-white" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>

            {/* Review */}
            <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl leading-relaxed mb-8 font-medium">
              "{testimonial.comment}"
            </p>

            {/* Customer info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0`}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                    {testimonial.verified && (
                      <BadgeCheck size={16} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={11} className="text-gray-400" />
                    <p className="text-sm text-gray-400">{testimonial.location}</p>
                  </div>
                </div>
              </div>

              {/* Service tag */}
              <span className={`text-xs px-4 py-2 bg-gradient-to-r ${testimonial.gradient} text-white rounded-full font-bold shadow whitespace-nowrap`}>
                {testimonial.service}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => handleNav('prev')}
          className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-400 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors duration-150 shadow-sm"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2 items-center">
          {TESTIMONIALS.map((t, i) => (
            <button
              key={i}
              onClick={() => { setIsAuto(false); setCurrent(i); }}
              className={`h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${TESTIMONIALS[i].gradient} ${i === current ? 'w-7 opacity-100' : 'w-2 opacity-35'}`}
            />
          ))}
        </div>

        <button
          onClick={() => handleNav('next')}
          className="w-11 h-11 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:border-red-400 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors duration-150 shadow-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Mini preview avatars */}
      <div className="flex justify-center gap-3 mt-6">
        {TESTIMONIALS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setIsAuto(false); setCurrent(i); }}
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-sm font-bold shadow transition-[opacity,transform] duration-200 ${i === current ? 'scale-100 opacity-100' : 'scale-90 opacity-50 hover:opacity-70'}`}
          >
            {t.initial}
          </button>
        ))}
      </div>
    </div>
  );
}
