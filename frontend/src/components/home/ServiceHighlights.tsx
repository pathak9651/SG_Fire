'use client';

import Link from 'next/link';
import { Clock, Star, Users, Wrench, ArrowRight, Zap } from 'lucide-react';
import { useReveal } from '@/lib/useReveal';

const SERVICES = [
  {
    emoji: '🔧',
    title: 'Installation Service',
    description: 'Expert installation of fire extinguishers, alarms, sprinklers, and complete fire safety systems.',
    href: '/appointments?type=installation',
    time: '2–4 Hours',
    gradient: 'from-red-500 to-rose-700',
    tag: 'Most Popular',
  },
  {
    emoji: '🔍',
    title: 'Annual Inspection',
    description: 'Comprehensive inspection of all your fire safety equipment to ensure compliance and functionality.',
    href: '/appointments?type=inspection',
    time: '1–2 Hours',
    gradient: 'from-orange-500 to-red-600',
    tag: null,
  },
  {
    emoji: '⚙️',
    title: 'Maintenance & Refilling',
    description: 'Regular maintenance, pressure testing, and refilling of fire extinguishers and suppression systems.',
    href: '/appointments?type=maintenance',
    time: 'On-site',
    gradient: 'from-amber-500 to-orange-600',
    tag: null,
  },
  {
    emoji: '📋',
    title: 'AMC Plans',
    description: 'Annual Maintenance Contracts for homes, offices, and industries. Stay compliant year-round.',
    href: '/appointments?type=amc',
    time: 'Yearly Plan',
    gradient: 'from-violet-600 to-purple-700',
    tag: 'Best Value',
  },
  {
    emoji: '🚨',
    title: 'Emergency Service',
    description: '24/7 emergency fire safety response. Our technicians reach you within 2 hours anywhere in the city.',
    href: '/appointments?type=emergency',
    time: '< 2 Hours',
    gradient: 'from-red-600 to-red-900',
    tag: '24/7',
  },
  {
    emoji: '💬',
    title: 'Free Consultation',
    description: 'Professional fire safety assessment for your home or business. Get expert recommendations.',
    href: '/appointments?type=consultation',
    time: '30–60 Min',
    gradient: 'from-emerald-500 to-green-700',
    tag: 'Free',
  },
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Happy Customers', color: 'text-red-400' },
  { icon: Star, value: '4.8/5', label: 'Average Rating', color: 'text-amber-400' },
  { icon: Wrench, value: '50+', label: 'Expert Technicians', color: 'text-orange-400' },
  { icon: Zap, value: '24/7', label: 'Emergency Support', color: 'text-purple-400' },
];

const STAGGER = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4', 'reveal-delay-5'];

export default function ServiceHighlights() {
  const cardsRef = useReveal() as React.RefObject<HTMLDivElement>;

  return (
    <div>
      {/* Service Cards — CSS reveal on scroll */}
      <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {SERVICES.map((service, i) => (
          <div key={service.title} className={`reveal ${STAGGER[Math.min(i, 5)]}`}>
            <Link href={service.href} className="block h-full group">
              <div className={`relative h-full p-6 bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-200/80 dark:border-gray-800 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:-translate-y-1.5 shadow-sm hover:shadow-lg transition-[transform,border-color,box-shadow] duration-200 flex flex-col overflow-hidden`}>
                {/* Background glow on hover — CSS only */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-300 pointer-events-none`} />

                {/* Tag */}
                {service.tag && (
                  <span className={`absolute top-4 right-4 text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r ${service.gradient} text-white shadow`}>
                    {service.tag}
                  </span>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-2xl mb-5 shadow-lg`}>
                  {service.emoji}
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock size={11} className="text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">{service.time}</span>
                </div>

                <h3 className={`font-outfit font-bold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${service.gradient} transition-colors duration-200`}>
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className={`mt-5 flex items-center gap-2 text-sm font-bold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${service.gradient} text-gray-600 dark:text-gray-400 transition-colors duration-200`}>
                  Book Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-150" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-2 bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-sm">
        {STATS.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="text-center p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
            <Icon size={20} className={`${color} mx-auto mb-3`} />
            <p className={`font-outfit text-2xl sm:text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Book CTA */}
      <div className="text-center mt-10">
        <Link
          href="/appointments"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 text-base"
        >
          🗓️ Book a Service Appointment
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-150" />
        </Link>
      </div>
    </div>
  );
}
