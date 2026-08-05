import Notification from '../models/Notification.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';

// ─────────────────────────────────────────────
// @desc    Get user's notifications (or admin notifications)
// @route   GET /api/notifications
// @access  Private
// ─────────────────────────────────────────────
export const getNotifications = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? { target: 'admin' }
    : { user: req.user.id, target: 'user' };

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// ─────────────────────────────────────────────
// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
// ─────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? { _id: req.params.id, target: 'admin' }
    : { _id: req.params.id, user: req.user.id, target: 'user' };

  const notification = await Notification.findOneAndUpdate(
    query,
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ErrorResponse('Notification not found or access denied.', 404);
  }

  res.json({
    success: true,
    data: notification,
  });
});

// ─────────────────────────────────────────────
// @desc    Mark all user's notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
// ─────────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? { target: 'admin', isRead: false }
    : { user: req.user.id, target: 'user', isRead: false };

  await Notification.updateMany(query, { isRead: true });

  res.json({
    success: true,
    message: 'All notifications marked as read.',
  });
});

// ─────────────────────────────────────────────
// @desc    Delete a single notification from DB
// @route   DELETE /api/notifications/:id
// @access  Private
// ─────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? { _id: req.params.id, target: 'admin' }
    : { _id: req.params.id, user: req.user.id, target: 'user' };

  const notification = await Notification.findOneAndDelete(query);

  if (!notification) {
    throw new ErrorResponse('Notification not found or access denied.', 404);
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully from database.',
    id: req.params.id,
  });
});

// ─────────────────────────────────────────────
// @desc    Clear all notifications for user from DB
// @route   DELETE /api/notifications
// @access  Private
// ─────────────────────────────────────────────
export const clearAllNotifications = asyncHandler(async (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const query = isAdmin
    ? { target: 'admin' }
    : { user: req.user.id, target: 'user' };

  await Notification.deleteMany(query);

  res.json({
    success: true,
    message: 'All notifications cleared from database.',
  });
});
