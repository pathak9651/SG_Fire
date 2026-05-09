/**
 * ============================================================
 * FILE: controllers/cartController.js
 * PURPOSE: Manages the user's shopping cart.
 *          Creates or updates a single cart per user.
 *          All prices are fetched from Product model (not cart)
 *          to prevent price manipulation by clients.
 *
 * ROUTES (defined in routes/cart.routes.js):
 *  GET    /api/cart              - Get user's cart
 *  POST   /api/cart/add          - Add item or increase quantity
 *  PUT    /api/cart/update       - Update item quantity
 *  DELETE /api/cart/remove/:productId - Remove an item
 *  DELETE /api/cart/clear        - Clear entire cart
 *  POST   /api/cart/coupon       - Apply coupon code
 *  DELETE /api/cart/coupon       - Remove applied coupon
 * ============================================================
 */

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';

// ─────────────────────────────────────────────
// Helper: Calculate cart totals from DB prices
// WHY: Always calculate server-side to prevent cart price hacking
// ─────────────────────────────────────────────
const calculateCartTotals = async (cartItems) => {
  let itemsTotal = 0;

  // Populate product prices fresh from DB
  const itemsWithPrices = await Promise.all(
    cartItems.map(async (item) => {
      const product = await Product.findById(item.product)
        .select('title images price discountPrice stock isActive');

      if (!product || !product.isActive) return null; // Remove deleted products

      const effectivePrice = product.discountPrice || product.price;
      const subtotal = effectivePrice * item.quantity;
      itemsTotal += subtotal;

      return {
        product: product._id,
        title: product.title,
        image: product.images[0]?.url || '',
        price: effectivePrice,
        originalPrice: product.price,
        quantity: item.quantity,
        subtotal,
        stock: product.stock,
        inStock: product.stock > 0,
      };
    })
  );

  // Filter out null (deleted/inactive products)
  const validItems = itemsWithPrices.filter(Boolean);

  // Shipping: free over ₹1000, else ₹99
  const shippingCharge = itemsTotal >= 1000 ? 0 : 99;

  // Tax: 18% GST on products
  const taxAmount = Math.round(itemsTotal * 0.18);

  const totalAmount = itemsTotal + shippingCharge + taxAmount;

  return { validItems, itemsTotal, shippingCharge, taxAmount, totalAmount };
};

// ─────────────────────────────────────────────
// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
// ─────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // Return empty cart structure if no cart exists yet
    return res.json({
      success: true,
      data: { items: [], itemsTotal: 0, shippingCharge: 99, taxAmount: 0, totalAmount: 0 },
    });
  }

  const totals = await calculateCartTotals(cart.items);

  res.json({
    success: true,
    data: {
      ...totals,
      appliedCoupon: cart.appliedCoupon || null,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Add product to cart (or increase quantity if exists)
// @route   POST /api/cart/add
// @access  Private
// Body: { productId, quantity }
// ─────────────────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate product exists and is in stock
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ErrorResponse('Product not found.', 404);
  }
  if (product.stock < quantity) {
    throw new ErrorResponse(`Only ${product.stock} unit(s) available in stock.`, 400);
  }

  // Find existing cart or create new one
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if this product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex >= 0) {
    // Product already in cart — increase quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Validate new quantity doesn't exceed stock
    if (newQuantity > product.stock) {
      throw new ErrorResponse(`Cannot add more. Only ${product.stock} unit(s) available.`, 400);
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // New product — add to cart
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  // Return updated totals
  const totals = await calculateCartTotals(cart.items);
  res.json({ success: true, message: 'Item added to cart.', data: totals });
});

// ─────────────────────────────────────────────
// @desc    Update quantity of a cart item
// @route   PUT /api/cart/update
// @access  Private
// Body: { productId, quantity }
// ─────────────────────────────────────────────
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) throw new ErrorResponse('Quantity must be at least 1.', 400);

  const product = await Product.findById(productId);
  if (!product) throw new ErrorResponse('Product not found.', 404);
  if (quantity > product.stock) {
    throw new ErrorResponse(`Only ${product.stock} unit(s) available.`, 400);
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) throw new ErrorResponse('Cart not found.', 404);

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex < 0) throw new ErrorResponse('Item not in cart.', 404);

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  const totals = await calculateCartTotals(cart.items);
  res.json({ success: true, data: totals });
});

// ─────────────────────────────────────────────
// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
// ─────────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) throw new ErrorResponse('Cart not found.', 404);

  // Filter out the item to remove
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();

  const totals = await calculateCartTotals(cart.items);
  res.json({ success: true, message: 'Item removed from cart.', data: totals });
});

// ─────────────────────────────────────────────
// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
// ─────────────────────────────────────────────
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [], appliedCoupon: undefined }
  );

  res.json({ success: true, message: 'Cart cleared.' });
});

// ─────────────────────────────────────────────
// @desc    Apply a coupon code to cart
// @route   POST /api/cart/coupon
// @access  Private
// Body: { code }
// ─────────────────────────────────────────────
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  // Find active coupon by code
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon) throw new ErrorResponse('Invalid coupon code.', 400);
  if (coupon.isExpired) throw new ErrorResponse('This coupon has expired.', 400);
  if (coupon.isUsageLimitReached) throw new ErrorResponse('Coupon usage limit reached.', 400);

  // Check if user has already used this coupon
  const userUsageCount = coupon.usedBy.filter(
    (u) => u.user.toString() === req.user.id.toString()
  ).length;
  if (userUsageCount >= coupon.maxUsesPerUser) {
    throw new ErrorResponse('You have already used this coupon.', 400);
  }

  // Calculate cart total to validate minOrderAmount
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart || cart.items.length === 0) {
    throw new ErrorResponse('Your cart is empty.', 400);
  }

  const totals = await calculateCartTotals(cart.items);

  if (totals.itemsTotal < coupon.minOrderAmount) {
    throw new ErrorResponse(
      `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      400
    );
  }

  // Calculate discount amount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round(totals.itemsTotal * (coupon.discountValue / 100));
    // Apply max discount cap if set
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === 'flat') {
    discount = Math.min(coupon.discountValue, totals.itemsTotal); // Can't exceed cart total
  } else if (coupon.discountType === 'free_ship') {
    discount = totals.shippingCharge; // Discount equals the shipping charge
  }

  // Save coupon to cart
  cart.appliedCoupon = { code: coupon.code, couponId: coupon._id, discount };
  await cart.save();

  res.json({
    success: true,
    message: `Coupon applied! You save ₹${discount}.`,
    data: { discount, couponCode: coupon.code },
  });
});

// ─────────────────────────────────────────────
// @desc    Remove applied coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
// ─────────────────────────────────────────────
export const removeCoupon = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $unset: { appliedCoupon: '' } }
  );

  res.json({ success: true, message: 'Coupon removed.' });
});
