'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setTheme } from '@/redux/slices/uiSlice';

export default function ThemeInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const [mounted, setMounted] = useState(false);

  // Sync state with DOM on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    dispatch(setTheme(isDark ? 'dark' : 'light'));
    setMounted(true);
  }, [dispatch]);

  // Write changes to localStorage and classList when state changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, mounted]);

  return <>{children}</>;
}
