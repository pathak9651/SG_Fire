/**
 * ============================================================
 * FILE: controllers/authController.js
 * PURPOSE: Handles all authentication-related business logic.
 *          Exposes handlers for: register, login, logout,
 *          email OTP verification, forgot password, reset password,
 *          refresh token, and get current user (me).
 *
 * SECURITY MEASURES:
 *  - Passwords hashed with bcrypt (12 salt rounds) via User model hook
 *  - JWT stored in HTTP-only cookies (XSS-safe)
 *  - OTP hashed before storage (never stored plain)
 *  - Rate limiting applied at route level (see auth.routes.js)
 *  - Input validated with express-validator (see validators/)
 *
 * ROUTES (defined in routes/auth.routes.js):
 *  POST   /api/auth/register
 *  POST   /api/auth/login
 *  POST   /api/auth/logout
 *  POST   /api/auth/verify-otp
 *  POST   /api/auth/resend-otp
 *  POST   /api/auth/forgot-password
 *  POST   /api/auth/reset-password/:token
 *  POST   /api/auth/refresh-token
 *  GET    /api/auth/me
 * ============================================================
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendTokenResponse, generateAccessToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';

// ─────────────────────────────────────────────
// @desc    Register a new user & send OTP email
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse('An account with this email already exists.', 400);
  }

  // Create new user (password will be hashed by pre-save hook)
  const user = await User.create({ name, email, phone, password });

  // Generate OTP and save to user document
  const otp = await user.generateOTP();
  await user.save({ validateBeforeSave: false }); // Save OTP without re-validating all fields

  // Send OTP via email using the 'otp' template
  await sendEmail({
    to: user.email,
    subject: 'Verify your SG Fire account',
    template: 'otp',
    data: { name: user.name, otp },
  });

  res.status(201).json({
    success: true,
    message: 'Account created! Please check your email for the OTP to verify your account.',
    userId: user._id, // Send userId so frontend knows which user to verify
  });
});

// ─────────────────────────────────────────────
// @desc    Verify email with OTP
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────────
export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body;

  // Fetch user with OTP fields (normally excluded by select: false)
  const user = await User.findById(userId).select('+otp +otpExpiry');

  if (!user) {
    throw new ErrorResponse('User not found.', 404);
  }

  if (user.isVerified) {
    throw new ErrorResponse('Email is already verified.', 400);
  }

  // Verify OTP (checks expiry + bcrypt comparison internally)
  const isValidOTP = await user.verifyOTP(otp);
  if (!isValidOTP) {
    throw new ErrorResponse('Invalid or expired OTP. Please request a new one.', 400);
  }

  // Mark account as verified and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  // Auto-login after verification by sending tokens
  sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────
// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
// @access  Public
// ─────────────────────────────────────────────
export const resendOTP = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ErrorResponse('User not found.', 404);
  if (user.isVerified) throw new ErrorResponse('Account is already verified.', 400);

  // Generate new OTP and save
  const otp = await user.generateOTP();
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: 'Your new SG Fire OTP',
    template: 'otp',
    data: { name: user.name, otp },
  });

  res.json({ success: true, message: 'New OTP sent to your email.' });
});

// ─────────────────────────────────────────────
// @desc    Login user with email & password
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password field (excluded by default for security)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Use generic message — don't reveal whether email exists
    throw new ErrorResponse('Invalid email or password.', 401);
  }

  // Check password using bcrypt comparison method
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new ErrorResponse('Invalid email or password.', 401);
  }

  // Check if account is blocked
  if (user.isBlocked) {
    throw new ErrorResponse('Your account has been suspended. Please contact support.', 403);
  }

  // Prompt unverified users to verify their email
  if (!user.isVerified) {
    throw new ErrorResponse('Please verify your email first. Check your inbox for the OTP.', 403);
  }

  // Send tokens in cookies + response body
  sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────
// @desc    Logout user (clear cookies)
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
export const logout = asyncHandler(async (req, res, next) => {
  // Clear both authentication cookies by setting maxAge to 0
  res.cookie('accessToken', '', { httpOnly: true, expires: new Date(0) });
  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });

  res.json({ success: true, message: 'Logged out successfully.' });
});

// ─────────────────────────────────────────────
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private (requires protect middleware)
// ─────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res, next) => {
  // req.user is set by the protect middleware after JWT verification
  const user = await User.findById(req.user.id);

  res.json({ success: true, data: user });
});

// ─────────────────────────────────────────────
// @desc    Issue new access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (uses refresh token cookie)
// ─────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res, next) => {

  const token = req.cookies.refreshToken;
  if (!token) throw new ErrorResponse('No refresh token found. Please login.', 401);

  // Verify the refresh token
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded.id);
  if (!user || user.isBlocked) {
    throw new ErrorResponse('Invalid session. Please login again.', 401);
  }

  // Issue a new access token with role-based expiry
  const isAdmin = user.role === 'admin';
  const expiresIn = isAdmin ? 30 * 60 * 1000 : 5 * 60 * 1000; // 30m for admin, 5m for user
  const newAccessToken = generateAccessToken(user._id, isAdmin ? '30m' : '5m');

  // Set new access token in cookie
  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn,
  });

  res.json({ success: true, accessToken: newAccessToken });
});

// ─────────────────────────────────────────────
// @desc    Check current session without returning 401 for guests
// @route   GET /api/auth/session
// @access  Public
// ─────────────────────────────────────────────
export const getSession = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.json({ success: true, authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.isBlocked) {
      return res.json({ success: true, authenticated: false });
    }

    const isAdmin = user.role === 'admin';
    const expiresIn = isAdmin ? 30 * 60 * 1000 : 5 * 60 * 1000;
    const accessToken = generateAccessToken(user._id, isAdmin ? '30m' : '5m');

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn,
    });

    res.json({
      success: true,
      authenticated: true,
      accessToken,
      data: user,
    });
  } catch (error) {
    res.json({ success: true, authenticated: false });
  }
});

// ─────────────────────────────────────────────
// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Always return success even if email not found (prevents email enumeration)
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }

  // Generate a secure random token (not JWT — simpler for one-time links)
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash and store the token (never store plain tokens in DB)
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Build the reset URL (link in the email)
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'SG Fire — Reset Your Password',
    template: 'passwordReset',
    data: { name: user.name, resetUrl },
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  });
});

// ─────────────────────────────────────────────
// @desc    Reset password using token from email
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Hash the token from URL to compare with stored hash in DB
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // Find user with this token and ensure it hasn't expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: new Date() }, // Token must not be expired
  });

  if (!user) {
    throw new ErrorResponse('Password reset link is invalid or has expired.', 400);
  }

  // Set new password (pre-save hook will hash it)
  user.password = req.body.password;
  user.resetPasswordToken = undefined; // Clear reset token
  user.resetPasswordExpire = undefined;
  await user.save();

  // Auto-login with new password
  sendTokenResponse(user, 200, res);
});
