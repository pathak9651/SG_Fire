'use client';

import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import DashboardSidebar from './DashboardSidebar';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-20">
      <div className="container-main">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="mb-6 sm:mb-10">
            {title && (
              <h1 className="text-3xl md:text-4xl font-outfit font-black dark:text-white mb-2">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Content Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
