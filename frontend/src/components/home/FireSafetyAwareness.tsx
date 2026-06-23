'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { ShieldCheck, BookOpen, Phone, ArrowRight } from 'lucide-react';

const STATS = [
  { value: '25,000+', label: 'Fires reported annually in India', icon: '🔥', color: 'from-red-500 to-orange-500' },
  { value: '1,200+', label: 'Deaths from fire accidents per year', icon: '😢', color: 'from-orange-500 to-amber-500' },
  { value: '₹8,000 Cr', label: 'Property damage from fires annually', icon: '🏚️', color: 'from-amber-500 to-yellow-500' },
  { value: '70%', label: 'Fires are preventable with proper equipment', icon: '✅', color: 'from-green-500 to-emerald-500' },
];

const TIPS = [
  { title: 'Install Smoke Detectors', description: 'Install smoke alarms on every floor and test them monthly.', icon: '🔔', color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/30 hover:border-orange-300' },
  { title: 'Keep Extinguishers Ready', description: 'Place fire extinguishers in kitchens, offices, and near electrical panels.', icon: '🧯', color: 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30 hover:border-red-300' },
  { title: 'Create an Escape Plan', description: 'Practice fire escape routes with your family twice a year.', icon: '🗺️', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30 hover:border-blue-300' },
  { title: 'Annual Inspections', description: 'Get your fire safety systems professionally inspected every year.', icon: '🔍', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30 hover:border-purple-300' },
  { title: 'Electrical Safety', description: 'Don\'t overload sockets and replace damaged electrical cords immediately.', icon: '⚡', color: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/30 hover:border-yellow-300' },
  { title: 'Know Emergency Numbers', description: 'Save 101 (Fire) and 112 (Emergency) on every phone in your household.', icon: '📞', color: 'bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/30 hover:border-green-300' },
];

// Animated counter hook
function useCounter(target: string, isInView: boolean) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!isInView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const prefix = target.match(/^[^0-9]*/)?.[0] || '';
    const suffix = target.replace(/^[^0-9]*/, '').replace(/[0-9,.]+/, '');
    if (isNaN(num)) { setDisplay(target); return; }
    let start = 0;
    const steps = 50;
    const step = num / steps;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      start += step;
      const val = Math.min(start, num);
      const formatted = val >= 1000 ? Math.round(val).toLocaleString('en-IN') : (Number.isInteger(num) ? Math.round(val).toString() : val.toFixed(1));
      setDisplay(prefix + formatted + suffix);
      if (count >= steps) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return display;
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const animated = useCounter(stat.value, isInView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative text-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
      <div className="text-3xl mb-3">{stat.icon}</div>
      <p className={`font-outfit text-2xl sm:text-3xl font-black mb-1.5 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
        {animated}
      </p>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-snug">{stat.label}</p>
    </motion.div>
  );
}

export default function FireSafetyAwareness() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950 overflow-hidden">
      <div className="container-main">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 font-bold text-xs uppercase tracking-widest rounded-full border border-red-100 dark:border-red-900/50 mb-4"
          >
            Why Fire Safety Matters
          </motion.span>
          <h2 className="font-outfit text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4">
            Know the Risk.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Be Prepared.
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Fires can start anywhere, anytime. The difference between a minor incident and a catastrophe is proper preparation.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>

        {/* Tips Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              whileHover={{ y: -3 }}
              className={`flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-default ${tip.color}`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{tip.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-red-950 via-gray-900 to-red-950 rounded-3xl p-6 sm:p-8 md:p-12 overflow-hidden"
        >
          {/* Decorative glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8">
            {/* Emergency numbers */}
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(239,68,68,0.4)', '0 0 0 16px rgba(239,68,68,0)', '0 0 0 0 rgba(239,68,68,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl"
              >
                <Phone size={26} className="text-white" />
              </motion.div>
              <div>
                <p className="text-red-300 text-sm font-semibold mb-2 uppercase tracking-widest">Emergency Numbers</p>
                <div className="flex gap-8">
                  {[{ num: '101', label: 'Fire Service' }, { num: '112', label: 'Emergency' }].map(({ num, label }) => (
                    <div key={num}>
                      <p className="font-outfit text-4xl font-black text-white">{num}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
              >
                <ShieldCheck size={18} />
                Shop Safety Equipment
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-gray-300 border border-gray-700 rounded-2xl hover:border-red-500 hover:text-red-400 hover:bg-red-950/20 transition-all font-medium"
              >
                <BookOpen size={16} />
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
