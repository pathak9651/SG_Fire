/**
 * ============================================================
 * FILE: models/Appointment.js
 * PURPOSE: Defines the MongoDB schema for service appointments.
 *          Customers book fire safety installation, inspection,
 *          maintenance, or emergency services through this model.
 *
 * APPOINTMENT LIFECYCLE:
 *  pending → approved → assigned (technician) → in_progress → completed
 *          ↓
 *       rejected (with reason)
 *
 * SERVICE TYPES:
 *  - Installation  : New fire safety equipment installation
 *  - Inspection    : Annual inspection of existing equipment
 *  - Maintenance   : Regular maintenance and refilling
 *  - AMC           : Annual Maintenance Contract services
 *  - Emergency     : Urgent on-site fire safety response
 *  - Consultation  : Professional fire safety assessment
 *
 * USED BY: appointmentController.js, adminController.js
 * ============================================================
 */

import mongoose from 'mongoose';

/**
 * serviceAddressSchema
 * --------------------
 * The site address where the service will be performed.
 * Different from the user's default delivery address.
 */
const serviceAddressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },             // Helpful for technician to locate the place
  siteType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'other'],
    default: 'residential',
  },
});

/**
 * appointmentSchema
 * -----------------
 * Main Appointment document schema.
 */
const appointmentSchema = new mongoose.Schema(
  {
    // ── Appointment Reference Number ───────────────────────
    appointmentNumber: {
      type: String,
      unique: true,
      // Generated in controller: 'APT-' + timestamp (e.g., APT-20240115-K8P3)
    },

    // ── Customer ───────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ── Contact Details (pre-filled from profile, can be overridden) ──
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String },

    // ── Service Details ────────────────────────────────────
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      // Support both short codes and full display names
      enum: [
        'Fire Safety Audit',
        'System Installation',
        'AMC & Maintenance',
        'Corporate Training',
        'Emergency Consultation',
        'installation',
        'inspection',
        'maintenance',
        'amc',
        'emergency',
        'consultation',
        'repair',
      ],
    },

    // ── Related Products (optional) ────────────────────────
    // Products that need to be installed or serviced
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    // ── Scheduling ─────────────────────────────────────────
    preferredDate: {
      type: Date,
      required: [true, 'Preferred appointment date is required'],
    },

    preferredTime: {
      type: String,
      required: [true, 'Preferred appointment time is required'],
      // Flexible time string (frontend provides free-text or range)
    },

    // ── Service Location ───────────────────────────────────
    serviceAddress: { type: String, required: true },

    // ── Additional Information ─────────────────────────────
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },

    // ── Site Images ────────────────────────────────────────
    // Customer can upload photos of the site for better assessment
    siteImages: [
      {
        url: { type: String },         // Cloudinary URL
        public_id: { type: String },   // For deletion
      },
    ],

    // ── Appointment Status ─────────────────────────────────
    status: {
      type: String,
      enum: [
        'pending',       // Just booked, awaiting admin review
        'approved',      // Admin confirmed the appointment
        'rejected',      // Admin rejected (with reason)
        'assigned',      // Technician has been assigned
        'in_progress',   // Technician is on-site
        'completed',     // Service successfully completed
        'cancelled',     // Customer cancelled the appointment
        'rescheduled',   // Date/time was changed
      ],
      default: 'pending',
    },

    // ── Rejection Reason ───────────────────────────────────
    rejectionReason: {
      type: String,
      // Set by admin when status is changed to 'rejected'
    },

    // ── Technician Assignment ──────────────────────────────
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Assigned by admin from users with role: 'technician'
    },

    technicianNotes: {
      type: String,   // Notes from the technician after site visit
    },

    // ── Service Completion ─────────────────────────────────
    completedAt: { type: Date },        // When service was completed
    completionReport: { type: String }, // Summary of work done

    // ── Billing ────────────────────────────────────────────
    estimatedCost: { type: Number },    // Cost estimate given to customer
    actualCost: { type: Number },       // Final cost after service

    // ── AMC Specific ───────────────────────────────────────
    // Only relevant when serviceType === 'amc'
    amcStartDate: { type: Date },
    amcEndDate: { type: Date },
    amcRenewalReminder: { type: Boolean, default: true },  // Send reminder before expiry

    // ── Emergency Priority ─────────────────────────────────
    isEmergency: {
      type: Boolean,
      default: false,   // Emergency appointments get priority assignment
    },

    // ── Status History ─────────────────────────────────────
    statusHistory: [
      {
        status: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
appointmentSchema.index({ user: 1, createdAt: -1 });         // User's appointment history
appointmentSchema.index({ status: 1 });                       // Admin status filtering
appointmentSchema.index({ technician: 1, status: 1 });        // Technician's appointments
appointmentSchema.index({ preferredDate: 1 });                // Calendar view queries
appointmentSchema.index({ isEmergency: 1, status: 1 });       // Emergency appointment queue

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
