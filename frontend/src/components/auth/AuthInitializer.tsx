'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { fetchMe } from '@/redux/slices/authSlice';

/**
 * AuthInitializer Component
 * -------------------------
 * This component is responsible for restoring the user's session
 * when the application first loads or when the page is refreshed.
 * It dispatches the 'fetchMe' thunk which uses the HTTP-only refresh 
 * cookie to re-authenticate the user.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Attempt to restore session on mount (app load / refresh)
    dispatch(fetchMe());
  }, [dispatch]);

  return <>{children}</>;
}
