/**
 * ============================================================
 * FILE: controllers/orderController.js
 * PURPOSE: Manages the complete order lifecycle.
 *          Handles order creation (from cart), payment verification
 *          for both Razorpay and Stripe, order tracking, cancellation,
 *          and admin order status management.
 *
 * PAYMENT FLOW (Razorpay):
 *  1. Frontend calls POST /api/orders/create-razorpay-order
 *  2. Backend creates a Razorpay order and returns order_id
 *  3. Frontend opens Razorpay checkout UI
 *  4. User pays → Razorpay sends payment_id + signature to frontend
 *  5. Frontend calls POST /api/orders with payment details
 *  6. Backend verifies HMAC signature → creates Order in DB
 *
 * ROUTES (defined in routes/order.routes.js):
 *  POST   /api/orders/razorpay-order   - Create Razorpay order
 *  POST   /api/orders                  - Place order (after payment)
 *  GET    /api/orders/my               - Get logged-in user's orders
 *  GET    /api/orders/:id              - Get single order detail
 *  POST   /api/orders/:id/cancel       - Cancel an order
 *  GET    /api/orders (admin)          - Get all orders
 *  PATCH  /api/orders/:id/status (admin) - Update order status
 * ============================================================
 */

import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const hasValidRazorpayConfig =
    keyId &&
    keySecret &&
    !keyId.includes('your_key_id') &&
    !keySecret.includes('your_razorpay_key_secret');

  if (!hasValidRazorpayConfig) {
    throw new ErrorResponse('Razorpay is not configured on this server.', 503);
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ─────────────────────────────────────────────
// Helper: Generate unique order number
// Format: SGF-YYYYMMDD-XXXX (e.g., SGF-20240115-K8P3)
// ─────────────────────────────────────────────
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SGF-${date}-${random}`;
};

const buildOrderSummaryFromCart = async (cart) => {
  return buildOrderSummaryFromItems(cart.items, cart.appliedCoupon);
};

const buildOrderSummaryFromItems = async (cartItems, appliedCoupon = null) => {
  const orderItems = [];
  let itemsTotal = 0;

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.product);
    if (!product || !product.isActive) continue;

    if (product.stock < cartItem.quantity) {
      throw new ErrorResponse(`Insufficient stock for: ${product.title}`, 400);
    }

    const effectivePrice = product.discountPrice || product.price;
    orderItems.push({
      product: product._id,
      title: product.title,
      image: product.images[0]?.url || '',
      price: effectivePrice,
      quantity: cartItem.quantity,
    });

    itemsTotal += effectivePrice * cartItem.quantity;
  }

  const shippingCharge = itemsTotal >= 1000 ? 0 : 99;
  const taxAmount = Math.round(itemsTotal * 0.18);

  let discountAmount = 0;
  let couponData = {};
  if (appliedCoupon) {
    discountAmount = appliedCoupon.discount || 0;
    couponData = { code: appliedCoupon.code, discount: discountAmount };
  }

  const totalAmount = itemsTotal + shippingCharge + taxAmount - discountAmount;

  return {
    orderItems,
    itemsTotal,
    shippingCharge,
    taxAmount,
    discountAmount,
    couponData,
    totalAmount,
  };
};

// ─────────────────────────────────────────────
// @desc    Create Razorpay order (Step 1 of payment)
// @route   POST /api/orders/razorpay-order
// @access  Private
// Body: { amount } (in paise, e.g., 50000 = ₹500)
// ─────────────────────────────────────────────
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpayClient();
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    throw new ErrorResponse('Your cart is empty.', 400);
  }

  const { totalAmount } = await buildOrderSummaryFromCart(cart);

  // Razorpay requires amount in paise (1 rupee = 100 paise)
  const options = {
    amount: Math.round(totalAmount * 100), // Convert rupees to paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { userId: req.user.id.toString() },
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.json({
    success: true,
    data: {
      id: razorpayOrder.id,         // Pass to frontend for Razorpay checkout
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Place order after payment verification
// @route   POST /api/orders
// @access  Private
// Body: { shippingAddress, paymentMethod, paymentDetails, orderNotes }
// ─────────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, paymentDetails, orderNotes, cartItems } = req.body;

  // ── Step 1: Fetch and validate user's cart ──
  const cart = await Cart.findOne({ user: req.user.id });
  const fallbackItems = Array.isArray(cartItems) ? cartItems : [];
  const effectiveCartItems = cart && cart.items.length > 0 ? cart.items : fallbackItems;

  if (!effectiveCartItems.length) {
    throw new ErrorResponse('Your cart is empty.', 400);
  }

  const {
    orderItems,
    itemsTotal,
    shippingCharge,
    taxAmount,
    discountAmount,
    couponData,
    totalAmount,
  } = await buildOrderSummaryFromItems(effectiveCartItems, cart?.appliedCoupon || null);

  // ── Step 2: Verify Razorpay payment signature ──
  if (paymentMethod === 'razorpay') {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentDetails;

    // HMAC SHA256 signature verification
    // This proves the payment was actually made through Razorpay
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      throw new ErrorResponse('Payment verification failed. Please contact support.', 400);
    }
  }

  // Deduct stock only after payment payload has been validated and order amount derived server-side.
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ErrorResponse(`Product not found: ${item.title}`, 404);
    }
    product.stock -= item.quantity;
    product.totalSold += item.quantity;
    await product.save();
  }

  // Apply coupon discount if present
  if (cart?.appliedCoupon?.couponId) {
    await Coupon.findByIdAndUpdate(cart.appliedCoupon.couponId, {
      $inc: { usedCount: 1 },
      $push: { usedBy: { user: req.user.id } },
    });
  }

  // ── Step 5: Create the Order document ──
  const isCOD = paymentMethod === 'cod';
  
  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user.id,
    items: orderItems,
    itemsTotal,
    shippingCharge,
    taxAmount,
    discountAmount,
    totalAmount,
    coupon: couponData,
    shippingAddress,
    paymentInfo: {
      method: paymentMethod,
      status: isCOD ? 'pending' : 'paid',
      paidAt: isCOD ? undefined : new Date(),
      amount: totalAmount,
      currency: 'INR',
      ...(paymentDetails || {}),
    },
    orderStatus: isCOD ? 'pending' : 'processing', 
    statusHistory: [
      { status: 'pending', message: 'Order placed', timestamp: new Date() },
      ...(!isCOD ? [{ status: 'processing', message: 'Payment confirmed', timestamp: new Date() }] : []),
    ],
    customerNotes: orderNotes,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // ── Step 6: Clear the cart ──
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [], appliedCoupon: undefined }
  );

  // ── Step 7: Send order confirmation email ──
  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed — #${order.orderNumber}`,
      template: 'orderConfirm',
      data: {
        name: req.user.name,
        orderId: order.orderNumber,
        totalAmount,
        items: orderItems,
      },
    });
  } catch (emailError) {
    // Don't fail the order if email fails — just log it
    console.error('Order confirmation email failed:', emailError.message);
  }

  res.status(201).json({ success: true, data: order });
});

// ─────────────────────────────────────────────
// @desc    Get current user's order history
// @route   GET /api/orders/my
// @access  Private
// ─────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('orderNumber orderStatus totalAmount items createdAt estimatedDelivery paymentInfo'),
    Order.countDocuments({ user: req.user.id }),
  ]);

  res.json({
    success: true,
    data: orders,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// ─────────────────────────────────────────────
// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (!order) throw new ErrorResponse('Order not found.', 404);

  // Ensure users can only view their own orders (admins bypass this)
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to view this order.', 403);
  }

  res.json({ success: true, data: order });
});

// ─────────────────────────────────────────────
// @desc    Cancel an order (only if not yet shipped)
// @route   POST /api/orders/:id/cancel
// @access  Private
// ─────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ErrorResponse('Order not found.', 404);

  if (order.user.toString() !== req.user.id) {
    throw new ErrorResponse('Not authorized to cancel this order.', 403);
  }

  // Can only cancel if not shipped yet
  const nonCancellableStatuses = ['shipped', 'out_for_delivery', 'delivered', 'cancelled'];
  if (nonCancellableStatuses.includes(order.orderStatus)) {
    throw new ErrorResponse(`Order cannot be cancelled in '${order.orderStatus}' status.`, 400);
  }

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, totalSold: -item.quantity },
    });
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    message: req.body.reason || 'Cancelled by customer',
    timestamp: new Date(),
    updatedBy: req.user.id,
  });
  await order.save();

  res.json({ success: true, message: 'Order cancelled successfully.', data: order });
});

// ─────────────────────────────────────────────
// @desc    Get all orders (Admin dashboard)
// @route   GET /api/orders (admin)
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const { status, paymentStatus } = req.query;

  // Build filter
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter['paymentInfo.status'] = paymentStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: orders,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// ─────────────────────────────────────────────
// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin only)
// Body: { status, message, trackingNumber, trackingUrl }
// ─────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, trackingNumber, trackingUrl } = req.body;

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw new ErrorResponse('Order not found.', 404);

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (status === 'delivered') order.deliveredAt = new Date();

  // Add to status history
  order.statusHistory.push({
    status,
    message: message || `Order status updated to ${status}`,
    timestamp: new Date(),
    updatedBy: req.user.id,
  });

  await order.save();

  res.json({ success: true, data: order });
});
