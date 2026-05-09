/**
 * ============================================================
 * FILE: routes/admin.routes.js
 * PURPOSE: Admin-only routes for analytics, banners, and user management.
 * BASE PATH: /api/admin (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getLowStockProducts,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllUsers,
  toggleBlockUser,
  updateUserRole,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// All admin routes require login AND admin role
router.use(protect, adminOnly);

// ── Analytics & Reporting ──────────────────────────────────
router.get('/stats', getDashboardStats);        // Dashboard summary cards
router.get('/sales-chart', getSalesChart);      // Revenue chart (last 30 days)
router.get('/top-products', getTopProducts);    // Best-selling products table
router.get('/low-stock', getLowStockProducts);  // Low stock alert table

// ── Banner Management ──────────────────────────────────────
router.get('/banners', getBanners);                                      // List all
router.post('/banners', uploadSingle('image'), createBanner);            // Create with image
router.put('/banners/:id', uploadSingle('image'), updateBanner);         // Update banner
router.delete('/banners/:id', deleteBanner);                             // Delete banner

// ── User Management ────────────────────────────────────────
router.get('/users', getAllUsers);                      // All users list
router.patch('/users/:id/block', toggleBlockUser);      // Block / unblock toggle
router.patch('/users/:id/role', updateUserRole);        // Change user role

export default router;
