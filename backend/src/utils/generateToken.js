/**
 * ============================================================
 * FILE: utils/generateToken.js
 * PURPOSE: Generates JWT access tokens and refresh tokens for
 *          user authentication. Also sets HTTP-only cookies
 *          so tokens are never accessible to client-side JS
 *          (prevents XSS theft of tokens).
 *
 * TOKEN STRATEGY:
 *  - Access Token  : Short-lived (15min). Sent in Authorization header
 *                    or HTTP-only cookie. Used for API requests.
 *  - Refresh Token : Long-lived (7 days). Stored in HTTP-only cookie.
 *                    Used ONLY to get a new access token.
 *
 * USAGE:
 *   import { sendTokenResponse } from '../utils/generateToken.js';
 *   sendTokenResponse(user, 200, res);   // in any auth controller
 * ============================================================
 */

import jwt from 'jsonwebtoken';

/**
 * generateAccessToken()
 * ---------------------
 * Creates a short-lived JWT access token containing the user's ID.
 *
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} expiresIn - Expiry duration (e.g., '5m', '30m')
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (userId, expiresIn = '15m') => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * generateRefreshToken()
 * ----------------------
 * Creates a long-lived JWT refresh token.
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * getCookieOptions()
 * -----------------
 * Helper to generate consistent, robust cookie options.
 * Automatically disables the 'secure' flag in local development environments
 * (localhost or 127.0.0.1) even if NODE_ENV is set to production.
 * This prevents modern browsers from silently rejecting auth cookies.
 *
 * @param {Object} res    - Express response object
 * @param {number} maxAge - Cookie lifetime in milliseconds
 * @returns {Object} Cookie options object
 */
export const getCookieOptions = (res, maxAge) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocal = res.req && res.req.headers && res.req.headers.host && (
    res.req.headers.host.includes('localhost') ||
    res.req.headers.host.includes('127.0.0.1')
  );

  return {
    httpOnly: true,
    secure: isProduction && !isLocal,
    sameSite: isProduction ? 'strict' : 'lax',
    ...(maxAge !== undefined && { maxAge }),
  };
};

/**
 * sendTokenResponse()
 * -------------------
 * Helper that creates tokens, sets HTTP-only cookies, and sends response.
 *
 * @param {Object} user      - User document
 * @param {number} statusCode - HTTP status code
 * @param {Object} res       - Express response object
 */
export const sendTokenResponse = (user, statusCode, res) => {
  // Determine session duration based on role
  // User: 5 min, Admin: 30 min
  const isAdmin = user.role === 'admin';
  const accessExpireStr = isAdmin ? '30m' : '5m';
  const accessMaxAge = isAdmin ? 30 * 60 * 1000 : 5 * 60 * 1000;

  const accessToken = generateAccessToken(user._id, accessExpireStr);
  const refreshToken = generateRefreshToken(user._id);

  // Refresh token always 7 days
  res.cookie(
    'refreshToken',
    refreshToken,
    getCookieOptions(res, 7 * 24 * 60 * 60 * 1000)
  );

  // Access token based on role
  res.cookie(
    'accessToken',
    accessToken,
    getCookieOptions(res, accessMaxAge)
  );

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
};

