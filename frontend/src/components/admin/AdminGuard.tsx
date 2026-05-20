'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Spinner from '@/components/ui/Spinner';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If initialized and not loading and not authenticated, or not an admin, redirect to login
    if (isInitialized && !isLoading) {
      if (!isAuthenticated || !user || user.role !== 'admin') {
        router.replace('/auth/login?returnUrl=/admin');
      }
    }
  }, [isInitialized, isLoading, isAuthenticated, user, router]);

  // Show loading spinner while checking auth or during initialization
  if (!isInitialized || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center">
          <Spinner className="w-10 h-10 border-red-600 mb-4 mx-auto" />
          <p className="text-sm font-bold text-gray-500 animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // If authenticated and is admin, render content
  if (isAuthenticated && user && user.role === 'admin') {
    return <>{children}</>;
  }

  // Fallback (will handle redirect via useEffect)
  return null;
}
