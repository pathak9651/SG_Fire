import Notification from '../models/Notification.js';

/**
 * Creates a persistent notification in MongoDB.
 *
 * @param {Object} options
 * @param {string} [options.user] - Target user ID (required for client target)
 * @param {string} [options.target='user'] - 'user' | 'admin'
 * @param {string} [options.type='order'] - 'order' | 'appointment' | 'stock' | 'system'
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} [options.link=''] - Frontend link URL
 * @param {string} [options.order] - Associated Order ID
 * @param {string} [options.appointment] - Associated Appointment ID
 */
export const createNotification = async ({
  user,
  target = 'user',
  type = 'order',
  title,
  message,
  link = '',
  order,
  appointment,
}) => {
  try {
    const notification = await Notification.create({
      user: user || null,
      target,
      type,
      title,
      message,
      link,
      order: order || null,
      appointment: appointment || null,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};
