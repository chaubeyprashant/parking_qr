import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JsonDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dbPath)) {
      const data = { users: [], qrCodes: [] };
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      return { users: [], qrCodes: [] };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to database:', error);
      return false;
    }
  }

  // User operations
  findUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email === email.toLowerCase());
  }

  createUser(userData) {
    const db = this.read();
    const user = {
      ...userData,
      email: userData.email.toLowerCase()
    };
    db.users.push(user);
    this.write(db);
    return user;
  }

  updateUser(email, updates) {
    const db = this.read();
    const userIndex = db.users.findIndex(u => u.email === email.toLowerCase());
    if (userIndex === -1) return null;
    
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    this.write(db);
    return db.users[userIndex];
  }

  // QR Code operations
  createQRCode(qrData) {
    const db = this.read();
    db.qrCodes.push(qrData);
    this.write(db);
    return qrData;
  }

  findQRCodeById(qrId) {
    const db = this.read();
    return db.qrCodes.find(qr => qr.id === qrId);
  }

  findQRCodesByUserId(userId) {
    const db = this.read();
    return db.qrCodes.filter(qr => qr.userId === userId);
  }

  // Statistics
  getUserQRCount(userId) {
    return this.findQRCodesByUserId(userId).length;
  }
}

