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

// ─────────────────────────────────────────────
// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
// ─────────────────────────────────────────────
export const addAddress = asyncHandler(async (req, res) => {
  const { type, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    throw new ErrorResponse('Please provide all required address fields', 400);
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new ErrorResponse('User not found', 404);

  // If this address is set as default, turn off other defaults
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Create the new address object
  const newAddress = {
    type: type || 'home',
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country: country || 'India',
    isDefault: isDefault || user.addresses.length === 0 // Make default if it's the first one
  };

  user.addresses.push(newAddress);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: user.addresses
  });
});

// ─────────────────────────────────────────────
// @desc    Update a saved address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
// ─────────────────────────────────────────────
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { type, fullName, phone, addressLine1, addressLine2, city, state, pincode, country, isDefault } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new ErrorResponse('User not found', 404);

  // Find the address
  const address = user.addresses.id(addressId);
  if (!address) {
    throw new ErrorResponse('Address not found', 404);
  }

  // If this address is set as default, turn off other defaults
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update fields
  if (type) address.type = type;
  if (fullName) address.fullName = fullName;
  if (phone) address.phone = phone;
  if (addressLine1) address.addressLine1 = addressLine1;
  if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
  if (city) address.city = city;
  if (state) address.state = state;
  if (pincode) address.pincode = pincode;
  if (country) address.country = country;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await user.save();

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: user.addresses
  });
});

// ─────────────────────────────────────────────
// @desc    Delete a saved address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
// ─────────────────────────────────────────────
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user.id);
  if (!user) throw new ErrorResponse('User not found', 404);

  // Remove the address
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
  await user.save();

  res.json({
    success: true,
    message: 'Address deleted successfully',
    data: user.addresses
  });
});
