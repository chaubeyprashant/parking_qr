import { db } from '../database/index.js';
import { QRCode } from '../models/QRCode.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class QRCodeService {
  generateBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
  }

  async createQRCode(userData, userId, req) {
    const baseUrl = this.generateBaseUrl(req);
    
    // Generate QR code with unique ID first
    const qrCode = new QRCode({ ...userData, userId }, baseUrl);
    const qrData = qrCode.toJSON();
    
    // Save to database
    const savedQR = await db.createQRCode(qrData);
    
    // Ensure qrValue uses the saved ID (MongoDB _id or original id)
    if (savedQR.id && savedQR.qrValue !== `${baseUrl}/scan/${savedQR.id}`) {
      savedQR.qrValue = `${baseUrl}/scan/${savedQR.id}`;
    }
    
    // Return QRCode model with saved data
    return new QRCode(savedQR, baseUrl);
  }

  async getQRCodeById(qrId) {
    const qrData = await db.findQRCodeById(qrId);
    
    if (!qrData) {
      throw new NotFoundError('QR code');
    }

    return new QRCode(qrData);
  }

  async getUserQRCodes(userId) {
    return await db.findQRCodesByUserId(userId);
  }

  async getQRCodeCount(userId) {
    return await db.getUserQRCount(userId);
  }
}

