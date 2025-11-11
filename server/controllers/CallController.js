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

  // Twilio webhook - connects the call to the owner
  connectCall = async (req, res, next) => {
    try {
      const { ownerPhone } = req.params;
      
      if (!ownerPhone) {
        throw new ValidationError('Owner phone number is required');
      }

      const xml = this.callService.getConnectCallXml(decodeURIComponent(ownerPhone));
      
      if (!xml) {
        return res.status(503).send('Twilio service not available');
      }

      res.type('text/xml');
      res.send(xml);
    } catch (error) {
      next(error);
    }
  };

  // Twilio status callback webhook
  callStatus = async (req, res, next) => {
    try {
      const { CallSid, CallStatus, CallDuration } = req.body;
      
      // Log call status for monitoring
      console.log('Call Status Update:', {
        callSid: CallSid,
        status: CallStatus,
        duration: CallDuration
      });

      // You can store this in database for analytics
      // For now, just acknowledge receipt
      res.status(200).send('OK');
    } catch (error) {
      next(error);
    }
  };
}

