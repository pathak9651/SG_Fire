'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Since RouteGuard handles login redirect, we only check for admin role here.
    // If user is logged in but not an admin, redirect them to the home page.
    if (user && user.role !== 'admin') {
      router.replace('/');
    }
  }, [user, router]);

  // If user is admin, render children
  if (user && user.role === 'admin') {
    return <>{children}</>;
  }

  // Otherwise, render nothing while redirecting
  return null;
}
