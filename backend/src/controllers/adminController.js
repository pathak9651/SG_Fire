/**
 * ============================================================
 * FILE: controllers/adminController.js
 * PURPOSE: Admin-only analytics, dashboard stats, and reporting.
 *          Aggregates data from all collections to give admin
 *          a real-time overview of the business.
 *
 * ROUTES (defined in routes/admin.routes.js):
 *  GET /api/admin/stats          - Dashboard summary stats
 *  GET /api/admin/sales-chart    - Sales chart data (last 30 days)
 *  GET /api/admin/top-products   - Best selling products
 *  GET /api/admin/low-stock      - Products with low stock
 *  GET /api/admin/banners        - Get all banners
 *  POST /api/admin/banners       - Create banner
 *  PUT /api/admin/banners/:id    - Update banner
 *  DELETE /api/admin/banners/:id - Delete banner
 *  GET /api/admin/users          - Get all users
 *  PATCH /api/admin/users/:id/block - Block/unblock user
 *  PATCH /api/admin/users/:id/role  - Change user role
 * ============================================================
 */

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Banner from '../models/Banner.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

// ─────────────────────────────────────────────
// @desc    Get admin dashboard summary statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Run all aggregation queries in parallel for performance
  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    totalProducts,
    pendingAppointments,
    recentOrders,
  ] = await Promise.all([
    // Total revenue from all paid orders
    Order.aggregate([
      { $match: { 'paymentInfo.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),

    // Total order count
    Order.countDocuments(),

    // Total registered users (excluding admins)
    User.countDocuments({ role: 'user' }),

    // Total active products
    Product.countDocuments({ isActive: true }),

    // Pending appointments count (for alert badge in admin sidebar)
    Appointment.countDocuments({ status: 'pending' }),

    // Last 5 orders for "Recent Orders" widget
    Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email')
      .select('orderNumber orderStatus totalAmount createdAt'),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      pendingAppointments,
      recentOrders,
    },
  });
});

// ─────────────────────────────────────────────
// @desc    Get sales chart data (daily revenue for last 30 days)
// @route   GET /api/admin/sales-chart
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getSalesChart = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Aggregate daily revenue using MongoDB's date operators
  const salesData = await Order.aggregate([
    {
      $match: {
        'paymentInfo.status': 'paid',
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          // Group by date (year + month + day)
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } }, // Sort chronologically
  ]);

  res.json({ success: true, data: salesData });
});

// ─────────────────────────────────────────────
// @desc    Get top-selling products
// @route   GET /api/admin/top-products
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;

  const topProducts = await Product.find({ isActive: true })
    .sort('-totalSold')
    .limit(limit)
    .select('title images price totalSold stock ratings')
    .populate('category', 'name');

  res.json({ success: true, data: topProducts });
});

// ─────────────────────────────────────────────
// @desc    Get products with low stock
// @route   GET /api/admin/low-stock
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getLowStockProducts = asyncHandler(async (req, res) => {
  // Find products where stock <= lowStockThreshold
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }, // Compare two document fields
  })
    .select('title stock lowStockThreshold images price')
    .sort('stock'); // Most critical (lowest stock) first

  res.json({ success: true, count: lowStockProducts.length, data: lowStockProducts });
});

// ─────────────────────────────────────────────
// BANNER MANAGEMENT
// ─────────────────────────────────────────────

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Public (for homepage display) / Admin (for management)
export const getBanners = asyncHandler(async (req, res) => {
  const { position, activeOnly } = req.query;
  const filter = {};
  if (position) filter.position = position;
  if (activeOnly === 'true') filter.isActive = true;

  const banners = await Banner.find(filter).sort('order');
  res.json({ success: true, data: banners });
});

// @desc    Create a new banner
// @route   POST /api/admin/banners
// @access  Private (Admin only)
export const createBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new ErrorResponse('Banner image is required.', 400);

  // Upload banner image to Cloudinary
  const uploadResult = await uploadToCloudinary(req.file.buffer, 'sgfire/banners');

  const banner = await Banner.create({
    ...req.body,
    image: {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      alt: req.body.title,
    },
  });

  res.status(201).json({ success: true, data: banner });
});

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private (Admin only)
export const updateBanner = asyncHandler(async (req, res) => {
  let banner = await Banner.findById(req.params.id);
  if (!banner) throw new ErrorResponse('Banner not found.', 404);

  // If new image uploaded, replace the old one
  if (req.file) {
    await deleteFromCloudinary(banner.image.public_id);
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'sgfire/banners');
    req.body.image = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
      alt: req.body.title || banner.title,
    };
  }

  banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: banner });
});

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (Admin only)
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw new ErrorResponse('Banner not found.', 404);

  // Delete from Cloudinary to free up storage
  await deleteFromCloudinary(banner.image.public_id);
  await banner.deleteOne();

  res.json({ success: true, message: 'Banner deleted.' });
});

// ─────────────────────────────────────────────
// USER MANAGEMENT (Admin)
// ─────────────────────────────────────────────

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const { role, isBlocked } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email phone role isBlocked isVerified createdAt'),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: users, total, totalPages: Math.ceil(total / limit) });
});

// @desc    Block or unblock a user
// @route   PATCH /api/admin/users/:id/block
// @access  Private (Admin only)
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ErrorResponse('User not found.', 404);
  if (user.role === 'admin') throw new ErrorResponse('Cannot block an admin user.', 403);

  user.isBlocked = !user.isBlocked; // Toggle the block status
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
    data: { isBlocked: user.isBlocked },
  });
});

// @desc    Change user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private (Admin only)
// Body: { role }
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['user', 'admin', 'technician'];
  if (!validRoles.includes(role)) throw new ErrorResponse('Invalid role.', 400);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('name email role');

  if (!user) throw new ErrorResponse('User not found.', 404);

  res.json({ success: true, data: user });
});
