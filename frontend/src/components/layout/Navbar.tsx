'use client';

/**
 * ============================================================
 * FILE: src/components/layout/Navbar.tsx
 * PURPOSE: Enhanced Premium Sticky top navigation bar.
 *          Features:
 *          - Top Bar for contact/emergency info
 *          - Scroll Progress indicator
 *          - Integrated Mega Menu, Search Modal, and Mobile Menu
 *          - Premium Glassmorphism and animations
 * ============================================================
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, Moon, Sun, User,
  LogOut, Package, Calendar, Heart, Phone, Flame, 
  Mail, ShieldAlert
} from 'lucide-react';
import { RootState, AppDispatch } from '@/redux/store';
import { toggleDarkMode, toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch } from '@/redux/slices/uiSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';

// Sub-components
import NavLinks from './nav/NavLinks';
import MegaMenu from './nav/MegaMenu';
import SearchModal from './nav/SearchModal';
import MobileMenu from './nav/MobileMenu';

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  // Redux state
  const { isDarkMode, isSearchOpen } = useSelector((s: RootState) => s.ui);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { cart } = useSelector((s: RootState) => s.cart);

  // Local state
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dispatch(closeMobileMenu());
    dispatch(closeSearch());
  }, [pathname, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out successfully');
    setShowUserMenu(false);
  };

  return (
    <>
      {/* ── Top Bar ───────────────────────────────────────── */}
      <div className="hidden lg:block bg-gray-950 text-white py-2 text-xs font-medium">
        <div className="container-main flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <Phone size={14} className="text-red-500" /> +91 98765 43210
            </a>
            <a href="mailto:info@sgfire.com" className="flex items-center gap-2 hover:text-red-500 transition-colors">
              <Mail size={14} className="text-red-500" /> info@sgfire.com
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/services" className="flex items-center gap-2 text-red-500 font-bold animate-pulse">
              <ShieldAlert size={14} /> Emergency Support 24/7
            </Link>
            <Link href="/track-order" className="hover:text-red-500 transition-colors">Track Order</Link>
            <Link href="/about" className="hover:text-red-500 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ───────────────────────────────────── */}
      <header
        className={`sticky top-0 z-[60] transition-all duration-500 ${
          isScrolled
            ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-800/50 py-2'
            : 'bg-white dark:bg-gray-950 py-4'
        }`}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-red-600 origin-left z-[70]"
          style={{ scaleX }}
        />

        <div className="container-main flex items-center justify-between gap-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-fire-gradient rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20"
            >
              <Flame size={22} className="text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-xl leading-none dark:text-white tracking-tight">
                SG <span className="gradient-text">FIRE</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase leading-none mt-1">
                Safety First
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <NavLinks 
            onMouseEnterMega={() => setShowMegaMenu(true)} 
            onMouseLeaveMega={() => setShowMegaMenu(false)}
            showMegaMenu={showMegaMenu}
          />

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Search Trigger */}
            <button
              onClick={() => dispatch(toggleSearch())}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDarkMode ? 'dark' : 'light'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu / Login */}
            <div className="hidden sm:block h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-1" />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowUserMenu(true)}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pl-3 rounded-full border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all active:scale-95"
                >
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden md:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 bg-fire-gradient rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      onMouseLeave={() => setShowUserMenu(false)}
                      className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-3 z-[100] overflow-hidden"
                    >
                      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-[10px] font-medium text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <div className="p-2">
                        {user?.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 rounded-xl transition-all">
                            <ShieldAlert size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                          <User size={16} /> My Profile
                        </Link>
                        {user?.role !== 'admin' && (
                          <>
                            <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                              <Package size={16} /> Order History
                            </Link>
                            <Link href="/dashboard/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                              <Heart size={16} /> Wishlist
                            </Link>
                            <Link href="/dashboard/appointments" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all">
                              <Calendar size={16} /> My Appointments
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1 p-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-2 group">
                <div className="p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 sm:hidden">
                  <User size={20} />
                </div>
                <div className="btn-primary py-2 px-6 text-sm hidden sm:flex shadow-red-500/20">
                  Sign In
                </div>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2.5 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mega Menu Container (Desktop) */}
        <div 
          className="absolute left-0 right-0 top-full"
          onMouseEnter={() => setShowMegaMenu(true)}
          onMouseLeave={() => setShowMegaMenu(false)}
        >
          <MegaMenu isOpen={showMegaMenu} />
        </div>
      </header>

      {/* ── Overlays ─────────────────────────────────────── */}
      <SearchModal isOpen={isSearchOpen} onClose={() => dispatch(closeSearch())} />
      <MobileMenu />
    </>
  );
}
