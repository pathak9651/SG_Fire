'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Clock, Star, Users, Wrench, ArrowRight, Zap } from 'lucide-react';

const SERVICES = [
  {
    emoji: '🔧',
    title: 'Installation Service',
    description: 'Expert installation of fire extinguishers, alarms, sprinklers, and complete fire safety systems.',
    href: '/appointments?type=installation',
    time: '2–4 Hours',
    gradient: 'from-red-500 to-rose-700',
    glow: 'shadow-red-500/30',
    tag: 'Most Popular',
  },
  {
    emoji: '🔍',
    title: 'Annual Inspection',
    description: 'Comprehensive inspection of all your fire safety equipment to ensure compliance and functionality.',
    href: '/appointments?type=inspection',
    time: '1–2 Hours',
    gradient: 'from-orange-500 to-red-600',
    glow: 'shadow-orange-500/30',
    tag: null,
  },
  {
    emoji: '⚙️',
    title: 'Maintenance & Refilling',
    description: 'Regular maintenance, pressure testing, and refilling of fire extinguishers and suppression systems.',
    href: '/appointments?type=maintenance',
    time: 'On-site',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-amber-500/30',
    tag: null,
  },
  {
    emoji: '📋',
    title: 'AMC Plans',
    description: 'Annual Maintenance Contracts for homes, offices, and industries. Stay compliant year-round.',
    href: '/appointments?type=amc',
    time: 'Yearly Plan',
    gradient: 'from-violet-600 to-purple-700',
    glow: 'shadow-purple-500/30',
    tag: 'Best Value',
  },
  {
    emoji: '🚨',
    title: 'Emergency Service',
    description: '24/7 emergency fire safety response. Our technicians reach you within 2 hours anywhere in the city.',
    href: '/appointments?type=emergency',
    time: '< 2 Hours',
    gradient: 'from-red-600 to-red-900',
    glow: 'shadow-red-600/30',
    tag: '24/7',
  },
  {
    emoji: '💬',
    title: 'Free Consultation',
    description: 'Professional fire safety assessment for your home or business. Get expert recommendations.',
    href: '/appointments?type=consultation',
    time: '30–60 Min',
    gradient: 'from-emerald-500 to-green-700',
    glow: 'shadow-green-500/30',
    tag: 'Free',
  },
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Happy Customers', color: 'text-red-400' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-amber-400' },
  { icon: Wrench, value: '50+', label: 'Expert Technicians', color: 'text-orange-400' },
  { icon: Zap, value: '24/7', label: 'Emergency Support', color: 'text-purple-400' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServiceHighlights() {
  return (
    <div>
      {/* Service Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14"
      >
        {SERVICES.map((service) => (
          <motion.div key={service.title} variants={cardVariants}>
            <Link href={service.href} className="block h-full group">
              <motion.div
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`relative h-full p-6 bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-gray-600 transition-all duration-300 flex flex-col overflow-hidden hover:shadow-2xl ${service.glow}`}
              >
                {/* Background glow blob on hover */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />

                {/* Tag */}
                {service.tag && (
                  <span className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${service.gradient} text-white shadow-lg`}>
                    {service.tag}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl mb-5 shadow-xl ${service.glow} shadow-lg`}>
                  {service.emoji}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock size={11} className="text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">{service.time}</span>
                </div>

                <h3 className={`font-outfit font-bold text-white text-lg mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${service.gradient} transition-all duration-300`}>
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className={`mt-5 flex items-center gap-2 text-sm font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${service.gradient} text-gray-500 transition-all`}>
                  Book Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-1 p-2 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800"
      >
        {STATS.map(({ icon: Icon, value, label, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="text-center p-5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Icon size={20} className={`${color} mx-auto mb-3`} />
            <p className={`font-outfit text-2xl sm:text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Book CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center mt-10"
      >
        <Link
          href="/appointments"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 transition-all text-base"
        >
          🗓️ Book a Service Appointment
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
