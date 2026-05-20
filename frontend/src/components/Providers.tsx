'use client';

/**
 * ============================================================
 * FILE: src/components/Providers.tsx
 * PURPOSE: Client-side global provider wrapper component.
 *          Bundles all React context providers in one place
 *          to keep layout.tsx clean and avoid deeply nested JSX.
 *
 * PROVIDERS INCLUDED:
 *  1. Redux Provider    — Makes Redux store available to all components
 *  2. QueryClientProvider — React Query (TanStack) for server state
 *  3. Toaster           — React Hot Toast notification system
 *
 * WHY SEPARATE FROM layout.tsx?
 * layout.tsx is a Server Component (better performance, SEO).
 * Providers need 'use client' (they use React context/hooks).
 * Separation maintains the Server Component boundary.
 * ============================================================
 */

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from '@/redux/store';
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthInitializer from '@/components/auth/AuthInitializer';
import FloatingChatbot from '@/components/chat/FloatingChatbot';

/**
 * Create a stable QueryClient instance.
 * Using useState so it's not recreated on every render.
 * Default options:
 *  - staleTime: 1 min (data is considered fresh for 1 minute)
 *  - retry: 1 (retry failed queries once before showing error)
 */
const queryClientDefaults = {
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,     // 1 minute cache
      retry: 1,                  // Retry failed fetches once
      refetchOnWindowFocus: false, // Don't refetch on tab switch (better UX)
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures QueryClient is created once per session
  const [queryClient] = useState(() => new QueryClient(queryClientDefaults));

  return (
    <Provider store={store}>
      {/* React Query provider for data fetching and caching */}
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          {/* Global navigation bar */}
          <Navbar />

          {/* Main page content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Global footer */}
          <Footer />

          {/* Global Floating AI Safety Chatbot */}
          <FloatingChatbot />
        </AuthInitializer>

        {/* 
          Toast notification container.
          position: top-right is conventional for e-commerce apps.
          Custom styling matches SG Fire's fire-red brand color.
        */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '8px',
              border: '1px solid #dc2626',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}
