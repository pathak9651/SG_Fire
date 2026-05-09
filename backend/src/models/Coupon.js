/**
 * ============================================================
 * FILE: models/Coupon.js
 * PURPOSE: Defines discount coupons for checkout.
 * TYPES: percentage, flat, free_ship
 * USED BY: cartController.js, couponController.js
 * ============================================================
 */

import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    // Coupon code (e.g., "SAVE20") — always stored UPPERCASE
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    },

    description: { type: String, maxlength: [200, 'Description max 200 chars'] },

    // Type: 'percentage' = X% off | 'flat' = fixed rupees off | 'free_ship' = free shipping
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'flat', 'free_ship'],
      default: 'percentage',
    },

    // For percentage: 0-100. For flat: amount in rupees.
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative'],
    },

    // For percentage coupons: cap the max discount (e.g., 20% but max ₹500)
    maxDiscountAmount: { type: Number },

    // Minimum cart value required to apply coupon
    minOrderAmount: { type: Number, default: 0 },

    // null = unlimited global uses
    maxUses: { type: Number, default: null },

    // Each user can use this coupon N times (default: once)
    maxUsesPerUser: { type: Number, default: 1 },

    // Total number of times coupon has been used globally
    usedCount: { type: Number, default: 0 },

    // Tracks which users used this coupon (for per-user limit enforcement)
    usedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
      },
    ],

    // Coupon is only valid for orders containing these categories (optional)
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],

    // Coupon is only valid for specific products (optional)
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

    // Validity window
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: [true, 'Expiry date is required'] },

    // Admin can deactivate without deleting
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: has this coupon passed its expiry date?
couponSchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

// Virtual: has global usage limit been reached?
couponSchema.virtual('isUsageLimitReached').get(function () {
  if (!this.maxUses) return false;
  return this.usedCount >= this.maxUses;
});


couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
