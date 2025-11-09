import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    prefix: '/api',
    version: 'v1'
  },
  database: {
    type: process.env.DB_TYPE || 'json', // json, mongodb, postgresql
    path: process.env.DB_PATH || path.join(__dirname, '../database.json')
  },
  limits: {
    free: {
      qrCodes: 3
    },
    premium: {
      qrCodes: Infinity
    }
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};

