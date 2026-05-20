/**
 * ============================================================
 * FILE: controllers/appointmentController.js
 * PURPOSE: Manages fire safety service appointments end-to-end.
 *          Handles booking, admin approval/rejection, technician
 *          assignment, and status tracking.
 *
 * ROUTES (defined in routes/appointment.routes.js):
 *  POST   /api/appointments           - Book new appointment
 *  GET    /api/appointments/my        - User's appointment history
 *  GET    /api/appointments/:id       - Get single appointment
 *  PUT    /api/appointments/:id       - Update appointment (user)
 *  POST   /api/appointments/:id/cancel - Cancel appointment
 *  GET    /api/appointments (admin)   - Get all appointments
 *  PATCH  /api/appointments/:id/approve (admin) - Approve
 *  PATCH  /api/appointments/:id/reject  (admin) - Reject
 *  PATCH  /api/appointments/:id/assign  (admin) - Assign technician
 *  PATCH  /api/appointments/:id/complete (admin) - Mark completed
 * ============================================================
 */

import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { asyncHandler, ErrorResponse } from '../middleware/errorHandler.js';
import sendEmail from '../utils/sendEmail.js';
import { bufferToBase64 } from '../middleware/upload.js';

// Helper: Generate appointment number (e.g., APT-20240115-K8P3)
const generateAppointmentNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APT-${date}-${random}`;
};

// ─────────────────────────────────────────────
// @desc    Book a new service appointment
// @route   POST /api/appointments
// @access  Private
// ─────────────────────────────────────────────
export const bookAppointment = asyncHandler(async (req, res) => {
  const {
    serviceType, preferredDate, preferredTime,
    serviceAddress, contactName, contactPhone, contactEmail,
    notes, relatedProducts, isEmergency,
  } = req.body;

  // Convert site images to Base64 for MongoDB storage
  const siteImages = req.files && req.files.length > 0
    ? req.files.map((file) => ({
        url: bufferToBase64(file),
      }))
    : [];

  const appointment = await Appointment.create({
    appointmentNumber: generateAppointmentNumber(),
    user: req.user.id,
    contactName,
    contactPhone,
    contactEmail,
    serviceType,
    preferredDate: new Date(preferredDate),
    preferredTime,
    serviceAddress,
    notes,
    siteImages,
    relatedProducts,
    isEmergency: isEmergency || false,
    statusHistory: [
      {
        status: 'pending',
        message: 'Appointment booked by customer',
        timestamp: new Date(),
        updatedBy: req.user.id,
      },
    ],
  });

  // Send confirmation email to customer
  try {
    await sendEmail({
      to: contactEmail || req.user.email,
      subject: `Appointment Booked — #${appointment.appointmentNumber}`,
      template: 'appointment',
      data: {
        name: contactName,
        serviceType,
        date: new Date(preferredDate).toDateString(),
        time: preferredTime,
        appointmentId: appointment.appointmentNumber,
      },
    });
  } catch (e) {
    console.error('Appointment email failed:', e.message);
  }

  res.status(201).json({ success: true, data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Get current user's appointments
// @route   GET /api/appointments/my
// @access  Private
// ─────────────────────────────────────────────
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ user: req.user.id })
    .sort('-createdAt')
    .populate('technician', 'name phone')
    .select('-statusHistory');

  res.json({ success: true, count: appointments.length, data: appointments });
});

// ─────────────────────────────────────────────
// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private (owner or admin)
// ─────────────────────────────────────────────
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('technician', 'name phone email');

  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  // Only owner or admin can view
  if (
    appointment.user._id.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw new ErrorResponse('Not authorized to view this appointment.', 403);
  }

  res.json({ success: true, data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Cancel an appointment
// @route   POST /api/appointments/:id/cancel
// @access  Private
// ─────────────────────────────────────────────
export const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  if (appointment.user.toString() !== req.user.id) {
    throw new ErrorResponse('Not authorized.', 403);
  }

  const nonCancellable = ['completed', 'cancelled', 'in_progress'];
  if (nonCancellable.includes(appointment.status)) {
    throw new ErrorResponse(`Cannot cancel an appointment with status: '${appointment.status}'.`, 400);
  }

  appointment.status = 'cancelled';
  appointment.statusHistory.push({
    status: 'cancelled',
    message: req.body.reason || 'Cancelled by customer',
    timestamp: new Date(),
    updatedBy: req.user.id,
  });
  await appointment.save();

  res.json({ success: true, message: 'Appointment cancelled.', data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Get ALL appointments (Admin dashboard)
// @route   GET /api/appointments
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, serviceType, date } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (serviceType) filter.serviceType = serviceType;
  if (date) {
    // Filter by a specific date (appointments with preferredDate on that day)
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.preferredDate = { $gte: start, $lt: end };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('technician', 'name phone')
      .sort({ isEmergency: -1, createdAt: -1 }) // Emergency appointments first
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: appointments,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  });
});

// ─────────────────────────────────────────────
// @desc    Approve an appointment
// @route   PATCH /api/appointments/:id/approve
// @access  Private (Admin only)
// ─────────────────────────────────────────────
export const approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name email');
  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);
  if (appointment.status !== 'pending') {
    throw new ErrorResponse('Only pending appointments can be approved.', 400);
  }

  appointment.status = 'approved';
  appointment.statusHistory.push({
    status: 'approved',
    message: 'Appointment approved by admin',
    timestamp: new Date(),
    updatedBy: req.user.id,
  });
  await appointment.save();

  res.json({ success: true, data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Reject an appointment
// @route   PATCH /api/appointments/:id/reject
// @access  Private (Admin only)
// Body: { reason }
// ─────────────────────────────────────────────
export const rejectAppointment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) throw new ErrorResponse('Rejection reason is required.', 400);

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  appointment.status = 'rejected';
  appointment.rejectionReason = reason;
  appointment.statusHistory.push({
    status: 'rejected',
    message: reason,
    timestamp: new Date(),
    updatedBy: req.user.id,
  });
  await appointment.save();

  res.json({ success: true, data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Assign technician to appointment
// @route   PATCH /api/appointments/:id/assign
// @access  Private (Admin only)
// Body: { technicianId }
// ─────────────────────────────────────────────
export const assignTechnician = asyncHandler(async (req, res) => {
  const { technicianId } = req.body;

  // Validate technician exists and has correct role
  const technician = await User.findById(technicianId);
  if (!technician || technician.role !== 'technician') {
    throw new ErrorResponse('Invalid technician ID or user is not a technician.', 400);
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      technician: technicianId,
      status: 'assigned',
      $push: {
        statusHistory: {
          status: 'assigned',
          message: `Technician ${technician.name} assigned`,
          timestamp: new Date(),
          updatedBy: req.user.id,
        },
      },
    },
    { new: true }
  ).populate('technician', 'name phone');

  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  res.json({ success: true, data: appointment });
});

// ─────────────────────────────────────────────
// @desc    Mark appointment as completed
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Admin or Technician)
// Body: { completionReport, actualCost }
// ─────────────────────────────────────────────
export const completeAppointment = asyncHandler(async (req, res) => {
  const { completionReport, actualCost, technicianNotes } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    throw new ErrorResponse('This appointment cannot be completed in its current state.', 400);
  }

  if (req.user.role === 'technician') {
    const assignedTechnicianId = appointment.technician?.toString();
    if (!assignedTechnicianId || assignedTechnicianId !== req.user.id.toString()) {
      throw new ErrorResponse('You are not assigned to this appointment.', 403);
    }

    if (!['assigned', 'approved', 'in_progress'].includes(appointment.status)) {
      throw new ErrorResponse('Technicians can only complete assigned appointments.', 400);
    }
  }

  appointment.status = 'completed';
  appointment.completedAt = new Date();
  appointment.completionReport = completionReport;
  appointment.actualCost = actualCost;
  appointment.technicianNotes = technicianNotes;
  appointment.statusHistory.push({
    status: 'completed',
    message: 'Service completed successfully',
    timestamp: new Date(),
    updatedBy: req.user.id,
  });

  await appointment.save();

  res.json({ success: true, data: appointment });
});

export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { preferredDate, preferredTime, message } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ErrorResponse('Appointment not found.', 404);

  appointment.preferredDate = new Date(preferredDate);
  appointment.preferredTime = preferredTime;
  appointment.status = 'pending'; // Reset status to pending after reschedule
  appointment.statusHistory.push({
    status: 'pending',
    message: message || 'Appointment rescheduled by admin',
    timestamp: new Date(),
    updatedBy: req.user.id,
  });
  await appointment.save();

  res.json({ success: true, data: appointment });
});