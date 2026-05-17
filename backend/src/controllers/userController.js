/**
 * ============================================================
 * FILE: controllers/userController.js
 * PURPOSE: Handles user-specific actions such as wishlist management,
 *          address updates, and profile settings.
 * ============================================================
 */

import User from '../models/User.js';
import Product from '../models/Product.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';

// ─────────────────────────────────────────────
// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/users/wishlist/:productId
// @access  Private
// ─────────────────────────────────────────────
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found.', 404);
  }

  const user = await User.findById(req.user.id);
  
  // Check if product already in wishlist
  const isWishlisted = user.wishlist.includes(productId);

  if (isWishlisted) {
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ success: true, message: 'Removed from wishlist', wishlist: user.wishlist });
  } else {
    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', wishlist: user.wishlist });
  }
});

// ─────────────────────────────────────────────
// @desc    Get user's wishlist
// @route   GET /api/users/wishlist
// @access  Private
// ─────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'wishlist',
    select: 'title slug images price discountPrice ratings brand stock',
    populate: { path: 'category', select: 'name slug' }
  });

  res.json({ success: true, count: user.wishlist.length, data: user.wishlist });
});

// ─────────────────────────────────────────────
// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
// ─────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new ErrorResponse('User not found', 404);

  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      wishlist: user.wishlist,
      addresses: user.addresses,
      notifications: user.notifications,
      createdAt: user.createdAt,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
// ─────────────────────────────────────────────
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ErrorResponse('Please provide current and new password', 400);
  }

  // Find user and explicitly select password
  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new ErrorResponse('User not found', 404);

  // Check if current password matches
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse('Incorrect current password', 401);
  }

  // Update to new password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});
