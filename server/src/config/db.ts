import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error('MongoDB connection failed: MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected successfully`);

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};