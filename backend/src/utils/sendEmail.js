/**
 * ============================================================
 * FILE: utils/sendEmail.js
 * PURPOSE: Centralized email sending utility using Nodemailer.
 *          Provides a reusable function and HTML email templates for:
 *          - OTP verification emails
 *          - Order confirmation emails
 *          - Appointment confirmation/status update emails
 *          - Password reset emails
 *          - Admin alert emails
 *
 * HOW IT WORKS:
 *  1. Creates a Nodemailer transporter using SMTP credentials from .env
 *  2. Accepts options object (to, subject, html template type)
 *  3. Renders the appropriate HTML template
 *  4. Sends the email via the SMTP transporter
 *
 * USAGE:
 *   import sendEmail from '../utils/sendEmail.js';
 *   await sendEmail({
 *     to: 'user@example.com',
 *     subject: 'Verify your email',
 *     template: 'otp',
 *     data: { otp: '123456', name: 'Rahul' }
 *   });
 * ============================================================
 */

import nodemailer from 'nodemailer';

/**
 * createTransporter()
 * -------------------
 * Creates a Nodemailer SMTP transporter using environment credentials.
 * The transporter manages the SMTP connection pool and retries.
 *
 * @returns {nodemailer.Transporter}
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // e.g., smtp.gmail.com
    port: parseInt(process.env.EMAIL_PORT) || 587, // 587 for TLS, 465 for SSL
    secure: process.env.EMAIL_PORT === '465', // true only for port 465 (SSL)
    auth: {
      user: process.env.EMAIL_USER,     // Your email address
      pass: process.env.EMAIL_PASS,     // Gmail App Password or SMTP password
    },
  });
};

// ─────────────────────────────────────────────
// HTML EMAIL TEMPLATES
// Each template returns a styled HTML string.
// ─────────────────────────────────────────────

/**
 * otpTemplate()
 * Purpose: Email sent to verify user email or for forgot-password OTP
 */
const otpTemplate = ({ name, otp }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔥 SG Fire</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Fire Safety Excellence</p>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px 0;">Email Verification</h2>
      <p style="color: #4a4a4a; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
      <p style="color: #4a4a4a; line-height: 1.6;">Your One-Time Password (OTP) for SG Fire account verification is:</p>
      <div style="background: #fef2f2; border: 2px dashed #dc2626; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 42px; font-weight: bold; color: #dc2626; letter-spacing: 10px;">${otp}</span>
      </div>
      <p style="color: #4a4a4a; line-height: 1.6;">⏰ This OTP is valid for <strong>10 minutes</strong> only.</p>
      <p style="color: #4a4a4a; line-height: 1.6;">If you didn't request this, please ignore this email.</p>
    </div>
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SG Fire. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * orderConfirmTemplate()
 * Purpose: Sent to user after successful order placement
 */
const orderConfirmTemplate = ({ name, orderId, totalAmount, items }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔥 SG Fire</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #16a34a;">✅ Order Confirmed!</h2>
      <p>Hello <strong>${name}</strong>, your order has been placed successfully.</p>
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
        <p><strong>Estimated Delivery:</strong> 5–7 business days</p>
      </div>
      <p>You can track your order from your <a href="${process.env.CLIENT_URL}/dashboard/orders" style="color: #dc2626;">dashboard</a>.</p>
    </div>
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SG Fire. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * appointmentTemplate()
 * Purpose: Sent to user after booking a service appointment
 */
const appointmentTemplate = ({ name, serviceType, date, time, appointmentId }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔥 SG Fire</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a;">📅 Appointment Booked</h2>
      <p>Hello <strong>${name}</strong>, your service appointment has been booked.</p>
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p><strong>Appointment ID:</strong> #${appointmentId}</p>
        <p><strong>Service Type:</strong> ${serviceType}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Status:</strong> Pending Approval</p>
      </div>
      <p>Our team will review and approve your appointment within 24 hours.</p>
    </div>
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SG Fire. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * passwordResetTemplate()
 * Purpose: Sent when user requests a password reset link
 */
const passwordResetTemplate = ({ name, resetUrl }) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔥 SG Fire</h1>
    </div>
    <div style="padding: 40px 30px;">
      <h2 style="color: #1a1a1a;">🔐 Reset Your Password</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your SG Fire account password. Click the button below to reset it.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #dc2626; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">⏰ This link expires in <strong>15 minutes</strong>.</p>
      <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
    </div>
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #888; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} SG Fire. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * contactTemplate()
 * Purpose: Sent to the SG Fire admin inbox when a visitor submits the contact form
 */
const contactTemplate = ({ name, email, phone, subject, message }) => `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 28px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🔥 SG Fire</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0;">New Contact Form Inquiry</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; margin: 0 0 20px 0;">${subject}</h2>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px; margin-bottom: 22px;">
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>Name:</strong> ${name}</p>
        <p style="margin: 0 0 10px 0; color: #374151;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #dc2626;">${email}</a></p>
        <p style="margin: 0; color: #374151;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      </div>
      <p style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Message</p>
      <div style="white-space: pre-wrap; color: #111827; line-height: 1.6; background: #fff7ed; border-left: 4px solid #ea580c; padding: 18px; border-radius: 8px;">${message}</div>
    </div>
    <div style="background: #111827; padding: 18px; text-align: center;">
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">Reply directly to this email to contact the customer.</p>
    </div>
  </div>
`;

// Map template names to their functions for easy lookup
const templates = {
  otp: otpTemplate,
  orderConfirm: orderConfirmTemplate,
  appointment: appointmentTemplate,
  passwordReset: passwordResetTemplate,
  contact: contactTemplate,
};

/**
 * sendEmail()
 * -----------
 * Main email sending function. Selects the right template,
 * renders it with the provided data, and sends via SMTP.
 *
 * @param {Object} options
 * @param {string} options.to       - Recipient email address
 * @param {string} options.subject  - Email subject line
 * @param {string} options.template - Template name: 'otp' | 'orderConfirm' | 'appointment' | 'passwordReset'
 * @param {Object} options.data     - Data to pass into the template
 * @returns {Promise<void>}
 */
const sendEmail = async ({ to, subject, template, data, replyTo }) => {
  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error(`Unknown email template: "${template}"`);
  }

  const html = templateFn(data);
  const hasSmtpCredentials =
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    !process.env.EMAIL_USER.startsWith('your_') &&
    !process.env.EMAIL_PASS.startsWith('your_');

  if (!hasSmtpCredentials) {
    console.log('----------------------------------------------------');
    console.log(`📧 MOCK EMAIL SENT TO: ${to}`);
    console.log(`📌 SUBJECT: ${subject}`);
    if (replyTo) console.log(`↩️ REPLY TO: ${replyTo}`);
    if (data.otp) console.log(`🔑 OTP: ${data.otp}`);
    console.log('----------------------------------------------------');
    return { mocked: true };
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || `SG Fire <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    ...(replyTo && { replyTo }),
  };

  const info = await transporter.sendMail(mailOptions);
  return { mocked: false, messageId: info.messageId };
};

export default sendEmail;
