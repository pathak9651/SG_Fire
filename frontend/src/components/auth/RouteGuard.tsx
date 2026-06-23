'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Spinner from '@/components/ui/Spinner';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/cart',
  '/checkout',
  '/appointments'
];

interface RouteGuardProps {
  children: ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state: RootState) => state.auth);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Synchronously check if a session hint exists on the client.
  // Default to true on the server so that the server renders the spinner for protected paths.
  let hasSessionHint = true;
  if (typeof window !== 'undefined') {
    hasSessionHint = localStorage.getItem('sgfire_logged_in') === 'true';
  }

  useEffect(() => {
    const hasSessionHintClient = localStorage.getItem('sgfire_logged_in') === 'true';
    if (isProtectedRoute && (!hasSessionHintClient || (isInitialized && !isLoading && !isAuthenticated))) {
      const currentPath = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      router.replace(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isInitialized, isLoading, isProtectedRoute, isAuthenticated, pathname, searchParams, router]);

  // If requesting a protected route:
  if (isProtectedRoute) {
    // 1. If we know for sure they are a guest (no localStorage session hint), render nothing immediately (no loader/"bandage")
    if (!hasSessionHint) {
      return null;
    }

    // 2. Otherwise, if they might have a session, show the spinner while the session status is initialized
    if (!isInitialized || isLoading) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-gray-950">
          <Spinner className="w-10 h-10 border-red-600" />
        </div>
      );
    }

    // 3. If they are not authenticated, render nothing while redirecting
    if (!isAuthenticated) {
      return null;
    }
  }

  return <>{children}</>;
}
