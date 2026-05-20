import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sgfire';

// Import User Schema from the actual model file to run save prehooks
import User from './src/models/User.js';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Check if test user exists
    let user = await User.findOne({ email: 'testuser@sgfire.com' });
    if (user) {
      console.log('User exists, resetting password and verification status');
      user.password = 'password123';
      user.isVerified = true;
      await user.save();
      console.log('User updated successfully');
    } else {
      console.log('Creating new verified test user');
      user = await User.create({
        name: 'Test User',
        email: 'testuser@sgfire.com',
        phone: '9876543210',
        password: 'password123',
        isVerified: true
      });
      console.log('User created successfully:', user.email);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
