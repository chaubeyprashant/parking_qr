import { UserModel } from '../models/UserModel.js';
import { QRCodeModel } from '../models/QRCodeModel.js';

export class MongoDatabase {
  constructor() {
    // MongoDB connection is handled separately in connection.js
  }

  // User operations
  async findUserByEmail(email) {
    try {
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        return existingUser.toJSON();
      }
      
      const user = new UserModel({
        email: userData.email.toLowerCase(),
        name: userData.name,
        plan: userData.plan || 'free'
      });
      const savedUser = await user.save();
      return savedUser.toJSON();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(email, updates) {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: updates },
        { new: true, runValidators: true }
      );
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async findUserById(userId) {
    try {
      const user = await UserModel.findById(userId);
      return user ? user.toJSON() : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // QR Code operations
  async createQRCode(qrData) {
    try {
      // Convert userId to ObjectId if it's a string
      const mongoose = (await import('mongoose')).default;
      let userId = qrData.userId;
      
      // If userId is a string and not an ObjectId, try to find user by email/id and get their _id
      if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
        // Try to find user by the string ID
        const { UserModel } = await import('../models/UserModel.js');
        const user = await UserModel.findById(userId) || await UserModel.findOne({ id: userId });
        if (user) {
          userId = user._id;
        }
      }
      
      const qrCode = new QRCodeModel({
        userId: userId,
        qrValue: qrData.qrValue, // Will be updated after save with correct ID
        name: qrData.name,
        email: qrData.email.toLowerCase(),
        address: qrData.address,
        phone: qrData.phone
      });
      const savedQR = await qrCode.save();
      const result = savedQR.toJSON();
      
      // Update qrValue to use the MongoDB _id
      if (result.id && result.qrValue) {
        // Extract base URL from qrValue and update with correct MongoDB ID
        const urlMatch = result.qrValue.match(/^(https?:\/\/[^\/]+)\/scan\//);
        if (urlMatch) {
          result.qrValue = `${urlMatch[1]}/scan/${result.id}`;
          // Update in database
          await QRCodeModel.findByIdAndUpdate(savedQR._id, { qrValue: result.qrValue });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw error;
    }
  }

  async findQRCodeById(qrId) {
    try {
      // Try to find by MongoDB _id first (if it's a valid ObjectId)
      let qrCode = null;
      
      // Check if qrId is a valid MongoDB ObjectId format
      const mongoose = (await import('mongoose')).default;
      if (mongoose.Types.ObjectId.isValid(qrId) && qrId.length === 24) {
        qrCode = await QRCodeModel.findById(qrId);
      }
      
      // If not found, try finding by qrValue (contains the ID in URL)
      if (!qrCode) {
        qrCode = await QRCodeModel.findOne({ qrValue: { $regex: `/${qrId}$` } });
      }
      
      return qrCode ? qrCode.toJSON() : null;
    } catch (error) {
      console.error('Error finding QR code by ID:', error);
      throw error;
    }
  }

  async findQRCodesByUserId(userId) {
    try {
      // Convert userId to ObjectId if needed
      const mongoose = (await import('mongoose')).default;
      let queryUserId = userId;
      
      if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
        // Try to find user by the string ID
        const { UserModel } = await import('../models/UserModel.js');
        const user = await UserModel.findById(userId) || await UserModel.findOne({ id: userId });
        if (user) {
          queryUserId = user._id;
        }
      }
      
      const qrCodes = await QRCodeModel.find({ userId: queryUserId });
      return qrCodes.map(qr => qr.toJSON());
    } catch (error) {
      console.error('Error finding QR codes by user ID:', error);
      throw error;
    }
  }

  // Statistics
  async getUserQRCount(userId) {
    try {
      // Convert userId to ObjectId if needed
      const mongoose = (await import('mongoose')).default;
      let queryUserId = userId;
      
      if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
        // Try to find user by the string ID
        const { UserModel } = await import('../models/UserModel.js');
        const user = await UserModel.findById(userId) || await UserModel.findOne({ id: userId });
        if (user) {
          queryUserId = user._id;
        }
      }
      
      const count = await QRCodeModel.countDocuments({ userId: queryUserId });
      return count;
    } catch (error) {
      console.error('Error counting user QR codes:', error);
      throw error;
    }
  }

  // Additional MongoDB-specific methods
  async getAllUsers() {
    try {
      const users = await UserModel.find({});
      return users.map(user => user.toJSON());
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async getAllQRCodes() {
    try {
      const qrCodes = await QRCodeModel.find({}).populate('userId', 'email name plan');
      return qrCodes.map(qr => qr.toJSON());
    } catch (error) {
      console.error('Error getting all QR codes:', error);
      throw error;
    }
  }
}

