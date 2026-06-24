'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  ShoppingCart, Search, Menu, X, User,
  LogOut, Package, Calendar, Heart, Phone, Flame,
  Mail, ShieldAlert, ChevronDown, Sun, Moon,
  Bell, CheckCheck, Trash2, ShoppingBag
} from 'lucide-react';
import { RootState, AppDispatch } from '@/redux/store';
import { toggleMobileMenu, closeMobileMenu, toggleSearch, closeSearch, toggleTheme } from '@/redux/slices/uiSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';
import { getMyOrders } from '@/redux/slices/orderSlice';
import { getMyAppointments } from '@/redux/slices/appointmentSlice';
import { 
  syncNotifications, markAsRead, markAllAsRead, clearNotifications, addNotification 
} from '@/redux/slices/notificationSlice';

import NavLinks from './nav/NavLinks';
import MegaMenu from './nav/MegaMenu';
import SearchModal from './nav/SearchModal';
import MobileMenu from './nav/MobileMenu';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const router = useRouter();

  const { isSearchOpen, theme } = useSelector((s: RootState) => s.ui);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { cart } = useSelector((s: RootState) => s.cart);

  const [isScrolled, setIsScrolled] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isClientNotificationsOpen, setIsClientNotificationsOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

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
    router.push('/');
  };

  const isAdminRoute = pathname?.startsWith('/admin');

  const { notifications: allNotifications } = useSelector((s: RootState) => s.notification);
  const clientNotifications = allNotifications.filter(
    (n) => n.target === 'client' && n.userId === user?._id
  );
  const clientUnreadCount = clientNotifications.filter((n) => !n.isRead).length;

  // Fetch client orders and appointments for notifications
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      dispatch(getMyOrders({ page: 1 })).catch((e) => console.error(e));
      dispatch(getMyAppointments()).catch((e) => console.error(e));
    }
  }, [isAuthenticated, user, dispatch]);

  const clientOrders = useSelector((s: RootState) => s.order.myOrders);
  const clientAppointments = useSelector((s: RootState) => s.appointment.myAppointments);

  // Sync client notifications when orders or appointments load
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin') {
      dispatch(
        syncNotifications({
          orders: clientOrders,
          appointments: clientAppointments,
          products: [],
          userId: user._id,
          role: user.role,
        })
      );
    }
  }, [clientOrders, clientAppointments, isAuthenticated, user, dispatch]);

  // Click outside to close client notifications dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setIsClientNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Client notification simulation (every 60s)
  useEffect(() => {
    if (!isAuthenticated || !user || user.role === 'admin') return;

    const currentUser = user; // Capture user in a block-scoped constant to narrow type inside setInterval
    const orderStatuses = ['Shipped', 'Out for Delivery', 'Delivered'];
    const apptStatuses = ['Approved', 'Assigned to Technician Rahul', 'Completed'];
    const promoAlerts = [
      'Flash Sale: 15% off on all fire safety equipment! Use code SAFE15.',
      'Special Deal: Get a free safety inspection with AMC signups this week!',
      'Reminder: Keep your fire safety certificates updated. Book an audit today.',
    ];

    const interval = setInterval(() => {
      const randType = Math.random();

      if (randType < 0.35) {
        // Order Status simulated update
        const orderNum = Math.floor(100000 + Math.random() * 900000);
        const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

        dispatch(
          addNotification({
            type: 'order',
            title: 'Order Status Update',
            message: `Your Order #ORD-${orderNum} status has been updated to: ${status}`,
            link: '/dashboard/orders',
            target: 'client',
            userId: currentUser._id,
          })
        );

        toast.success(`[SG Fire] Order #ORD-${orderNum} has been ${status.toLowerCase()}!`, {
          icon: '📦',
          duration: 4000,
        });
      } else if (randType < 0.7) {
        // Appointment status simulated update
        const status = apptStatuses[Math.floor(Math.random() * apptStatuses.length)];

        dispatch(
          addNotification({
            type: 'appointment',
            title: 'Appointment Update',
            message: `Your appointment is now: ${status}`,
            link: '/dashboard/appointments',
            target: 'client',
            userId: currentUser._id,
          })
        );

        toast.success(`[SG Fire] Appointment Update: ${status}!`, {
          icon: '📅',
          duration: 4000,
        });
      } else {
        // Promo alert
        const promo = promoAlerts[Math.floor(Math.random() * promoAlerts.length)];

        dispatch(
          addNotification({
            type: 'promo',
            title: 'Special Safety Offer',
            message: promo,
            link: '/services',
            target: 'client',
            userId: currentUser._id,
          })
        );

        toast(`[SG Fire] ${promo}`, {
          icon: '🔥',
          duration: 5000,
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, dispatch]);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        className={
          isAdminRoute
            ? 'relative hidden lg:block bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 py-3.5 z-[60]'
            : `sticky top-0 z-[60] transition-all duration-500 ${
                isScrolled
                  ? 'bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/30 border-b border-red-900/30 py-2'
                  : 'bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 py-3.5'
              }`
        }
      >
        {/* Scroll Progress Bar */}
        {!isAdminRoute && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 origin-left z-[70]"
            style={{ scaleX }}
          />
        )}

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
              className="flex p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Search"
            >
              <Search size={19} />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleTheme())}
              className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={19} className="text-orange-400" /> : <Moon size={19} className="text-indigo-400" />}
            </motion.button>

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

            {/* Client Notifications Dropdown */}
            {isAuthenticated && user?.role !== 'admin' && (
              <div className="relative font-sans" ref={clientDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsClientNotificationsOpen(!isClientNotificationsOpen)}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all relative"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {clientUnreadCount > 0 && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1.5 right-1.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[9px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                      >
                        {clientUnreadCount}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isClientNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50 z-[999] overflow-hidden"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-red-950/50 to-gray-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">Notifications</span>
                          {clientUnreadCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-900/40 text-red-400 rounded-full">
                              {clientUnreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {clientUnreadCount > 0 && (
                            <button
                              onClick={() => dispatch(markAllAsRead({ userId: user?._id }))}
                              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                              title="Mark all as read"
                            >
                              <CheckCheck size={14} />
                              <span className="hidden sm:inline">Read all</span>
                            </button>
                          )}
                          {clientNotifications.length > 0 && (
                            <button
                              onClick={() => dispatch(clearNotifications({ userId: user?._id }))}
                              className="text-xs font-semibold text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                              title="Clear all"
                            >
                              <Trash2 size={14} />
                              <span className="hidden sm:inline">Clear</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-800 scrollbar-thin">
                        {clientNotifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-gray-800 text-gray-500 rounded-full flex items-center justify-center">
                              <Bell size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-300">All caught up!</p>
                              <p className="text-xs text-gray-500 mt-1">No notifications to display.</p>
                            </div>
                          </div>
                        ) : (
                          clientNotifications.map((n) => {
                            let Icon = ShoppingBag;
                            let iconColorBg = 'bg-blue-900/20 text-blue-400';
                            if (n.type === 'appointment') {
                              Icon = Calendar;
                              iconColorBg = 'bg-emerald-900/20 text-emerald-400';
                            } else if (n.type === 'promo') {
                              Icon = Flame;
                              iconColorBg = 'bg-orange-900/20 text-orange-400';
                            }

                            return (
                              <div
                                key={n.id}
                                onClick={() => {
                                  dispatch(markAsRead(n.id));
                                  setIsClientNotificationsOpen(false);
                                  router.push(n.link);
                                }}
                                className={cn(
                                  "p-4 flex gap-3 cursor-pointer transition-colors duration-150 relative text-left",
                                  n.isRead
                                    ? "bg-gray-900 hover:bg-gray-800/50"
                                    : "bg-red-950/10 hover:bg-red-950/20"
                                )}
                              >
                                {/* Left dot for unread */}
                                {!n.isRead && (
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                                )}

                                {/* Type Icon Container */}
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconColorBg)}>
                                  <Icon size={16} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-1">
                                    <p className={cn("text-xs leading-normal truncate", !n.isRead ? "font-bold text-white" : "font-medium text-gray-300")}>
                                      {n.title}
                                    </p>
                                    <span className="text-[10px] text-gray-500 whitespace-nowrap pt-0.5">
                                      {formatTimeAgo(n.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                                    {n.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

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
