'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Phone, Mail, Camera, Send, MessageCircle, 
  ChevronRight, LogOut, User, Flame, Search 
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { closeMobileMenu, toggleSearch } from '@/redux/slices/uiSlice';
import { logoutUser } from '@/redux/slices/authSlice';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function MobileMenu() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { isMobileMenuOpen } = useSelector((s: RootState) => s.ui);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);

  const containerVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { 
        type: 'spring' as const, 
        damping: 25, 
        stiffness: 200,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: { 
      x: '100%',
      transition: { type: 'spring' as const, damping: 25, stiffness: 200 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser() as any);
    toast.success('Logged out successfully');
    dispatch(closeMobileMenu());
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(closeMobileMenu())}
            className="fixed inset-0 z-[100] bg-gray-950/40 backdrop-blur-sm lg:hidden"
          />

          {/* Menu Panel */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-0 right-0 bottom-0 z-[110] w-full max-w-sm bg-white dark:bg-gray-950 shadow-2xl lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
              <Link href="/" onClick={() => dispatch(closeMobileMenu())} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-fire-gradient rounded-lg flex items-center justify-center">
                  <Flame size={18} className="text-white" />
                </div>
                <span className="font-outfit font-bold text-lg dark:text-white">
                  SG <span className="gradient-text">Fire</span>
                </span>
              </Link>
              <button 
                onClick={() => dispatch(closeMobileMenu())}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Profile Info */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-fire-gradient rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/auth/login" 
                  onClick={() => dispatch(closeMobileMenu())}
                  className="btn-primary w-full py-3"
                >
                  Sign In / Register
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-2">
                {NAV_LINKS.map((link) => (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => dispatch(closeMobileMenu())}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-all",
                        pathname === link.href
                          ? "bg-red-50 dark:bg-red-950/20 text-red-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {link.label}
                      <ChevronRight size={18} className={cn(pathname === link.href ? "opacity-100" : "opacity-0")} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <motion.div variants={itemVariants} className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      dispatch(closeMobileMenu());
                      dispatch(toggleSearch());
                    }}
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium p-2"
                  >
                    <Search size={20} /> Search Products
                  </button>
                  <Link href="/dashboard" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium p-2">
                    <User size={20} /> My Profile
                  </Link>
                  {/* Theme removed; always using light theme */}
                  {isAuthenticated && (
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-red-600 font-medium p-2"
                    >
                      <LogOut size={20} /> Sign Out
                    </button>
                  )}
                </motion.div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-8 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex flex-col gap-4">
                <a href="tel:+919876543210" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={16} className="text-red-600" /> +91 98765 43210
                </a>
                <a href="mailto:support@sgfire.com" className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={16} className="text-red-600" /> support@sgfire.com
                </a>
                <div className="flex gap-4 mt-2">
                  <MessageCircle size={20} className="text-gray-400 hover:text-blue-600 transition-colors" />
                  <Send size={20} className="text-gray-400 hover:text-sky-500 transition-colors" />
                  <Camera size={20} className="text-gray-400 hover:text-pink-600 transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
