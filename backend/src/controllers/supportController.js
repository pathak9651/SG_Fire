import SupportTicket from '../models/SupportTicket.js';
import Message from '../models/Message.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';

// @desc    Get user's support ticket (create if not exists)
// @route   GET /api/support/my-ticket
// @access  Private
export const getMyTicket = asyncHandler(async (req, res) => {
  let ticket = await SupportTicket.findOne({ user: req.user.id });

  if (!ticket) {
    ticket = await SupportTicket.create({ user: req.user.id });
  }

  res.json({ success: true, data: ticket });
});

// @desc    Get all active support tickets
// @route   GET /api/support/tickets
// @access  Private/Admin
export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate('user', 'name email avatar')
    .sort('-lastMessageAt');
  
  res.json({ success: true, data: tickets });
});

// @desc    Get messages for a ticket
// @route   GET /api/support/tickets/:ticketId/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.ticketId);

  if (!ticket) {
    throw new ErrorResponse('Ticket not found', 404);
  }

  // If not admin, ensure the ticket belongs to the user
  if (req.user.role !== 'admin' && ticket.user.toString() !== req.user.id.toString()) {
    throw new ErrorResponse('Not authorized to view this ticket', 403);
  }

  const messages = await Message.find({ ticket: req.params.ticketId })
    .populate('sender', 'name avatar role')
    .sort('createdAt');

  // Mark as read (if admin reading user msg, or user reading admin msg)
  await Message.updateMany(
    { 
      ticket: req.params.ticketId, 
      isAdmin: req.user.role !== 'admin', 
      read: false 
    },
    { read: true }
  );

  res.json({ success: true, data: messages });
});
