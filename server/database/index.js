import { JsonDatabase } from './JsonDatabase.js';
import { MongoDatabase } from './MongoDatabase.js';
import { connectDB } from './connection.js';
import { config } from '../config/index.js';

// Database factory - easily switch between database types
export const createDatabase = async () => {
  switch (config.database.type) {
    case 'mongodb':
      // Connect to MongoDB before returning database instance
      await connectDB();
      return new MongoDatabase();
    case 'json':
      return new JsonDatabase(config.database.path);
    // Future: Add PostgreSQL, etc.
    // case 'postgresql':
    //   return new PostgresDatabase(config.database.connectionString);
    default:
      // Default to MongoDB if type is not specified
      if (config.database.connectionString) {
        await connectDB();
        return new MongoDatabase();
      }
      return new JsonDatabase(config.database.path);
  }
};

// Initialize database connection
let dbInstance = null;

export const initDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await createDatabase();
  }
  return dbInstance;
};

// Get database instance (lazy initialization)
export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await createDatabase();
  }
  return dbInstance;
};

// For backward compatibility, export a promise-based db
export const db = {
  // User operations
  async findUserByEmail(email) {
    const database = await getDB();
    return database.findUserByEmail(email);
  },
  async createUser(userData) {
    const database = await getDB();
    return database.createUser(userData);
  },
  async updateUser(email, updates) {
    const database = await getDB();
    return database.updateUser(email, updates);
  },
  // QR Code operations
  async createQRCode(qrData) {
    const database = await getDB();
    return database.createQRCode(qrData);
  },
  async findQRCodeById(qrId) {
    const database = await getDB();
    return database.findQRCodeById(qrId);
  },
  async findQRCodesByUserId(userId) {
    const database = await getDB();
    return database.findQRCodesByUserId(userId);
  },
  // Statistics
  async getUserQRCount(userId) {
    const database = await getDB();
    return database.getUserQRCount(userId);
  }
};

