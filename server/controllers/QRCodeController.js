import { QRCodeService } from '../services/QRCodeService.js';
import { UserService } from '../services/UserService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ValidationError, ForbiddenError } from '../utils/errors.js';
import { validateQRGenerate } from '../utils/validators.js';

export class QRCodeController {
  constructor() {
    this.qrService = new QRCodeService();
    this.userService = new UserService();
  }

  generateQRCode = async (req, res, next) => {
    try {
      const { name, email, address, phone } = req.body;
      
      // Validate input
      const validation = validateQRGenerate({ name, email, address, phone });
      if (!validation.isValid) {
        throw new ValidationError(validation.errors.join(', '));
      }

      // Get or create user
      const user = await this.userService.getOrCreateUser(email, name);
      const qrCount = await this.qrService.getQRCodeCount(user.id);

      // Check if user can generate QR code
      const canGenerate = this.userService.canGenerateQR(user, qrCount);
      if (!canGenerate.allowed) {
        throw new ForbiddenError(
          `Free plan limit reached. Upgrade to premium for unlimited QR codes.`
        );
      }

      // Create QR code
      const qrCode = await this.qrService.createQRCode(
        { name, email, address, phone },
        user.id,
        req
      );

      // Get updated QR count
      const updatedQRCount = await this.qrService.getQRCodeCount(user.id);

      sendSuccess(res, {
        qrCode: qrCode.toJSON(),
        user: {
          email: user.email,
          name: user.name,
          plan: user.plan,
          qrCount: updatedQRCount
        }
      }, 'QR code generated successfully');
    } catch (error) {
      next(error);
    }
  };

  getQRCodeInfo = async (req, res, next) => {
    try {
      const { qrId } = req.params;
      
      if (!qrId) {
        throw new ValidationError('QR ID is required');
      }

      const qrCode = await this.qrService.getQRCodeById(qrId);
      
      sendSuccess(res, qrCode.toPublicJSON(), 'QR code info retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

