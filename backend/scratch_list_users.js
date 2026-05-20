import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sgfire';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    const users = await User.find({}, 'name email role isVerified');
    console.log('USERS_LIST_START');
    console.log(JSON.stringify(users, null, 2));
    console.log('USERS_LIST_END');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
