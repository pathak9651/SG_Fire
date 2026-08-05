'use client';

import Link from 'next/link';
import { 
  Flame, Phone, Mail, MapPin, Globe, Share2, MessageCircle, 
  Video, Users, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';

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
    <footer className="relative bg-slate-950 text-slate-300 dark:bg-gray-950 dark:text-gray-300 border-t border-slate-900 dark:border-gray-900 font-sans pt-12 pb-10">
      
      <div className="container-main">

        {/* ── 2. Navigation & Brand Columns ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12 pb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-fire-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <Flame size={22} className="animate-pulse" />
              </div>
              <span className="font-outfit font-extrabold text-2xl text-white tracking-wide">
                SG <span className="text-red-500">Fire</span>
              </span>
            </Link>

            <p className="text-slate-400 dark:text-gray-400 text-sm leading-relaxed max-w-sm font-normal">
              India's trusted fire safety equipment supplier and certified service provider.
              Protecting lives and property with certified equipment and expert safety solutions since 2010.
            </p>

            {/* Direct Contact Info */}
            <div className="space-y-3 pt-1">
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-3 text-sm text-slate-400 dark:text-gray-400 hover:text-red-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-gray-900 border border-slate-800 dark:border-gray-800 flex items-center justify-center flex-shrink-0 group-hover:border-red-500/50">
                  <Phone size={15} className="text-red-500" />
                </div>
                <span className="font-medium">+91-9876543210 (24/7 Helpline)</span>
              </a>

              <a 
                href="mailto:contact@sgfire.com" 
                className="flex items-center gap-3 text-sm text-slate-400 dark:text-gray-400 hover:text-red-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-gray-900 border border-slate-800 dark:border-gray-800 flex items-center justify-center flex-shrink-0 group-hover:border-red-500/50">
                  <Mail size={15} className="text-red-500" />
                </div>
                <span className="font-medium">contact@sgfire.com</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-slate-400 dark:text-gray-400">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-gray-900 border border-slate-800 dark:border-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={15} className="text-red-500" />
                </div>
                <span className="font-normal leading-relaxed">123 Fire Safety Building,<br />Mumbai, Maharashtra 400001, India</span>
              </div>
            </div>

            {/* Social Channels */}
            <div className="flex gap-2.5 pt-2">
              {[
                { Icon: Globe, href: '#', label: 'Website' },
                { Icon: MessageCircle, href: '#', label: 'Instagram' },
                { Icon: Share2, href: '#', label: 'Twitter' },
                { Icon: Video, href: '#', label: 'YouTube' },
                { Icon: Users, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-slate-900 dark:bg-gray-900 border border-slate-800 dark:border-gray-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-fire-gradient hover:border-red-500 transition-all duration-200 shadow-xs"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          {Object.values(FOOTER_LINKS).map((group) => (
            <div key={group.title}>
              <h4 className="font-outfit font-extrabold text-white text-xs uppercase tracking-widest mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 dark:text-gray-400 hover:text-red-400 transition-all hover:translate-x-1 duration-200 inline-block font-normal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── 3. Unified Bottom Bar ───────────────────────────────── */}
        <div className="pt-8 border-t border-slate-900 dark:border-gray-900 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-gray-400">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Certified Fire Equipment & Authorised Inspection Services</span>
            </div>

            {/* Payment Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-gray-500 mr-1 flex items-center gap-1">
                <CreditCard size={14} /> Accepted Payments:
              </span>
              {['Razorpay', 'Stripe', 'UPI', 'Net Banking', 'COD'].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 bg-slate-900 dark:bg-gray-900 rounded-xl text-xs font-medium text-slate-300 dark:text-gray-300 border border-slate-800 dark:border-gray-800 shadow-xs"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-gray-500 font-normal">
            <p>© {new Date().getFullYear()} SG Fire. All rights reserved. Built for Fire Safety Excellence.</p>
            <div className="flex gap-6 font-medium text-slate-400 dark:text-gray-400">
              <Link href="/privacy-policy" className="hover:text-red-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-red-400 transition-colors">Terms of Service</Link>
              <Link href="/sitemap.xml" className="hover:text-red-400 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
