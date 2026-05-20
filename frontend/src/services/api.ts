/**
 * ============================================================
 * FILE: src/services/api.ts
 * PURPOSE: Configures the Axios HTTP client for all API calls.
 *          - Sets base URL from environment variable
 *          - Sends cookie-based auth credentials on every request
 *          - Handles 401 errors by attempting token refresh
 *          - Applies consistent error handling and response format
 *
 * WHY A SHARED AXIOS INSTANCE?
 * - Avoids repeating base URL and headers in every service file
 * - Single place to modify auth headers, timeouts, and interceptors
 * - Centralized token refresh logic (no duplication)
 *
 * INTERCEPTOR FLOW:
 *  Request  → Send cookies with the request
 *  Response → On 401: try refreshing token → retry original request
 *             On other errors: pass to caller
 *
 * USAGE:
 *   import api from '@/services/api';
 *   const products = await api.get('/products');
 * ============================================================
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Base Axios instance with SG Fire backend URL.
 * NEXT_PUBLIC_ prefix makes this accessible in browser (Next.js convention).
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/api',

  // Include cookies (HTTP-only JWT cookies) in cross-origin requests
  withCredentials: true,

  // Request timeout: fail if server doesn't respond within 15 seconds
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs BEFORE every outgoing request to append Authorization header.
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const store = (window as any).__REDUX_STORE__;
      const token = store?.getState()?.auth?.accessToken;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs AFTER every incoming response.
// ─────────────────────────────────────────────

/** Track if a token refresh is currently in progress to prevent multiple concurrent refreshes */
let isRefreshing = false;

/** Queue of failed requests waiting for the token to refresh */
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/** Process all queued requests after token refresh completes or fails */
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  // Success: pass the response straight through
  (response) => response,

  // Error handler
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── Handle 401 Unauthorized ──────────────────────────
    // This means the access token has expired.
    // We attempt to refresh it silently.
    // IMPORTANT: Do NOT attempt refresh for auth routes themselves (login, refresh, etc.)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                        originalRequest.url?.includes('/auth/refresh-token') ||
                        originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        // Another refresh is already in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true; // Mark request to prevent infinite retry loop
      isRefreshing = true;

      try {
        // Call refresh endpoint — sends the HTTP-only refresh token cookie automatically
        const { data } = await api.post('/auth/refresh-token');

        if (data?.success && data?.accessToken && typeof window !== 'undefined') {
          const store = (window as any).__REDUX_STORE__;
          if (store) {
            const user = store.getState()?.auth?.user;
            if (user) {
              store.dispatch({
                type: 'auth/setCredentials',
                payload: { user, accessToken: data.accessToken },
              });
            }
          }
        }

        processQueue(null); // Resume all queued requests
        return api(originalRequest as any); // Retry the original failed request
      } catch (refreshError) {
        processQueue(refreshError as AxiosError);

        // Refresh also failed — user needs to log in again
        // Redirect to login page if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
