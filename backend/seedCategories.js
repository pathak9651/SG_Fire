import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './src/models/Category.js';
import connectDB from './src/config/db.js';

const seedCategories = async () => {
  await connectDB();
  
  const categories = [
    { name: 'Fire Extinguishers', icon: 'Flame' },
    { name: 'Smoke Detectors', icon: 'Shield' },
    { name: 'Fire Alarms', icon: 'Bell' },
    { name: 'Safety Gear', icon: 'User' },
    { name: 'Emergency Lights', icon: 'Zap' },
  ];

  try {
    // Only seed if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany(categories.map(c => ({
        ...c,
        slug: c.name.toLowerCase().replace(/ /g, '-'),
        isActive: true
      })));
      console.log('✅ Basic categories seeded successfully');
    } else {
      console.log('ℹ️ Categories already exist, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedCategories();
