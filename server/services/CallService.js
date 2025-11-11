import { NotFoundError } from '../utils/errors.js';
import { QRCodeService } from './QRCodeService.js';
import { TwilioService } from './TwilioService.js';
import { config } from '../config/index.js';

export class CallService {
  constructor() {
    this.qrService = new QRCodeService();
    this.twilioService = new TwilioService();
  }

  async initiateCall(qrId, callerPhone = null) {
    const qrCode = await this.qrService.getQRCodeById(qrId);
    
    // If Twilio is enabled, use it for masked calls
    if (this.twilioService.isEnabled()) {
      if (!callerPhone) {
        return {
          success: true,
          message: 'Please provide your phone number to initiate a call',
          requiresPhoneNumber: true,
          maskedNumber: config.twilio.phoneNumber
        };
      }

      try {
        const result = await this.twilioService.createMaskedCall(callerPhone, qrCode.phone);
        return {
          success: true,
          message: result.message,
          callSid: result.callSid,
          maskedNumber: result.maskedNumber,
          status: result.status
        };
      } catch (error) {
        throw new Error(`Failed to initiate call: ${error.message}`);
      }
    }
    
    // Fallback if Twilio is not configured
    return {
      success: true,
      message: 'Call feature requires Twilio integration',
      maskedNumber: 'Call feature requires Twilio integration',
      ownerPhone: qrCode.phone,
      note: 'Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.'
    };
  }

  getConnectCallXml(ownerPhone) {
    if (this.twilioService.isEnabled()) {
      return this.twilioService.getConnectCallXml(ownerPhone);
    }
    return null;
  }
}
