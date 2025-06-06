import mongoose from 'mongoose';

// Use MongoDB Atlas connection string by default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hemannarayanan:12345@pr.vurmxpb.mongodb.net/?retryWrites=true&w=majority&appName=PR';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 