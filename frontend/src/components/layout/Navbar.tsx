'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, User,
  LogOut, Package, Calendar, Heart, Phone, Flame,
  Mail, ShieldAlert, ChevronDown
} from 'lucide-react';
import { RootState, AppDispatch } from '@/redux/store';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch } from '@/redux/slices/uiSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';

import NavLinks from './nav/NavLinks';
import MegaMenu from './nav/MegaMenu';
import SearchModal from './nav/SearchModal';
import MobileMenu from './nav/MobileMenu';

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const { isSearchOpen } = useSelector((s: RootState) => s.ui);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { cart } = useSelector((s: RootState) => s.cart);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const cartCount = cart?.validItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

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
      {/* ── Top Announcement Bar ───────────────────────────── */}
      <div className="hidden lg:block bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white py-2 text-xs font-medium">
        <div className="container-main flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+919876543210" className="flex items-center gap-2 !text-white hover:!text-yellow-200 transition-colors">
              <Phone size={13} className="text-yellow-300" /> +91 98765 43210
            </a>
            <a href="mailto:info@sgfire.com" className="flex items-center gap-2 !text-white hover:!text-yellow-200 transition-colors">
              <Mail size={13} className="text-yellow-300" /> info@sgfire.com
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-yellow-200 font-bold">
              <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              Emergency Support 24/7
            </span>
            <Link href="/track-order" className="!text-white hover:!text-yellow-200 transition-colors">Track Order</Link>
            <Link href="/about" className="!text-white hover:!text-yellow-200 transition-colors">Help Center</Link>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-[60] transition-all duration-500 ${
          isScrolled
            ? 'bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-red-900/30 py-2'
            : 'bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 py-3.5'
        }`}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 origin-left z-[70]"
          style={{ scaleX }}
        />

        {/* Subtle top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

        <div className="container-main flex items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/40 group-hover:shadow-red-500/60 transition-shadow"
            >
              <Flame size={22} className="text-white drop-shadow" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-outfit font-black text-lg sm:text-xl leading-none text-white tracking-tight">
                SG <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">FIRE</span>
              </span>
              <span className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase leading-none mt-0.5 hidden sm:block">
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
          <div className="flex items-center gap-1">

            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleSearch())}
              className="hidden sm:flex p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Search"
            >
              <Search size={19} />
            </motion.button>

            {/* Theme removed; always using light theme */}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <ShoppingCart size={19} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[9px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <div className="hidden sm:block h-6 w-[1px] bg-gray-700 mx-1" />

            {/* User Menu / Login */}
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onMouseEnter={() => setShowUserMenu(true)}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl border border-gray-700 hover:border-red-500/50 hover:bg-white/5 transition-all"
                >
                  <span className="text-xs font-semibold !text-gray-100 hidden md:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setShowUserMenu(false)}
                      className="absolute right-0 top-full mt-2 w-64 bg-gray-900 rounded-2xl shadow-2xl shadow-black/50 border border-gray-700/50 py-2 z-[100] overflow-hidden"
                    >
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-red-950/50 to-gray-900">
                        <p className="font-bold text-sm text-white">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{user?.email}</p>
                      </div>

                      <div className="p-1.5">
                        {user?.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium !text-gray-100 hover:bg-red-600 hover:!text-white rounded-xl transition-all">
                            <ShieldAlert size={15} /> Admin Dashboard
                          </Link>
                        )}
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium !text-gray-100 hover:bg-white/10 hover:!text-white rounded-xl transition-all">
                          <User size={15} /> My Profile
                        </Link>
                        {user?.role !== 'admin' && (
                          <>
                            <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium !text-gray-100 hover:bg-white/10 hover:!text-white rounded-xl transition-all">
                              <Package size={15} /> Order History
                            </Link>
                            <Link href="/dashboard/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium !text-gray-100 hover:bg-white/10 hover:!text-white rounded-xl transition-all">
                              <Heart size={15} /> Wishlist
                            </Link>
                            <Link href="/dashboard/appointments" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium !text-gray-100 hover:bg-white/10 hover:!text-white rounded-xl transition-all">
                              <Calendar size={15} /> My Appointments
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-gray-700/50 p-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-2 group">
                <div className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all sm:hidden">
                  <User size={19} />
                </div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="hidden sm:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
                >
                  Sign In
                </motion.div>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-1"
            >
              <Menu size={22} />
            </motion.button>
          </div>
        </div>

        {/* Mega Menu */}
        <div
          className="absolute left-0 right-0 top-full"
          onMouseEnter={() => setShowMegaMenu(true)}
          onMouseLeave={() => setShowMegaMenu(false)}
        >
          <MegaMenu isOpen={showMegaMenu} />
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => dispatch(closeSearch())} />
      <MobileMenu />
    </>
  );
}
