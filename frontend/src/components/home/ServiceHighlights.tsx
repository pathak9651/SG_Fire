'use client';

/**
 * ============================================================
 * FILE: src/components/home/ServiceHighlights.tsx
 * PURPOSE: Showcases SG Fire's professional services to drive
 *          appointment bookings. Displayed on the dark-background
 *          services section on the homepage.
 *
 * SERVICES:
 *  - Installation (new equipment)
 *  - Annual Inspection
 *  - Maintenance & Refilling
 *  - AMC Plans
 *  - Emergency Service (24/7)
 *  - Consultation
 * ============================================================
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Star, Users, Wrench } from 'lucide-react';

const SERVICES = [
  {
    icon: '🔧',
    title: 'Installation Service',
    description: 'Expert installation of fire extinguishers, alarms, sprinklers, and complete fire safety systems.',
    href: '/appointments?type=installation',
    time: '2–4 Hours',
    color: 'from-red-600 to-red-800',
  },
  {
    icon: '🔍',
    title: 'Annual Inspection',
    description: 'Comprehensive inspection of all your fire safety equipment to ensure compliance and functionality.',
    href: '/appointments?type=inspection',
    time: '1–2 Hours',
    color: 'from-orange-600 to-red-700',
  },
  {
    icon: '⚙️',
    title: 'Maintenance & Refilling',
    description: 'Regular maintenance, pressure testing, and refilling of fire extinguishers and suppression systems.',
    href: '/appointments?type=maintenance',
    time: 'On-site',
    color: 'from-amber-600 to-orange-700',
  },
  {
    icon: '📋',
    title: 'AMC Plans',
    description: 'Annual Maintenance Contracts for homes, offices, and industries. Stay compliant year-round.',
    href: '/appointments?type=amc',
    time: 'Yearly Plan',
    color: 'from-purple-600 to-purple-800',
  },
  {
    icon: '🚨',
    title: 'Emergency Service',
    description: '24/7 emergency fire safety response. Our technicians reach you within 2 hours anywhere in the city.',
    href: '/appointments?type=emergency',
    time: '< 2 Hours Response',
    color: 'from-red-700 to-red-900',
  },
  {
    icon: '💬',
    title: 'Free Consultation',
    description: 'Professional fire safety assessment for your home or business. Get expert recommendations.',
    href: '/appointments?type=consultation',
    time: '30–60 Minutes',
    color: 'from-green-600 to-green-800',
  },
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Happy Customers' },
  { icon: Star, value: '4.8/5', label: 'Average Rating' },
  { icon: Wrench, value: '50+', label: 'Expert Technicians' },
  { icon: Clock, value: '24/7', label: 'Emergency Support' },
];

export default function ServiceHighlights() {
  return (
    <div>
      {/* Service Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {SERVICES.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={service.href}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-red-700 transition-all duration-300 h-full flex flex-col"
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                  {service.icon}
                </div>

                {/* Time indicator */}
                <div className="flex items-center gap-1 mb-3">
                  <Clock size={12} className="text-red-400" />
                  <span className="text-xs text-red-400 font-medium">{service.time}</span>
                </div>

                <h3 className="font-outfit font-bold text-white text-lg mb-2 group-hover:text-red-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className="mt-4 flex items-center gap-1 text-red-400 text-sm font-semibold group-hover:gap-2 transition-all">
                  Book Now <span>→</span>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gray-900 rounded-2xl border border-gray-800">
        {STATS.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <Icon size={18} className="text-red-500 mx-auto mb-2" />
            <p className="font-outfit text-xl sm:text-3xl font-bold text-white">{value}</p>
            <p className="text-[10px] sm:text-sm text-gray-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Book CTA */}
      <div className="text-center mt-8">
        <Link href="/appointments" className="btn-primary text-base">
          🗓️ Book a Service Appointment
        </Link>
      </div>
    </div>
  );
}
