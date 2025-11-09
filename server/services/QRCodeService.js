import { db } from '../database/index.js';
import { QRCode } from '../models/QRCode.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class QRCodeService {
  generateBaseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
  }

  async createQRCode(userData, userId, req) {
    const baseUrl = this.generateBaseUrl(req);
    const qrCode = new QRCode({ ...userData, userId }, baseUrl);
    const qrData = qrCode.toJSON();
    
    db.createQRCode(qrData);
    
    return qrCode;
  }

  async getQRCodeById(qrId) {
    const qrData = db.findQRCodeById(qrId);
    
    if (!qrData) {
      throw new NotFoundError('QR code');
    }

    return new QRCode(qrData);
  }

  async getUserQRCodes(userId) {
    return db.findQRCodesByUserId(userId);
  }

  async getQRCodeCount(userId) {
    return db.getUserQRCount(userId);
  }
}

