/**
 * ============================================================
 * FILE: routes/cart.routes.js
 * PURPOSE: All cart-related routes. All require authentication.
 * BASE PATH: /api/cart (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require a logged-in user
router.use(protect);

router.get('/', getCart);                              // Get cart with live prices
router.post('/add', addToCart);                        // Add item to cart
router.put('/update', updateCartItem);                 // Update item quantity
router.delete('/remove/:productId', removeFromCart);   // Remove specific item
router.delete('/clear', clearCart);                    // Empty the entire cart
router.post('/coupon', applyCoupon);                   // Apply coupon code
router.delete('/coupon', removeCoupon);                // Remove applied coupon

export default router;
