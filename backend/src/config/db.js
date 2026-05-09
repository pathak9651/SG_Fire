/**
 * ============================================================
 * FILE: config/db.js
 * PURPOSE: Establishes and manages the MongoDB database connection
 *          using Mongoose ORM. Called once at server startup.
 * USAGE: import connectDB from './config/db.js' and call connectDB()
 *        inside server.js before starting the Express server.
 * ============================================================
 */

import mongoose from 'mongoose';

/**
 * connectDB()
 * -----------
 * Connects to MongoDB Atlas using the MONGO_URI from environment variables.
 * Uses async/await for clean error handling.
 * Exits the process with code 1 if connection fails (critical failure).
 *
 * Mongoose Options Explained:
 *  - No extra options needed for Mongoose v7+ (defaults are good)
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from .env
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log success message with the host name for confirmation
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error message for debugging
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Exit the Node.js process with failure code 1.
    // This prevents the server from running without a database connection.
    process.exit(1);
  }
};

export default connectDB;
