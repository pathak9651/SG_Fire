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
 * @returns {string} Signed JWT access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload: only store minimal data (user ID)
    process.env.JWT_SECRET,       // Secret key from environment variables
    { expiresIn: process.env.JWT_EXPIRE || '15m' } // Short expiry for security
  );
};

/**
 * generateRefreshToken()
 * ----------------------
 * Creates a long-lived JWT refresh token.
 * Stored in HTTP-only cookie and used to issue new access tokens.
 *
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {string} Signed JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * sendTokenResponse()
 * -------------------
 * Helper that creates tokens, sets HTTP-only cookies, and sends
 * a structured JSON response. Called at the end of login/register.
 *
 * WHY HTTP-ONLY COOKIES?
 * - JavaScript cannot access HTTP-only cookies, preventing XSS attacks
 * - Automatically sent with every request to the same domain
 *
 * @param {Object} user      - Mongoose User document (password already excluded)
 * @param {number} statusCode - HTTP status code (200, 201, etc.)
 * @param {Object} res       - Express response object
 */
export const sendTokenResponse = (user, statusCode, res) => {
  // Generate both tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Cookie options — shared base settings
  const cookieOptions = {
    httpOnly: true,    // Cookie cannot be accessed by client-side JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Prevents CSRF attacks by blocking cross-site requests
  };

  // Set refresh token as HTTP-only cookie (expires in 7 days)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  // Set access token as HTTP-only cookie (expires in 15 minutes)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
  });

  // Remove password from user object before sending response
  user.password = undefined;

  // Send JSON response with user data and access token
  // (Access token is also sent in body for non-cookie clients like mobile)
  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
};
