/**
 * ============================================================
 * FILE: routes/appointment.routes.js
 * PURPOSE: Service appointment booking and management routes.
 * BASE PATH: /api/appointments (mounted in server.js)
 * ============================================================
 */

import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  getAllAppointments,
  approveAppointment,
  rejectAppointment,
  assignTechnician,
  completeAppointment,
} from '../controllers/appointmentController.js';
import { protect, adminOnly, authorize } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All appointment routes require authentication

// ── Customer Routes ────────────────────────────────────────
router.post('/', uploadMultiple('siteImages', 8), bookAppointment); // Book with site photos
router.get('/my', getMyAppointments);                               // User's appointments
router.get('/:id', getAppointmentById);                             // Single detail
router.post('/:id/cancel', cancelAppointment);                      // Cancel booking

// ── Admin/Technician Routes ────────────────────────────────
router.get('/', adminOnly, getAllAppointments);                      // All appointments
router.patch('/:id/approve', adminOnly, approveAppointment);        // Approve
router.patch('/:id/reject', adminOnly, rejectAppointment);          // Reject with reason
router.patch('/:id/assign', adminOnly, assignTechnician);           // Assign technician
// Both admin and technician can mark as complete
router.patch('/:id/complete', authorize('admin', 'technician'), completeAppointment);

export default router;
