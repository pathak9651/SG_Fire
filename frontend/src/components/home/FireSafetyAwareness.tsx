'use client';

/**
 * ============================================================
 * FILE: src/components/home/FireSafetyAwareness.tsx
 * PURPOSE: Educational section informing users about fire safety
 *          importance, statistics, and tips. Builds brand trust
 *          and positions SG Fire as a safety authority.
 *
 * SECTIONS:
 *  - Stats bar (fires/year, deaths, property loss)
 *  - Safety tips grid
 *  - Emergency numbers
 *  - CTA to shop
 * ============================================================
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle, Phone, ShieldCheck, BookOpen } from 'lucide-react';

const STATS = [
  { value: '25,000+', label: 'Fires reported annually in India', icon: '🔥' },
  { value: '1,200+', label: 'Deaths from fire accidents per year', icon: '😢' },
  { value: '₹8,000 Cr', label: 'Property damage from fires annually', icon: '🏚️' },
  { value: '70%', label: 'Fires are preventable with proper equipment', icon: '✅' },
];

const TIPS = [
  { title: 'Install Smoke Detectors', description: 'Install smoke alarms on every floor and test them monthly.', icon: '🔔' },
  { title: 'Keep Extinguishers Ready', description: 'Place fire extinguishers in kitchens, offices, and near electrical panels.', icon: '🧯' },
  { title: 'Create an Escape Plan', description: 'Practice fire escape routes with your family twice a year.', icon: '🗺️' },
  { title: 'Annual Inspections', description: 'Get your fire safety systems professionally inspected every year.', icon: '🔍' },
  { title: 'Electrical Safety', description: 'Don\'t overload sockets and replace damaged electrical cords immediately.', icon: '⚡' },
  { title: 'Know Emergency Numbers', description: 'Save 101 (Fire) and 112 (Emergency) on every phone in your household.', icon: '📞' },
];

export default function FireSafetyAwareness() {
  return (
    <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
      <div className="container-main">

        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-red-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Why Fire Safety Matters
          </p>
          <h2 className="font-outfit text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Know the Risk. Be Prepared.
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto">
            Fires can start anywhere, anytime. The difference between a minor incident and a catastrophe is proper preparation.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="font-outfit text-xl sm:text-3xl font-bold text-red-600 mb-1">{stat.value}</p>
              <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tips Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {TIPS.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800 transition-colors"
            >
              <span className="text-2xl flex-shrink-0">{tip.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tip.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Emergency numbers + CTA */}
        <div className="bg-gradient-to-r from-red-950 via-gray-900 to-red-950 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Phone size={24} className="text-white" />
            </div>
            <div>
              <p className="text-red-300 text-sm font-semibold mb-1">Emergency Numbers</p>
              <div className="flex gap-6">
                <div>
                  <p className="font-outfit text-3xl font-bold text-white">101</p>
                  <p className="text-gray-400 text-xs">Fire Service</p>
                </div>
                <div>
                  <p className="font-outfit text-3xl font-bold text-white">112</p>
                  <p className="text-gray-400 text-xs">Emergency</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/products" className="btn-primary">
              <ShieldCheck size={18} /> Shop Safety Equipment
            </Link>
            <Link href="/about" className="flex items-center gap-2 px-5 py-3 text-gray-300 border border-gray-700 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors text-sm font-medium">
              <BookOpen size={16} /> Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
