import { JsonDatabase } from './JsonDatabase.js';
import { config } from '../config/index.js';

// Database factory - easily switch between database types
export const createDatabase = () => {
  switch (config.database.type) {
    case 'json':
      return new JsonDatabase(config.database.path);
    // Future: Add MongoDB, PostgreSQL, etc.
    // case 'mongodb':
    //   return new MongoDatabase(config.database.connectionString);
    // case 'postgresql':
    //   return new PostgresDatabase(config.database.connectionString);
    default:
      return new JsonDatabase(config.database.path);
  }
};

export const db = createDatabase();

