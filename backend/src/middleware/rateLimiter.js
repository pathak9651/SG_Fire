/**
 * ============================================================
 * FILE: middleware/rateLimiter.js
 * PURPOSE: Protects the API from brute-force attacks, DDoS attacks,
 *          and excessive API abuse by limiting the number of requests
 *          a single IP address can make within a time window.
 *
 * RATE LIMITING CONFIGS:
 *  - generalLimiter  : Applied to all API routes. 100 req/15min per IP.
 *  - authLimiter     : Applied to login/register. 10 req/15min per IP.
 *                      (Prevents brute-force password guessing)
 *  - otpLimiter      : Applied to OTP endpoints. 5 req/15min per IP.
 *  - uploadLimiter   : Applied to file upload endpoints. 20 req/hour.
 *  - contactLimiter  : Applied to public contact form submissions.
 *  - supportLimiter  : Applied to support ticket creation requests.
 *
 * USAGE in routes:
 *   import { authLimiter } from '../middleware/rateLimiter.js';
 *   router.post('/login', authLimiter, loginUser);
 * ============================================================
 */

import rateLimit from 'express-rate-limit';

/**
 * generalLimiter
 * --------------
 * Default rate limiter applied globally to all API routes.
 * 100 requests per 15 minutes from a single IP address.
 * Prevents general API abuse and DDoS attacks.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // Max 100 requests per windowMs per IP
  standardHeaders: true,     // Return rate limit info in 'RateLimit-*' headers
  legacyHeaders: false,      // Disable deprecated 'X-RateLimit-*' headers

  // Custom message sent when limit is exceeded
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * authLimiter
 * -----------
 * Strict rate limiter for authentication endpoints (login, register, reset-password).
 * 10 requests per 15 minutes from a single IP.
 *
 * WHY SO STRICT?
 * Prevents automated bots from brute-forcing passwords or creating
 * thousands of fake accounts in a short time.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // Only 10 auth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
});

/**
 * otpLimiter
 * ----------
 * Very strict limiter for OTP request/verify endpoints.
 * 5 requests per 15 minutes from a single IP.
 *
 * WHY?
 * OTP endpoints are prime targets for SMS/email flooding attacks.
 * Each OTP send costs money (SMS/email provider fees).
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 5,                    // Only 5 OTP requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait 15 minutes before requesting again.',
  },
});

/**
 * uploadLimiter
 * -------------
 * Rate limiter for file upload endpoints (product images, appointment photos).
 * 20 uploads per hour from a single IP.
 *
 * WHY?
 * File uploads are expensive (bandwidth, Cloudinary processing costs).
 * Limits abuse of the upload functionality.
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20,                   // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. Please wait an hour before uploading more files.',
  },
});

/**
 * contactLimiter
 * --------------
 * Rate limiter for public contact form submissions.
 * Keeps spam and email flooding low.
 */
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,                   // 5 submissions per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact requests. Please try again later.',
  },
});

/**
 * supportLimiter
 * --------------
 * Rate limiter for support ticket creation requests.
 * Prevents users from spamming live-chat ticket creation.
 */
export const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many support requests. Please wait before trying again.',
  },
});

/**
 * aiChatLimiter
 * -------------
 * Rate limiter for AI safety chatbot queries.
 * 100 requests per 15 minutes (generous for conversational flow).
 */
export const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the conversation limit. Please wait 15 minutes before chatting again.',
  },
});
