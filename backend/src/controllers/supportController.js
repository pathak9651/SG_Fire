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

// @desc    Request live chat support (sets status to 'open')
// @route   POST /api/support/request
// @access  Private
export const requestChat = asyncHandler(async (req, res) => {
  let ticket = await SupportTicket.findOne({ user: req.user.id }).populate('user', 'name email avatar');

  if (!ticket) {
    ticket = await SupportTicket.create({ user: req.user.id });
    ticket = await SupportTicket.findById(ticket._id).populate('user', 'name email avatar');
  }

  ticket.status = 'open';
  ticket.lastMessageAt = new Date();
  await ticket.save();

  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit('ticketUpdated', ticket);
  }

  res.json({ success: true, data: ticket });
});

// @desc    Accept a support ticket (sets status to 'in_progress')
// @route   PUT /api/support/tickets/:ticketId/accept
// @access  Private/Admin
export const acceptTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.ticketId).populate('user', 'name email avatar');

  if (!ticket) {
    throw new ErrorResponse('Ticket not found', 404);
  }

  ticket.status = 'in_progress';
  await ticket.save();

  const io = req.app.get('io');
  if (io) {
    const userId = ticket.user._id ? ticket.user._id.toString() : ticket.user.toString();
    io.to(`user_${userId}`).emit('chatAccepted', ticket);
    io.to('admins').emit('ticketUpdated', ticket);
  }

  res.json({ success: true, data: ticket });
});

// @desc    Close a support ticket (sets status to 'closed')
// @route   PUT /api/support/tickets/:ticketId/close
// @access  Private
export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.ticketId).populate('user', 'name email avatar');

  if (!ticket) {
    throw new ErrorResponse('Ticket not found', 404);
  }

  // If not admin, ensure the ticket belongs to the user
  const userId = ticket.user._id ? ticket.user._id.toString() : ticket.user.toString();
  if (req.user.role !== 'admin' && userId !== req.user.id.toString()) {
    throw new ErrorResponse('Not authorized to view this ticket', 403);
  }

  ticket.status = 'closed';
  await ticket.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`user_${userId}`).emit('chatClosed', ticket);
    io.to('admins').emit('ticketUpdated', ticket);
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
