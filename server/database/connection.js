import mongoose from 'mongoose';
import { config } from '../config/index.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const mongoURI = config.database.connectionString;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is not configured. Set MONGODB_URI environment variable.');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    await mongoose.connect(mongoURI, options);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      isConnected = true;
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
};

export const getConnectionStatus = () => isConnected;

