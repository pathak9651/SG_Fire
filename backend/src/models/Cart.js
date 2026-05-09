/**
 * ============================================================
 * FILE: models/Cart.js
 * PURPOSE: Stores the shopping cart for authenticated users.
 *          Each user has ONE cart document (upserted on changes).
 *          Guest users use localStorage on the frontend; their
 *          cart is merged into the DB cart upon login.
 *
 * DESIGN DECISION: Why store cart in DB (not just localStorage)?
 *  - Cart persists across devices and browser sessions
 *  - Allows cart recovery if browser is closed
 *  - Enables admin analytics on abandoned carts
 *  - Supports server-side price validation at checkout
 *
 * USED BY: cartController.js
 * ============================================================
 */

import mongoose from 'mongoose';

/**
 * cartItemSchema
 * --------------
 * Sub-document for a single item in the cart.
 * Stores product reference + quantity.
 */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  // Price is NOT stored here — always fetched fresh from Product
  // to prevent cart price manipulation attacks
});

/**
 * cartSchema
 * ----------
 * Main Cart document. One cart per user.
 */
const cartSchema = new mongoose.Schema(
  {
    // ── Owner ──────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,    // Enforce one cart per user
    },

    // ── Cart Items ─────────────────────────────────────────
    items: [cartItemSchema],

    // ── Applied Coupon ─────────────────────────────────────
    appliedCoupon: {
      code: { type: String },          // Coupon code string
      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
      },
      discount: { type: Number },      // Discount amount in rupees
    },
  },
  {
    timestamps: true,   // updatedAt helps identify abandoned carts
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index on user for fast cart retrieval by user ID


const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
