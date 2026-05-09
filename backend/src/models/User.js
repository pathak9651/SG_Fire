/**
 * ============================================================
 * FILE: models/User.js
 * PURPOSE: Defines the MongoDB schema and model for Users.
 *          Stores all user account information including:
 *          - Profile data (name, email, phone, avatar)
 *          - Authentication data (password hash, OTP, tokens)
 *          - Role-based access control (user, admin, technician)
 *          - Saved addresses and wishlist items
 *          - Account status (blocked, verified)
 *
 * USED BY: authController.js, userController.js, adminController.js
 * ============================================================
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * addressSchema
 * -------------
 * Sub-document schema for user delivery addresses.
 * Users can save multiple addresses (home, office, etc.)
 */
const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'office', 'other'], // Predefined address types
    default: 'home',
  },
  fullName: { type: String, required: true },     // Recipient name for this address
  phone: { type: String, required: true },         // Delivery contact number
  addressLine1: { type: String, required: true },  // House/flat number, building name
  addressLine2: { type: String },                  // Street, area, locality (optional)
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },        // 6-digit Indian postal code
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },     // Flag for default delivery address
});

/**
 * userSchema
 * ----------
 * Main User document schema.
 */
const userSchema = new mongoose.Schema(
  {
    // ── Basic Profile Information ──────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,                 // Remove leading/trailing spaces
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,               // No two users can have the same email
      lowercase: true,            // Always store email in lowercase
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },

    // ── Authentication ─────────────────────────────────────
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,              // Never returned in queries by default (security)
    },

    // ── Profile Picture ────────────────────────────────────
    avatar: {
      url: { type: String, default: '' },          // Cloudinary image URL
      public_id: { type: String, default: '' },    // Cloudinary public_id for deletion
    },

    // ── Role-Based Access Control ─────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin', 'technician'],        // Allowed roles in the system
      default: 'user',                              // New registrations start as 'user'
    },

    // ── OTP Verification ──────────────────────────────────
    // OTP is used for email verification and phone verification
    otp: {
      type: String,
      select: false,              // Never return OTP in API responses
    },
    otpExpiry: {
      type: Date,
      select: false,              // Never return OTP expiry in API responses
    },

    // ── Account Status ─────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,             // User must verify email before full access
    },
    isBlocked: {
      type: Boolean,
      default: false,             // Admin can block users for policy violations
    },

    // ── Password Reset ─────────────────────────────────────
    // Hashed token sent to email for password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },

    // ── Google OAuth ───────────────────────────────────────
    googleId: { type: String },   // Google OAuth user ID (null for email/password users)

    // ── Saved Addresses ───────────────────────────────────
    // Array of address sub-documents (max 5 addresses per user)
    addresses: {
      type: [addressSchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'You can save a maximum of 5 addresses',
      },
    },

    // ── Wishlist ──────────────────────────────────────────
    // Array of Product ObjectIds the user has wishlisted
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',           // References the Product model
      },
    ],

    // ── Notification Preferences ─────────────────────────
    notifications: {
      email: { type: Boolean, default: true },   // Receive order/appointment emails
      sms: { type: Boolean, default: false },    // SMS notifications
      push: { type: Boolean, default: true },    // Browser push notifications
    },
  },
  {
    // ── Schema Options ────────────────────────────────────
    timestamps: true,            // Auto-add createdAt and updatedAt fields
    toJSON: { virtuals: true },  // Include virtual fields in JSON output
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────
// MONGOOSE MIDDLEWARE (Pre-save Hooks)
// ─────────────────────────────────────────────

/**
 * Pre-save Hook: Hash password before saving
 * ------------------------------------------
 * Automatically hashes the user's password using bcrypt
 * before the document is saved to MongoDB.
 *
 * WHY bcrypt?
 * - bcrypt is a one-way hashing algorithm designed specifically for passwords
 * - Salt rounds (10) make it computationally expensive to brute-force
 * - Even if the database is compromised, passwords cannot be reversed
 *
 * NOTE: Only runs if the password field was modified.
 * This prevents re-hashing on profile updates (name, email changes).
 */
userSchema.pre('save', async function () {
  // Skip hashing if password wasn't changed
  if (!this.isModified('password')) return;

  // Hash password with salt rounds = 12 (good security/performance balance)
  this.password = await bcrypt.hash(this.password, 12);
});

// ─────────────────────────────────────────────
// INSTANCE METHODS
// Called on individual user documents
// ─────────────────────────────────────────────

/**
 * comparePassword()
 * -----------------
 * Compares a plain-text password with the stored bcrypt hash.
 * Used in authController during login.
 *
 * @param {string} enteredPassword - Plain text password from login form
 * @returns {Promise<boolean>} true if match, false if wrong password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare() handles the salt internally
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * generateOTP()
 * -------------
 * Generates a 6-digit numeric OTP, hashes it, and sets expiry.
 * Returns the PLAIN OTP to send in the email/SMS.
 * Stores only the HASHED OTP in the database for security.
 *
 * @returns {string} 6-digit plain OTP to send to the user
 */
userSchema.methods.generateOTP = async function () {
  // Generate a random 6-digit number
  const plainOTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP before storing (so raw OTP is never in the DB)
  this.otp = await bcrypt.hash(plainOTP, 10);

  // OTP expires in 10 minutes
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  return plainOTP; // Return plain OTP to send via email/SMS
};

/**
 * verifyOTP()
 * -----------
 * Checks if the provided OTP matches the stored hash and hasn't expired.
 *
 * @param {string} enteredOTP - OTP entered by the user
 * @returns {Promise<boolean>} true if valid, false if invalid/expired
 */
userSchema.methods.verifyOTP = async function (enteredOTP) {
  // Check expiry first (faster than hash comparison)
  if (this.otpExpiry < new Date()) return false;

  // Compare entered OTP with stored hash
  return await bcrypt.compare(enteredOTP, this.otp);
};

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

export default User;
