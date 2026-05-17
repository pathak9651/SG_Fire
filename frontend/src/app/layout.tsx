/**
 * ============================================================
 * FILE: src/app/layout.tsx
 * PURPOSE: Root layout for the entire Next.js application.
 *          Wraps ALL pages with:
 *          - Redux Provider (global state access)
 *          - React Hot Toast (global toast notifications)
 *          - Google Fonts (Inter + Outfit)
 *          - SEO metadata defaults
 *          - Dark mode class handling
 *          - Navbar and Footer
 *
 * This is a SERVER COMPONENT by default in Next.js App Router.
 * The Providers client component wraps client-only providers.
 * ============================================================
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

// ── Google Fonts Configuration ─────────────────────────────
// Inter: body text (optimized for readability at all sizes)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',   // CSS variable for use in Tailwind config
  display: 'swap',            // swap: show fallback font until custom font loads
});

// Outfit: headings and display text (modern, premium feel)
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

// ── Default SEO Metadata ───────────────────────────────────
// These are defaults; individual pages override them with their own metadata.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'),
  title: {
    default: 'SG Fire — Premium Fire Safety Equipment & Services',
    template: '%s | SG Fire',  // Individual pages use: '%s' = their own title
  },
  description:
    'Shop premium fire safety equipment online. Browse fire extinguishers, smoke detectors, alarms, and more. Book professional installation and inspection services.',
  keywords: [
    'fire safety equipment',
    'fire extinguisher',
    'smoke detector',
    'fire alarm',
    'fire safety services',
    'fire safety installation',
    'SG Fire',
  ],
  authors: [{ name: 'SG Fire' }],
  creator: 'SG Fire',
  publisher: 'SG Fire',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://sgfire.in',
    siteName: 'SG Fire',
    title: 'SG Fire — Premium Fire Safety Equipment & Services',
    description: 'Shop premium fire safety equipment and book professional installation services.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SG Fire' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SG Fire — Premium Fire Safety Equipment',
    description: 'Shop fire safety equipment and book installation services.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#dc2626', // Fire red — used in browser tab on mobile
  width: 'device-width',
  initialScale: 1,
};

// ─────────────────────────────────────────────
// ROOT LAYOUT COMPONENT
// ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning // Prevents hydration mismatch on dark mode
      data-scroll-behavior="smooth"
    >
      <body className="font-inter antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* 
          Providers wraps all client-side providers (Redux, QueryClient, Toaster).
          It's a Client Component so we keep the root layout as a Server Component.
        */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

/**
 * Providers Component (inline for simplicity, move to providers.tsx if grows large)
 * ---------
 * Wraps children with all client-side global providers.
 * 'use client' is required because Redux Provider uses React context.
 */
import { Providers } from '@/components/Providers';
