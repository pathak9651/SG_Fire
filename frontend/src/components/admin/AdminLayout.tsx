'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, LayoutDashboard, Package, ShoppingBag, Calendar, Users, 
  Settings, LogOut, Bell, Menu, X, ShieldAlert, CheckCircle2, 
  ChevronRight, AlertTriangle, CheckCheck, Trash2, Tag, HelpCircle, XCircle
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '@/redux/slices/notificationSlice';
import { getAllAdminOrders } from '@/redux/slices/orderSlice';
import { getAllAdminAppointments } from '@/redux/slices/appointmentSlice';
import { getAdminProducts } from '@/redux/slices/productSlice';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redux Selectors
  const { user } = useSelector((s: RootState) => s.auth);
  const { notifications: allNotifications } = useSelector((s: RootState) => s.notification);

  const notifications = allNotifications.filter((n) => n.target === 'admin' || !n.target);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Initial Fetch on mount
  useEffect(() => {
    dispatch(fetchNotifications()).catch((err) => console.error(err));
    dispatch(getAllAdminOrders({ page: 1, status: '' })).catch((err) => console.error(err));
    dispatch(getAllAdminAppointments({ page: 1, status: '' })).catch((err) => console.error(err));
    dispatch(getAdminProducts()).catch((err) => console.error(err));
  }, [dispatch]);

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Categories', href: '/admin/categories', icon: Tag },
    { name: 'Coupons', href: '/admin/coupons', icon: Flame },
    { name: 'Support Tickets', href: '/admin/support', icon: HelpCircle },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-fire-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <Flame size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-wider">SG FIRE</span>
              <span className="block text-[10px] text-red-400 font-bold uppercase tracking-widest">Admin Control</span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                  isActive
                    ? "bg-fire-gradient text-white shadow-lg shadow-red-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                )}
              >
                <Icon size={18} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-red-400")} />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-70" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800/60 transition-colors duration-150"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-xl border border-gray-200 dark:border-gray-800"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              {title || navItems.find((i) => i.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                aria-label="Toggle notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[999] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">Admin Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => dispatch(markAllNotificationsAsRead())}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 transition-colors"
                            title="Mark all as read"
                          >
                            <CheckCheck size={14} />
                            <span className="hidden sm:inline">Read all</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => dispatch(clearAllNotifications())}
                            className="text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                            title="Clear all from database"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Clear</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center">
                            <Bell size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-1">No notifications to display.</p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const targetId = n._id || n.id || '';
                          let Icon = ShoppingBag;
                          let iconColorBg = 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400';
                          if (n.type === 'appointment') {
                            Icon = Calendar;
                            iconColorBg = 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400';
                          } else if (n.type === 'stock') {
                            Icon = AlertTriangle;
                            iconColorBg = 'bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400';
                          }

                          return (
                            <div 
                              key={targetId}
                              onClick={() => {
                                dispatch(markNotificationAsRead(targetId));
                                setIsNotificationsOpen(false);
                                if (n.link) router.push(n.link);
                              }}
                              className={cn(
                                "p-4 flex gap-3 cursor-pointer transition-colors duration-150 relative text-left group",
                                n.isRead 
                                  ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50" 
                                  : "bg-red-50/30 hover:bg-red-50/60 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                              )}
                            >
                              {!n.isRead && (
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                              )}
                              
                              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconColorBg)}>
                                <Icon size={16} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <p className={cn("text-xs leading-normal truncate", !n.isRead ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300")}>
                                    {n.title}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                      {formatTimeAgo(n.createdAt)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(deleteNotification(targetId));
                                      }}
                                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                      title="Delete notification"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
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

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold dark:text-white">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-10 h-10 bg-fire-gradient rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 lg:p-8 overflow-y-auto"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
