/**
 * ============================================================
 * FILE: routes/order.routes.js
 * PURPOSE: Order placement, payment, tracking, and admin management routes.
 * BASE PATH: /api/orders (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ── User Routes ────────────────────────────────────────────
router.use(protect); // All order routes require login

router.post('/razorpay-order', createRazorpayOrder);  // Step 1: Create Razorpay order
router.post('/', placeOrder);                          // Step 2: Place order after payment
router.get('/my', getMyOrders);                        // User's order history
router.get('/:id', getOrderById);                      // Single order detail
router.post('/:id/cancel', cancelOrder);               // Cancel an order

// ── Admin Only Routes ──────────────────────────────────────
router.get('/', adminOnly, getAllOrders);               // All orders dashboard
router.patch('/:id/status', adminOnly, updateOrderStatus); // Update order status

export default router;
