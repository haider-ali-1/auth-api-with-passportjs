import mongoose from 'mongoose';

export const connectWithDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('connected with mongodb successfully');
  } catch (error) {
    console.log('failed to connect with mongodb');
  }
};
