'use client';

/**
 * ============================================================
 * FILE: src/components/layout/Footer.tsx
 * PURPOSE: Global site footer for SG Fire.
 *          Includes:
 *          - Brand logo + description
 *          - Navigation link groups (Products, Services, Company, Legal)
 *          - Contact information (phone, email, address)
 *          - Social media links
 *          - Certification badges
 *          - Newsletter subscription form
 *          - Copyright notice
 *
 * USED ON: All pages (mounted in Providers.tsx → layout.tsx)
 * ============================================================
 */

import Link from 'next/link';
import { Flame, Phone, Mail, MapPin, Globe, Share2, MessageCircle, Video, Users } from 'lucide-react';

// Footer navigation structure
const FOOTER_LINKS = {
  products: {
    title: 'Products',
    links: [
      { label: 'Fire Extinguishers', href: '/products?category=fire-extinguishers' },
      { label: 'Smoke Detectors', href: '/products?category=smoke-detectors' },
      { label: 'Fire Alarms', href: '/products?category=fire-alarms' },
      { label: 'Safety Helmets', href: '/products?category=safety-helmets' },
      { label: 'Fire Sprinklers', href: '/products?category=fire-sprinklers' },
      { label: 'View All Products', href: '/products' },
    ],
  },
  services: {
    title: 'Services',
    links: [
      { label: 'Installation Service', href: '/appointments?type=installation' },
      { label: 'Annual Inspection', href: '/appointments?type=inspection' },
      { label: 'Maintenance & AMC', href: '/appointments?type=amc' },
      { label: 'Emergency Service', href: '/appointments?type=emergency' },
      { label: 'Consultation', href: '/appointments?type=consultation' },
      { label: 'Book Appointment', href: '/appointments' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/about#team' },
      { label: 'Certifications', href: '/about#certifications' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  account: {
    title: 'My Account',
    links: [
      { label: 'My Orders', href: '/dashboard/orders' },
      { label: 'My Appointments', href: '/dashboard/appointments' },
      { label: 'Wishlist', href: '/dashboard/wishlist' },
      { label: 'Profile Settings', href: '/dashboard/profile' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">

      {/* ── Main Footer Content ─────────────────────────── */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-fire-gradient rounded-xl flex items-center justify-center">
                <Flame size={22} className="text-white" />
              </div>
              <span className="font-outfit font-bold text-2xl text-white">
                SG <span className="text-red-500">Fire</span>
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              India's trusted fire safety equipment supplier and service provider.
              Protecting lives and property with certified products and expert services since 2010.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition-colors">
                <Phone size={16} className="text-red-500 flex-shrink-0" />
                +91-9876543210 (24/7 Emergency)
              </a>
              <a href="mailto:contact@sgfire.com" className="flex items-center gap-3 text-sm text-gray-400 hover:text-red-400 transition-colors">
                <Mail size={16} className="text-red-500 flex-shrink-0" />
                contact@sgfire.com
              </a>
              <div className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>123 Fire Safety Building,<br />Mumbai, Maharashtra 400001, India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {[
                { Icon: Globe, href: '#', label: 'Facebook' },
                { Icon: MessageCircle, href: '#', label: 'Instagram' },
                { Icon: Share2, href: '#', label: 'Twitter' },
                { Icon: Video, href: '#', label: 'YouTube' },
                { Icon: Users, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Link Groups */}
          {Object.values(FOOTER_LINKS).map((group) => (
            <div key={group.title}>
              <h4 className="font-outfit font-semibold text-white text-sm uppercase tracking-wider mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-red-400 transition-colors hover:pl-1 duration-200 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Certifications ──────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 text-center">
            Trusted & Certified
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['ISI Certified', 'CE Marked', 'BIS Approved', 'ISO 9001:2015', 'NABL Accredited'].map((cert) => (
              <div
                key={cert}
                className="px-4 py-2 bg-gray-800 rounded-lg text-xs text-gray-300 font-medium border border-gray-700"
              >
                ✓ {cert}
              </div>
            ))}
          </div>
        </div>

        {/* ── Payment Methods ─────────────────────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs text-gray-500">Secure Payments:</span>
          {['💳 Razorpay', '💳 Stripe', '📱 UPI', '🏦 Net Banking', '💵 COD'].map((method) => (
            <span key={method} className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
              {method}
            </span>
          ))}
        </div>

        {/* ── Copyright ───────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SG Fire. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
