'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import DashboardSidebar from './DashboardSidebar';
import Spinner from '@/components/ui/Spinner';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.replace('/auth/login?returnUrl=/dashboard');
    }
  }, [isInitialized, isLoading, isAuthenticated, router]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Spinner className="w-10 h-10 border-red-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 pt-32 pb-20">
      <div className="container-main">
        {/* Header Section */}
        {(title || subtitle) && (
          <div className="mb-10">
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
