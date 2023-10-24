import mongoose from 'mongoose';

export const connectWithDatabase = () =>
  mongoose.connect(process.env.MONGO_URL);
