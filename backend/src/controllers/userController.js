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
