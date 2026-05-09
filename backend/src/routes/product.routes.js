/**
 * ============================================================
 * FILE: routes/product.routes.js
 * PURPOSE: Defines all product-related API routes.
 *          Public routes for browsing, admin-protected routes for CRUD.
 *
 * BASE PATH: /api/products (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { uploadMultiple, uploadSingle } from '../middleware/upload.js';

const router = express.Router();

// ── Public Routes (No authentication required) ─────────────

router.get('/', getProducts);                             // Browse all products (with filters)
router.get('/featured', getFeaturedProducts);             // Homepage featured products
router.get('/slug/:slug', getProductBySlug);              // Product detail page by URL slug
router.get('/related/:id', getRelatedProducts);           // Related products sidebar

// ── Admin Only Routes ──────────────────────────────────────
// protect: verifies JWT | adminOnly: checks role === 'admin'
// uploadMultiple: handles up to 5 image uploads per product

router.post('/', protect, adminOnly, uploadMultiple('images', 5), createProduct);
router.put('/:id', protect, adminOnly, uploadMultiple('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateStock);   // Quick stock update

export default router;
