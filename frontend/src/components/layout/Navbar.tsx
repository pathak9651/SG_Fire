'use client';

/**
 * ============================================================
 * FILE: src/components/layout/Navbar.tsx
 * PURPOSE: Sticky top navigation bar for the entire SG Fire site.
 *          Features:
 *          - SG Fire logo with brand identity
 *          - Category mega menu (desktop)
 *          - Real-time search bar
 *          - Cart icon with item count badge
 *          - Auth buttons (Login / User profile dropdown)
 *          - Dark mode toggle
 *          - Fully responsive (hamburger on mobile)
 *          - Scrolled state: adds shadow and slight transparency
 *
 * USED ON: All pages (mounted in Providers.tsx → layout.tsx)
 * ============================================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, Moon, Sun, User,
  LogOut, Package, Calendar, Heart, ChevronDown, Phone, Flame
} from 'lucide-react';
import { RootState, AppDispatch } from '@/redux/store';
import { toggleDarkMode, toggleMobileMenu, closeMobileMenu, toggleSearch } from '@/redux/slices/uiSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';

// Navigation links for the main nav bar
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products', hasMega: true },
  { label: 'Categories', href: '/categories' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Product categories for mega menu
const MEGA_CATEGORIES = [
  { label: 'Fire Extinguishers', href: '/products?category=fire-extinguishers', icon: '🧯' },
  { label: 'Smoke Detectors', href: '/products?category=smoke-detectors', icon: '🔔' },
  { label: 'Fire Alarms', href: '/products?category=fire-alarms', icon: '🚨' },
  { label: 'Safety Helmets', href: '/products?category=safety-helmets', icon: '⛑️' },
  { label: 'Fire Sprinklers', href: '/products?category=fire-sprinklers', icon: '💧' },
  { label: 'Emergency Exit', href: '/products?category=emergency-exit', icon: '🚪' },
  { label: 'Safety Gloves', href: '/products?category=safety-gloves', icon: '🧤' },
  { label: 'CCTV & Security', href: '/products?category=cctv-security', icon: '📹' },
  { label: 'Industrial Kits', href: '/products?category=industrial-kits', icon: '🏭' },
];

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  // Get state from Redux
  const { isDarkMode, isMobileMenuOpen } = useSelector((s: RootState) => s.ui);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { cart } = useSelector((s: RootState) => s.cart);

  // Local state for scroll and dropdown
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Cart item count (sum of all item quantities)
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // ── Scroll Listener ──────────────────────────────────────
  // Adds shadow and backdrop blur after 20px scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Close mobile menu on route change ───────────────────
  useEffect(() => {
    dispatch(closeMobileMenu());
  }, [pathname, dispatch]);

  // ── Logout Handler ───────────────────────────────────────
  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    setShowUserMenu(false);
  };

  return (
    <>
      {/* ── Main Navbar ───────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-md border-b border-gray-100 dark:border-gray-800'
            : 'bg-white dark:bg-gray-950'
        }`}
      >
        <div className="container-main flex items-center justify-between h-16 gap-4">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-fire-gradient rounded-lg flex items-center justify-center">
              <Flame size={20} className="text-white" />
            </div>
            <span className="font-outfit font-bold text-xl text-gray-900 dark:text-white">
              SG <span className="gradient-text">Fire</span>
            </span>
          </Link>

          {/* ── Desktop Navigation ───────────────────────── */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.hasMega && setShowMegaMenu(true)}
                onMouseLeave={() => link.hasMega && setShowMegaMenu(false)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-red-600 bg-red-50 dark:bg-red-950/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  {link.label}
                  {link.hasMega && <ChevronDown size={14} className={`transition-transform ${showMegaMenu ? 'rotate-180' : ''}`} />}
                </Link>

                {/* Mega Menu Dropdown */}
                {link.hasMega && (
                  <AnimatePresence>
                    {showMegaMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-1 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 grid grid-cols-1 gap-1"
                      >
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
                          Browse Categories
                        </p>
                        {MEGA_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.href}
                            href={cat.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
                          >
                            <span>{cat.icon}</span>
                            {cat.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                          <Link href="/products" className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 hover:underline">
                            View All Products →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* ── Right Side Actions ───────────────────────── */}
          <div className="flex items-center gap-1">

            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist — visible when logged in */}
            {isAuthenticated && (
              <Link
                href="/dashboard/wishlist"
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
            )}

            {/* Cart Button with Count Badge */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={`Cart (${cartCount} items)`}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-fire-gradient rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors">
                          <span>🛡️</span> Admin Dashboard
                        </Link>
                      )}
                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <User size={16} /> My Profile
                      </Link>
                      <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Package size={16} /> My Orders
                      </Link>
                      <Link href="/dashboard/appointments" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Calendar size={16} /> Appointments
                      </Link>
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm py-2 px-4 hidden sm:flex">
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Search Bar (expandable) ─────────────────────── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="container-main py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/products?keyword=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fire extinguishers, smoke detectors, alarms..."
                    className="w-full pl-10 pr-12 py-3 form-input text-sm"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-1.5 px-4 text-xs">
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Menu ─────────────────────────────────── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden"
            >
              <nav className="container-main py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <Link href="/auth/login" className="btn-primary mt-4 text-center">
                    Sign In / Register
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
