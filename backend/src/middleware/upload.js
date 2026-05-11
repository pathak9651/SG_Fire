/**
 * ============================================================
 * FILE: middleware/upload.js
 * PURPOSE: Handles file uploads using Multer (in-memory storage) and
 *          uploads files directly to Cloudinary for cloud storage.
 *          Never saves files to local disk in production.
 *
 * WORKFLOW:
 *  1. Client sends multipart/form-data request with file(s)
 *  2. Multer processes the file into memory as a Buffer
 *  3. The Buffer is uploaded to Cloudinary using a stream
 *  4. Cloudinary returns a secure HTTPS URL + public_id
 *  5. The URL is stored in the database (Product.images, etc.)
 *
 * EXPORTED FUNCTIONS:
 *  - uploadToCloudinary()     : Uploads a single buffer to Cloudinary
 *  - deleteFromCloudinary()   : Deletes an image by public_id
 *  - uploadSingle(fieldName)  : Multer middleware for 1 file
 *  - uploadMultiple(fieldName, maxCount) : Multer middleware for multiple files
 *
 * USAGE:
 *   import { uploadMultiple, uploadToCloudinary } from '../middleware/upload.js';
 *   router.post('/product', protect, adminOnly, uploadMultiple('images', 5), addProduct);
 * ============================================================
 */

import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

// ─────────────────────────────────────────────
// MULTER CONFIGURATION
// Use memoryStorage: store files in RAM as Buffer,
// not on disk. This is required for direct Cloudinary streaming.
// ─────────────────────────────────────────────

/**
 * memoryStorage
 * -------------
 * Stores uploaded files in RAM (Buffer) instead of disk.
 * This allows us to stream files directly to Cloudinary
 * without creating temp files on the server.
 */
const storage = multer.memoryStorage();

/**
 * fileFilter()
 * ------------
 * Validates that uploaded files are allowed image types.
 * Rejects non-image files with a descriptive error.
 *
 * Allowed formats: JPEG, JPG, PNG, WEBP, SVG
 */
const fileFilter = (req, file, cb) => {
  // Check MIME type (e.g., image/jpeg, image/png)
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG images are allowed.'),
      false // Reject the file
    );
  }
};

/**
 * multerUpload
 * ------------
 * Configured Multer instance with:
 *  - storage: in-memory (RAM buffer)
 *  - fileFilter: images only
 *  - limits: max 5MB per file (prevents huge uploads)
 */
const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
});

// ─────────────────────────────────────────────
// CLOUDINARY UPLOAD FUNCTIONS
// ─────────────────────────────────────────────

/**
 * uploadToCloudinary()
 * --------------------
 * Uploads a file Buffer directly to Cloudinary using a stream.
 * Returns the secure URL and public_id for database storage.
 *
 * @param {Buffer} fileBuffer   - File data as a Buffer (from Multer memoryStorage)
 * @param {string} folder       - Cloudinary folder path (e.g., 'sgfire/products')
 * @param {Object} options      - Additional Cloudinary upload options
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadToCloudinary = (fileBuffer, folder = 'sgfire', options = {}) => {
  return new Promise((resolve, reject) => {
    // Create an upload stream to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,                         // Organizes files in Cloudinary dashboard
        resource_type: 'auto',          // Auto-detect image/video/raw
        transformation: [
          { quality: 'auto:good' },     // Auto-optimize image quality
          { fetch_format: 'auto' },     // Auto-serve WEBP/AVIF where supported
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
        // Return the secure HTTPS URL and public_id for future deletion
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // Pipe the Buffer into the Cloudinary upload stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * deleteFromCloudinary()
 * ----------------------
 * Deletes an image from Cloudinary by its public_id.
 * Called when: product deleted, image replaced, review image removed.
 *
 * @param {string} publicId - The public_id returned during upload
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return; // Skip if no public_id (DB stored)
  const result = await cloudinary.uploader.destroy(publicId);
  return result;
};

/**
 * bufferToBase64()
 * ----------------
 * Converts a file buffer to a Data URL (Base64).
 * Used for storing images directly in MongoDB when cloud storage is disabled.
 */
export const bufferToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
};

// ─────────────────────────────────────────────
// MULTER MIDDLEWARE EXPORTS
// ─────────────────────────────────────────────

/**
 * uploadSingle(fieldName)
 * -----------------------
 * Multer middleware for uploading a single file.
 * Use for: profile photo, banner image, single document.
 *
 * @param {string} fieldName - HTML form field name (e.g., 'image', 'photo')
 * @returns {Function} Multer middleware
 *
 * @example
 *   router.patch('/avatar', protect, uploadSingle('photo'), updateAvatar);
 */
export const uploadSingle = (fieldName) => multerUpload.single(fieldName);

/**
 * uploadMultiple(fieldName, maxCount)
 * ------------------------------------
 * Multer middleware for uploading multiple files under one field.
 * Use for: product images (up to 5), appointment site photos (up to 8).
 *
 * @param {string} fieldName - HTML form field name
 * @param {number} maxCount  - Maximum number of files allowed
 * @returns {Function} Multer middleware
 *
 * @example
 *   router.post('/product', protect, adminOnly, uploadMultiple('images', 5), addProduct);
 */
export const uploadMultiple = (fieldName, maxCount = 5) =>
  multerUpload.array(fieldName, maxCount);
