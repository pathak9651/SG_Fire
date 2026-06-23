'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Search, Menu, Check, CheckCheck, Trash2, 
  AlertTriangle, Calendar, ShoppingBag 
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  markAsRead, markAllAsRead, clearNotifications, syncNotifications, addNotification 
} from '@/redux/slices/notificationSlice';
import { getAllAdminOrders } from '@/redux/slices/orderSlice';
import { getAllAdminAppointments } from '@/redux/slices/appointmentSlice';
import { getAdminProducts } from '@/redux/slices/productSlice';
import toast from 'react-hot-toast';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redux Selectors
  const { notifications: allNotifications } = useSelector((s: RootState) => s.notification);
  const { orders } = useSelector((s: RootState) => s.order);
  const { appointments } = useSelector((s: RootState) => s.appointment);
  const { products } = useSelector((s: RootState) => s.product);

  const notifications = allNotifications.filter((n) => n.target === 'admin');
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 1. Initial Sync on mount and fetch data
  useEffect(() => {
    dispatch(getAllAdminOrders({ page: 1, status: '' })).catch((err) => console.error(err));
    dispatch(getAllAdminAppointments({ page: 1, status: '' })).catch((err) => console.error(err));
    dispatch(getAdminProducts()).catch((err) => console.error(err));
  }, [dispatch]);

  // Sync notifications when data changes
  useEffect(() => {
    if (orders.length > 0 || appointments.length > 0 || products.length > 0) {
      dispatch(syncNotifications({ orders, appointments, products, role: 'admin' }));
    }
  }, [orders, appointments, products, dispatch]);

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

  // 2. Real-time live simulated events
  useEffect(() => {
    const names = ['Amit Sharma', 'Vikram Malhotra', 'Rajesh K.', 'Sneha Patel', 'Preeti Rao', 'Rahul Gupta'];
    const services = ['Inspection', 'Installation', 'Maintenance', 'AMC', 'Emergency'];
    const productsList = [
      'ABC Dry Powder Extinguisher 4kg',
      'Wireless Smoke Detector Hub',
      'Co2 Gas Discharge Nozzle',
      'Fire Sprinkler Brass 1/2"',
      'Fire Hydrant Valve double-headed',
    ];

    const interval = setInterval(() => {
      // Pick a random notification type
      const randType = Math.random();
      
      if (randType < 0.35) {
        // Mock Order
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const customer = names[Math.floor(Math.random() * names.length)];
        const amount = Math.floor(1500 + Math.random() * 8500);

        dispatch(addNotification({
          type: 'order',
          title: 'Simulated Order Alert',
          message: `New order ${orderId} placed by ${customer} (₹${amount})`,
          link: '/admin/orders',
          target: 'admin'
        }));

        toast.success(`[Admin] New Order ${orderId} by ${customer}!`, {
          icon: '🛍️',
          duration: 4000,
        });

      } else if (randType < 0.7) {
        // Mock Appointment
        const customer = names[Math.floor(Math.random() * names.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        
        dispatch(addNotification({
          type: 'appointment',
          title: 'Simulated Booking Alert',
          message: `New ${service} booking received from ${customer}.`,
          link: '/admin/appointments',
          target: 'admin'
        }));

        toast.success(`[Admin] New Booking: ${service} by ${customer}!`, {
          icon: '📅',
          duration: 4000,
        });

      } else {
        // Mock Stock Alert
        const product = productsList[Math.floor(Math.random() * productsList.length)];
        
        dispatch(addNotification({
          type: 'stock',
          title: 'Simulated Stock Alert',
          message: `Product "${product}" is running out of stock!`,
          link: '/admin/products',
          target: 'admin'
        }));

        toast.error(`[Admin] Stock Alert: "${product}" is out of stock!`, {
          icon: '⚠️',
          duration: 4500,
        });
      }
    }, 45000); // Trigger simulation every 45s

    return () => clearInterval(interval);
  }, [dispatch]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 md:px-8 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 lg:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold dark:text-white font-outfit">{title}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Welcome back, Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full border border-transparent focus-within:border-red-500/50 transition-all">
              <Search size={16} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent text-sm border-none outline-none text-gray-700 dark:text-gray-300 w-48"
              />
            </div>

            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 relative transition-all"
                aria-label="Toggle notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-600 text-[10px] font-black text-white w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-[999] overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => dispatch(markAllAsRead({ role: 'admin' }))}
                            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 transition-colors"
                            title="Mark all as read"
                          >
                            <CheckCheck size={14} />
                            <span className="hidden sm:inline">Read all</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => dispatch(clearNotifications({ role: 'admin' }))}
                            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                            title="Clear all"
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
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center">
                            <Bell size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-1">No new notifications to display.</p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((n) => {
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
                              key={n.id}
                              onClick={() => {
                                dispatch(markAsRead(n.id));
                                setIsNotificationsOpen(false);
                                router.push(n.link);
                              }}
                              className={cn(
                                "p-4 flex gap-3 cursor-pointer transition-colors duration-150 relative text-left",
                                n.isRead 
                                  ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50" 
                                  : "bg-red-50/30 hover:bg-red-50/60 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                              )}
                            >
                              {/* Left dot for unread */}
                              {!n.isRead && (
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-600 rounded-full" />
                              )}
                              
                              {/* Type Icon Container */}
                              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", iconColorBg)}>
                                <Icon size={16} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <p className={cn("text-xs leading-normal truncate", !n.isRead ? "font-bold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300")}>
                                    {n.title}
                                  </p>
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap pt-0.5">
                                    {formatTimeAgo(n.createdAt)}
                                  </span>
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
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 md:p-8 flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
