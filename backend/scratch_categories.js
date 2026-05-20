import mongoose from 'mongoose';
import Category from './src/models/Category.js';

async function checkCategories() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/sgfire');
    console.log('Connected to MongoDB');
    
    const categories = await Category.find({});
    console.log('Total categories:', categories.length);
    console.log(JSON.stringify(categories, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();
