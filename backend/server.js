/**
 * ============================================================
 * FILE: server.js
 * PURPOSE: Main Express application entry point.
 *          Sets up all middleware, mounts all API routes,
 *          connects to MongoDB, and starts the HTTP server.
 *
 * MIDDLEWARE ORDER (important — order matters in Express):
 *  1. Security middleware (helmet, cors, rate limiting)
 *  2. Body parsers (json, urlencoded, cookies)
 *  3. Request logger (morgan — development only)
 *  4. API Routes
 *  5. 404 handler (catch-all for unknown routes)
 *  6. Centralized error handler (must be last)
 *
 * HOW TO RUN:
 *  Development: npm run dev  (nodemon with hot reload)
 *  Production:  npm start    (node directly)
 * ============================================================
 */

import 'dotenv/config'; // Must be the absolute first import!
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { mongoSanitize } from './src/middleware/mongoSanitize.js';

// ── Load Environment Variables ─────────────────────────────
// Already loaded via import 'dotenv/config' above

// ── Database Connection ────────────────────────────────────
import connectDB from './src/config/db.js';
connectDB();

// ── Route Imports ──────────────────────────────────────────
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import userRoutes from './src/routes/user.routes.js';
import supportRoutes from './src/routes/support.routes.js';
import contactRoutes from './src/routes/contact.routes.js';

// ── Middleware Imports ─────────────────────────────────────
import errorHandler, { ErrorResponse } from './src/middleware/errorHandler.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';

// ── Initialize Express App ─────────────────────────────────
const app = express();

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// Applied first to protect all subsequent operations
// ─────────────────────────────────────────────

/**
 * helmet(): Sets security HTTP headers automatically.
 * Prevents: XSS, clickjacking, content sniffing, etc.
 * Example headers set: X-XSS-Protection, X-Frame-Options, etc.
 */
app.use(helmet());

/**
 * CORS (Cross-Origin Resource Sharing)
 * Allows only the frontend domain to make API requests.
 * credentials: true is required to send/receive HTTP-only cookies.
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, postman, curl)
      if (!origin) return callback(null, true);
      
      const isDev = process.env.NODE_ENV === 'development';
      if (
        isDev || 
        allowedOrigins.includes(origin) ||
        (isDev && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))
      ) {
        return callback(null, true);
      }
      
      return callback(new ErrorResponse('Not allowed by CORS', 403));
    },
    credentials: true,        // Required for HTTP-only cookie exchange
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


/**
 * generalLimiter: Applies rate limiting to ALL routes.
 * 100 requests per 15 minutes per IP address.
 * Specific routes (login, OTP) have stricter limits defined in their routes.
 */
app.use('/api', generalLimiter);

// ─────────────────────────────────────────────
// BODY PARSING MIDDLEWARE
// ─────────────────────────────────────────────

// Parse incoming JSON request bodies (req.body)
// limit: '10mb' allows large product descriptions but prevents payload bombs
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data (e.g., HTML form submissions)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parse HTTP-only cookies from request headers (req.cookies)
// Required for JWT cookie authentication
app.use(cookieParser());

// Sanitize user-supplied data to prevent NoSQL injection attacks
app.use(mongoSanitize);

// ─────────────────────────────────────────────
// REQUEST LOGGING (Development only)
// ─────────────────────────────────────────────

/**
 * morgan('dev'): Logs each request with method, URL, status, and response time.
 * Only enabled in development to avoid cluttering production logs.
 * Example output: GET /api/products 200 45.23 ms
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─────────────────────────────────────────────
// HEALTH CHECK ROUTE
// Simple endpoint to verify the server is running.
// Used by deployment platforms (Render, Railway) for health monitoring.
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─────────────────────────────────────────────
// API ROUTES
// All routes are prefixed with /api for clarity.
// Each route file handles its own sub-paths.
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);              // Authentication: /api/auth/...
app.use('/api/products', productRoutes);       // Products: /api/products/...
app.use('/api/cart', cartRoutes);              // Cart: /api/cart/...
app.use('/api/orders', orderRoutes);           // Orders: /api/orders/...
app.use('/api/appointments', appointmentRoutes); // Appointments: /api/appointments/...
app.use('/api/admin', adminRoutes);            // Admin dashboard: /api/admin/...
app.use('/api/categories', categoryRoutes);    // Categories: /api/categories/...
app.use('/api/users', userRoutes);             // User profile/wishlist: /api/users/...
app.use('/api/support', supportRoutes);        // Support chat: /api/support/...
app.use('/api/contact', contactRoutes);        // Contact form: /api/contact

// ─────────────────────────────────────────────
// 404 HANDLER
// Catch-all for any request that doesn't match a defined route.
// Must be placed AFTER all route definitions.
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  next(new ErrorResponse(`Route '${req.originalUrl}' not found on this server.`, 404));
});

// ─────────────────────────────────────────────
// CENTRALIZED ERROR HANDLER
// Must be the LAST middleware registered.
// Express recognizes it as an error handler due to the 4-param signature (err, req, res, next).
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🔥 SG Fire API Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// ─────────────────────────────────────────────
// SOCKET.IO SETUP
// ─────────────────────────────────────────────
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import SupportTicket from './src/models/SupportTicket.js';

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? true : (process.env.CLIENT_URL || 'http://localhost:3000'),
    credentials: true,
  },
});

app.set('io', io);

io.use(async (socket, next) => {
  try {
    const cookieString = socket.handshake.headers.cookie || '';
    const tokenStr = cookieString.split(';').find(c => c.trim().startsWith('accessToken='));
    if (!tokenStr) return next(new Error('Authentication error'));
    
    const token = tokenStr.split('=')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = await User.findById(decoded.id).select('-password');
    if (!socket.user) return next(new Error('User not found'));
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  // User joins their own personal room
  socket.join(`user_${socket.user.id}`);
  
  if (socket.user.role === 'admin') {
    socket.join('admins');
  }

  socket.on('sendMessage', async (data) => {
    try {
      const { ticketId, text } = data;
      const ticket = await SupportTicket.findById(ticketId);
      if (!ticket) return;

      const message = await Message.create({
        ticket: ticketId,
        sender: socket.user.id,
        text,
        isAdmin: socket.user.role === 'admin'
      });

      ticket.lastMessage = text;
      ticket.lastMessageAt = new Date();
      if (socket.user.role !== 'admin' && ticket.status === 'closed') {
        ticket.status = 'open'; // Reopen ticket if user messages again
      }
      await ticket.save();

      const populatedMsg = await Message.findById(message._id).populate('sender', 'name avatar role');

      // Emit to the specific user's room and to all admins
      io.to(`user_${ticket.user}`).emit('receiveMessage', populatedMsg);
      io.to('admins').emit('receiveMessage', populatedMsg);
      io.to('admins').emit('ticketUpdated', ticket);
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    // automatic cleanup
  });
});


// ─────────────────────────────────────────────
// GRACEFUL SHUTDOWN HANDLING
// Handles unexpected errors gracefully without crashing the server.
// ─────────────────────────────────────────────

/**
 * Handle unhandled promise rejections (e.g., DB query failures not caught by asyncHandler).
 * Logs the error and closes the server gracefully.
 */
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Give the server 5 seconds to finish current requests before shutting down
  server.close(() => {
    console.log('Server closed due to unhandled promise rejection.');
    process.exit(1);
  });
});

/**
 * Handle uncaught synchronous exceptions.
 */
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
// nodemon trigger
