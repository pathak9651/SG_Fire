/**
 * ============================================================
 * FILE: middleware/auth.js
 * PURPOSE: JWT-based authentication and role-based authorization
 *          middleware. Protects private routes from unauthenticated
 *          and unauthorized access.
 *
 * MIDDLEWARE FUNCTIONS:
 *  1. protect()   — Verifies JWT. Attaches user to req.user.
 *                   Use on any route that requires login.
 *  2. adminOnly() — Checks if req.user.role === 'admin'.
 *                   Use on admin-only routes (after protect).
 *  3. authorize() — Flexible role checker. Use when multiple roles allowed.
 *
 * TOKEN LOCATION:
 *  The middleware checks for the JWT in this order:
 *  1. HTTP-only cookie named 'accessToken' (preferred — XSS safe)
 *  2. Authorization header: 'Bearer <token>' (for API clients / mobile)
 *
 * USAGE EXAMPLES:
 *   router.get('/profile', protect, getUserProfile);
 *   router.delete('/product/:id', protect, adminOnly, deleteProduct);
 *   router.patch('/status', protect, authorize('admin', 'technician'), updateStatus);
 * ============================================================
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, ErrorResponse } from './errorHandler.js';

/**
 * protect()
 * ---------
 * Middleware that verifies the JWT and attaches the authenticated
 * user to the request object as req.user.
 *
 * Steps:
 *  1. Extract token from cookie or Authorization header
 *  2. Verify token signature and expiry using JWT_SECRET
 *  3. Find the user in the database by the decoded ID
 *  4. Check if user is not blocked
 *  5. Attach user to req.user and call next()
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // ── Step 1: Extract token ──────────────────────────────
  // Priority 1: HTTP-only cookie (set by sendTokenResponse)
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }
  // Priority 2: Authorization header (for mobile apps / Postman testing)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, reject the request
  if (!token) {
    throw new ErrorResponse(
      'Access denied. Please login to continue.',
      401
    );
  }

  // ── Step 2: Verify the token ───────────────────────────
  // jwt.verify() throws if token is invalid, expired, or tampered
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ── Step 3: Find the user ──────────────────────────────
  // Re-fetch from DB to get the latest user data (role changes, etc.)
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new ErrorResponse('User associated with this token no longer exists.', 401);
  }

  // ── Step 4: Check if user is blocked by admin ──────────
  if (user.isBlocked) {
    throw new ErrorResponse(
      'Your account has been suspended. Please contact support.',
      403
    );
  }

  // ── Step 5: Attach user to request for downstream use ──
  req.user = user;
  next();
});

/**
 * adminOnly()
 * -----------
 * Restricts a route to admin users only.
 * MUST be used AFTER protect() middleware.
 *
 * @example
 *   router.delete('/users/:id', protect, adminOnly, deleteUser);
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next(); // User is admin, allow access
  }
  throw new ErrorResponse(
    'Access forbidden: Admin privileges required.',
    403
  );
};

/**
 * authorize()
 * -----------
 * Factory middleware that allows access based on a list of allowed roles.
 * More flexible than adminOnly() when multiple roles need access.
 *
 * @param {...string} roles - Allowed role names (e.g., 'admin', 'technician')
 * @returns {Function} Express middleware function
 *
 * @example
 *   // Allow both admin and technician to update appointment status
 *   router.patch('/appointments/:id', protect, authorize('admin', 'technician'), updateStatus);
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErrorResponse(
        `Role '${req.user.role}' is not authorized to access this route.`,
        403
      );
    }
    next();
  };
};
