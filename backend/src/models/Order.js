/**
 * ============================================================
 * FILE: models/Order.js
 * PURPOSE: Defines the MongoDB schema for customer orders.
 *          Tracks the complete lifecycle of a purchase from
 *          cart checkout to delivery.
 *
 * ORDER LIFECYCLE:
 *  pending → processing → shipped → out_for_delivery → delivered
 *                      ↓
 *                  cancelled (can happen before shipped)
 *                  refund_requested → refunded
 *
 * USED BY: orderController.js, adminController.js
 * ============================================================
 */

import mongoose from 'mongoose';

/**
 * orderItemSchema
 * ---------------
 * Sub-document for each product in an order.
 * Stores a snapshot of product data at the time of ordering
 * (so order history remains accurate even if product is later edited).
 */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  // Snapshot fields — stored at order time (protects historical data)
  title: { type: String, required: true },        // Product title at time of purchase
  image: { type: String, required: true },        // Product image URL at purchase time
  price: { type: Number, required: true },        // Price customer paid per unit
  quantity: { type: Number, required: true, min: 1 },
});

/**
 * shippingAddressSchema
 * ---------------------
 * Snapshot of the delivery address used for this order.
 * Stored separately from user.addresses so changes to the user's
 * address book don't affect past order records.
 */
const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
});

/**
 * paymentInfoSchema
 * -----------------
 * Stores payment gateway transaction details.
 * Supports both Razorpay and Stripe.
 */
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['razorpay', 'stripe', 'cod', 'wallet'],   // Payment methods
    required: true,
  },
  // Razorpay-specific fields
  razorpayOrderId: { type: String },      // Razorpay order ID (rzp_order_...)
  razorpayPaymentId: { type: String },    // Razorpay payment ID (pay_...)
  razorpaySignature: { type: String },    // Razorpay HMAC signature (for verification)

  // Stripe-specific fields
  stripePaymentIntentId: { type: String },  // Stripe PaymentIntent ID (pi_...)
  stripeChargeId: { type: String },         // Stripe Charge ID (ch_...)

  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },

  paidAt: { type: Date },                 // Timestamp when payment was confirmed
  amount: { type: Number },               // Final amount charged (in paise for Razorpay)
  currency: { type: String, default: 'INR' },
});

/**
 * orderSchema
 * -----------
 * Main Order document schema.
 */
const orderSchema = new mongoose.Schema(
  {
    // ── Order Reference ────────────────────────────────────
    orderNumber: {
      type: String,
      unique: true,
      // Generated in controller: 'SGF-' + timestamp + random (e.g., SGF-20240115-X9K2)
    },

    // ── Customer ───────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Ordered Products ───────────────────────────────────
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },

    // ── Pricing Breakdown ──────────────────────────────────
    itemsTotal: { type: Number, required: true },     // Sum of all item prices
    shippingCharge: { type: Number, default: 0 },     // Shipping fee
    taxAmount: { type: Number, default: 0 },          // Total GST amount
    discountAmount: { type: Number, default: 0 },     // Coupon/offer discount applied
    totalAmount: { type: Number, required: true },    // Final amount charged to customer

    // ── Coupon ─────────────────────────────────────────────
    coupon: {
      code: { type: String },            // Coupon code used
      discount: { type: Number },        // Discount amount applied
    },

    // ── Shipping Info ──────────────────────────────────────
    shippingAddress: { type: shippingAddressSchema, required: true },

    // ── Payment ────────────────────────────────────────────
    paymentInfo: { type: paymentInfoSchema, required: true },

    // ── Order Status ───────────────────────────────────────
    // Tracks the current stage of the order
    orderStatus: {
      type: String,
      enum: [
        'pending',           // Order placed, payment not yet verified
        'processing',        // Payment confirmed, preparing for dispatch
        'shipped',           // Order handed to courier
        'out_for_delivery',  // Courier is out for delivery
        'delivered',         // Customer received the order
        'cancelled',         // Order was cancelled (before shipping)
        'refund_requested',  // Customer requested refund
        'refunded',          // Refund processed
      ],
      default: 'pending',
    },

    // ── Status Timeline ────────────────────────────────────
    // Records timestamps for each status change (for order tracking UI)
    statusHistory: [
      {
        status: { type: String },
        message: { type: String },       // Optional message (e.g., "Out for delivery with Delhivery")
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // ── Delivery ───────────────────────────────────────────
    estimatedDelivery: { type: Date },  // Expected delivery date
    deliveredAt: { type: Date },        // Actual delivery timestamp

    // ── Logistics ──────────────────────────────────────────
    trackingNumber: { type: String },   // Courier tracking number
    trackingUrl: { type: String },      // Link to courier tracking page

    // ── Invoice ────────────────────────────────────────────
    invoiceUrl: { type: String },       // Cloudinary URL of generated PDF invoice

    // ── Order Notes ────────────────────────────────────────
    customerNotes: { type: String },    // Notes from customer at checkout
    adminNotes: { type: String },       // Internal notes from admin
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
orderSchema.index({ user: 1, createdAt: -1 });  // Fast user order history
orderSchema.index({ orderStatus: 1 });           // Fast admin order management

orderSchema.index({ 'paymentInfo.status': 1 }); // Fast payment status queries

const Order = mongoose.model('Order', orderSchema);

export default Order;
