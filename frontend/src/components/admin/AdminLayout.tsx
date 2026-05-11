'use client';

import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import { motion } from 'framer-motion';
import { User, Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Dashboard' }: AdminLayoutProps) {
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold dark:text-white font-outfit">{title}</h1>
            <p className="text-xs text-gray-500">Welcome back, Admin</p>
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

            {/* Notifications */}
            <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-gray-900" />
            </button>

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
          className="p-8 flex-1"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
