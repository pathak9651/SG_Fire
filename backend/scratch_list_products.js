import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sgfire';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB:', MONGO_URI);

    const count = await Product.countDocuments({});
    console.log('Total products in database:', count);

    const products = await Product.find({}).limit(5);
    console.log('Sample products:');
    products.forEach(p => {
      console.log(`- [${p._id}] ${p.title} (Active: ${p.isActive})`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
