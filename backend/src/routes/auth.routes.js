/**
 * ============================================================
 * FILE: routes/auth.routes.js
 * PURPOSE: Defines all authentication-related API routes.
 *          Applies rate limiting and input validation middleware
 *          before passing to authController handlers.
 *
 * BASE PATH: /api/auth (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  register,
  login,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ── Public Routes ──────────────────────────────────────────
// Rate limited to prevent brute force attacks

router.post('/register', authLimiter, register);            // New user registration
router.post('/login', authLimiter, login);                  // Email + password login
router.post('/verify-otp', otpLimiter, verifyOTP);          // Verify email with OTP
router.post('/resend-otp', otpLimiter, resendOTP);          // Resend OTP email
router.post('/forgot-password', authLimiter, forgotPassword); // Send reset link
router.post('/reset-password/:token', authLimiter, resetPassword); // Reset with token
router.post('/refresh-token', refreshToken);                // Issue new access token

// ── Protected Routes ───────────────────────────────────────
// Require valid JWT (via protect middleware)

router.post('/logout', protect, logout);    // Clear auth cookies
router.get('/me', protect, getMe);          // Get current user profile

export default router;
