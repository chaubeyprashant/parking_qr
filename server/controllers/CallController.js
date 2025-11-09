import { CallService } from '../services/CallService.js';
import { sendSuccess } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

export class CallController {
  constructor() {
    this.callService = new CallService();
  }

  initiateCall = async (req, res, next) => {
    try {
      const { qrId, callerPhone } = req.body;
      
      if (!qrId) {
        throw new ValidationError('QR ID is required');
      }

      const result = await this.callService.initiateCall(qrId, callerPhone);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  };
}

