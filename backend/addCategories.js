import mongoose from 'mongoose';
import 'dotenv/config';
import Category from './src/models/Category.js';
import connectDB from './src/config/db.js';

const addCategories = async () => {
  await connectDB();
  
  const newCategories = [
    { name: 'Fire Blankets', icon: 'Shield' },
    { name: 'First Aid Kits', icon: 'Briefcase' },
    { name: 'Gas Detectors', icon: 'Cloud' },
    { name: 'Safety Signs', icon: 'AlertTriangle' },
  ];

  try {
    for (const c of newCategories) {
        const slug = c.name.toLowerCase().replace(/ /g, '-');
        const exists = await Category.findOne({ slug });
        if (!exists) {
            await Category.create({
                name: c.name,
                slug: slug,
                icon: c.icon,
                isActive: true
            });
            console.log(`✅ Added ${c.name}`);
        } else {
            console.log(`ℹ️ ${c.name} already exists`);
        }
    }
  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    mongoose.connection.close();
  }
};

addCategories();
