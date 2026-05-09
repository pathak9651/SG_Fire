/**
 * ============================================================
 * FILE: next.config.ts
 * PURPOSE: Next.js framework configuration.
 *          - Configures remote image domains (Cloudinary)
 *          - Sets up HTTP security headers
 *          - Configures redirects and rewrites if needed
 *          - Environment-specific optimizations
 * ============================================================
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── Image Optimization ──────────────────────────────────
  // Allow Next.js Image component to serve images from Cloudinary.
  // Without this, next/image throws a security error for external URLs.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',  // Cloudinary CDN domain
        pathname: '/**',                  // Allow all paths
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Placeholder images during development
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Fallback placeholder service
      },
    ],
  },

  // ── HTTP Security Headers ──────────────────────────────
  // Applied to all pages for improved security posture
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Control referrer information
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Enable XSS filtering in older browsers
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Permissions Policy — disable unnecessary browser APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ];
  },

  // ── TypeScript & ESLint ────────────────────────────────
  // Build won't fail on type errors or lint warnings in production
  // (useful for initial deployments — fix these progressively)
  typescript: { ignoreBuildErrors: false },   // Set true only to force-deploy

  // ── Power User: React Strict Mode ─────────────────────
  // Highlights potential problems in development (runs effects twice)
  reactStrictMode: true,

  // ── Compiler Options ──────────────────────────────────
  // Removes console.log in production builds (smaller bundle)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }  // Keep console.error and console.warn
      : false,
  },
};

export default nextConfig;
