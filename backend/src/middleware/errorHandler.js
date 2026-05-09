/**
 * ============================================================
 * FILE: middleware/errorHandler.js
 * PURPOSE: Centralized error handling middleware for the entire
 *          Express application. Catches all errors thrown by
 *          controllers and sends a consistent, structured JSON
 *          error response to the client.
 *
 * WHY CENTRALIZED ERROR HANDLING?
 * - Avoids try-catch blocks in every route handler
 * - Ensures consistent error response format across all endpoints
 * - Handles Mongoose-specific errors (validation, cast, duplicate)
 * - Hides internal error details in production for security
 *
 * HOW IT WORKS:
 * - Controllers use: next(new ErrorResponse('message', statusCode))
 * - Or simply: throw new Error('message') (caught by asyncHandler)
 * - This middleware intercepts all errors and formats the response
 *
 * USAGE in server.js (MUST be registered AFTER all routes):
 *   app.use(errorHandler);
 * ============================================================
 */

/**
 * ErrorResponse Class
 * -------------------
 * Custom Error class that extends native Error.
 * Adds a statusCode property so we can control HTTP response codes.
 *
 * @example
 *   throw new ErrorResponse('Product not found', 404);
 *   throw new ErrorResponse('Unauthorized access', 401);
 */
export class ErrorResponse extends Error {
  /**
   * @param {string} message    - Human-readable error description
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 500)
   */
  constructor(message, statusCode) {
    super(message); // Call native Error constructor with message
    this.statusCode = statusCode;
  }
}

/**
 * asyncHandler()
 * --------------
 * HOF (Higher-Order Function) that wraps async route handlers.
 * Automatically catches any thrown errors and passes them to next().
 * This eliminates the need for try-catch in every controller function.
 *
 * WITHOUT asyncHandler: You need try-catch in every controller
 * WITH asyncHandler: Just throw errors — this catches them for you
 *
 * @param {Function} fn - Async controller function
 * @returns {Function}  Express middleware function
 *
 * @example
 *   export const getProduct = asyncHandler(async (req, res, next) => {
 *     const product = await Product.findById(req.params.id);
 *     if (!product) throw new ErrorResponse('Product not found', 404);
 *     res.json({ success: true, data: product });
 *   });
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * errorHandler()
 * --------------
 * Express error-handling middleware. Must have exactly 4 parameters
 * (err, req, res, next) for Express to recognize it as error middleware.
 *
 * Handles the following Mongoose/MongoDB error types:
 *  - CastError      : Invalid MongoDB ObjectId (e.g., malformed product ID in URL)
 *  - ValidationError: Mongoose schema validation failure
 *  - Code 11000     : MongoDB duplicate key error (unique field conflict)
 *
 * @param {Error}    err  - The error object
 * @param {Request}  req  - Express request object
 * @param {Response} res  - Express response object
 * @param {Function} next - Express next middleware
 */
const errorHandler = (err, req, res, next) => {
  // Clone the error to avoid mutating the original
  let error = { ...err };
  error.message = err.message;

  // ── Handle Mongoose CastError (invalid ID format) ──
  // Triggered when: /api/products/not-a-valid-id
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // ── Handle Mongoose Duplicate Key Error (unique constraint) ──
  // Triggered when: Creating a user with an email that already exists
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]; // Which field caused the duplicate
    const message = `Duplicate value entered for field: ${field}`;
    error = new ErrorResponse(message, 400);
  }

  // ── Handle Mongoose Validation Error ──
  // Triggered when: Required fields are missing or data doesn't match schema
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message) // Extract all validation messages
      .join(', ');
    error = new ErrorResponse(message, 400);
  }

  // ── Handle JWT Errors ──
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token. Please login again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token has expired. Please login again.', 401);
  }

  // Log full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  // Send the final error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    // Include stack trace only in development (never expose in production)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
