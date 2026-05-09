import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    const adminEmail = 'admin@sgfire.com';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`⚠️ Admin user already exists with email: ${adminEmail}`);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      name: 'Super Admin',
      email: adminEmail,
      phone: '9876543210',
      password: 'adminpassword123',
      role: 'admin',
      isVerified: true, // Auto-verify so they can login immediately
    });

    await adminUser.save();

    console.log('🎉 Admin user successfully created!');
    console.log('-----------------------------------');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: adminpassword123`);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error creating admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
