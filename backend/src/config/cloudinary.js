/**
 * ============================================================
 * FILE: config/cloudinary.js
 * PURPOSE: Configures the Cloudinary SDK for image/file uploads.
 *          Cloudinary is used to store and serve all media files:
 *          - Product images
 *          - Banner images
 *          - Appointment site images
 *          - User profile photos
 * USAGE: Import this file wherever you need to upload to Cloudinary.
 *        The middleware/upload.js file uses this configuration.
 * ============================================================
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * cloudinary.config()
 * -------------------
 * Initializes the Cloudinary SDK with credentials from environment variables.
 * Must be called before any upload/delete operations.
 *
 * cloud_name  : Your unique Cloudinary account identifier
 * api_key     : Public key used to identify your account in API requests
 * api_secret  : Private key used to sign upload requests (keep secret!)
 * secure      : Forces HTTPS URLs for all returned image/video URLs
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always return HTTPS URLs for security
});

export default cloudinary;
