import twilio from 'twilio';
import { config } from '../config/index.js';

export class TwilioService {
  constructor() {
    this.client = null;
    if (config.twilio.enabled && config.twilio.accountSid && config.twilio.authToken) {
      this.client = twilio(config.twilio.accountSid, config.twilio.authToken);
    }
  }

  isEnabled() {
    return this.client !== null;
  }

  /**
   * Create a masked call between caller and owner
   * This uses Twilio's call masking feature
   * Flow: Twilio calls the caller first, then connects to owner when answered
   */
  async createMaskedCall(callerPhone, ownerPhone) {
    if (!this.isEnabled()) {
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }

    if (!callerPhone || !ownerPhone) {
      throw new Error('Both caller and owner phone numbers are required');
    }

    try {
      // Format phone numbers (ensure they start with +)
      const formattedCaller = callerPhone.startsWith('+') ? callerPhone : `+${callerPhone.replace(/\D/g, '')}`;
      const formattedOwner = ownerPhone.startsWith('+') ? ownerPhone : `+${ownerPhone.replace(/\D/g, '')}`;

      // Get base URL for webhooks
      const baseUrl = process.env.BASE_URL || 'https://parking-qr-xage.onrender.com';
      
      // Create the call - Twilio will call the caller first
      // When they answer, Twilio will execute the TwiML to connect to owner
      const call = await this.client.calls.create({
        to: formattedCaller, // The person who scanned the QR code (will receive call)
        from: config.twilio.phoneNumber, // Your Twilio number (what caller sees)
        url: `${baseUrl}/api/call/connect/${encodeURIComponent(formattedOwner)}`,
        method: 'GET',
        statusCallback: `${baseUrl}/api/call/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });

      return {
        callSid: call.sid,
        status: call.status,
        maskedNumber: config.twilio.phoneNumber,
        message: 'Call initiated. You will receive a call from our masked number shortly.'
      };
    } catch (error) {
      console.error('Twilio call error:', error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  /**
   * Twilio webhook handler - connects the call to the owner
   * This is called when the caller answers
   * The owner's number is passed in the URL and dialed
   */
  getConnectCallXml(ownerPhone) {
    // Escape XML special characters
    const escapedPhone = ownerPhone
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connecting you to the vehicle owner now. Please hold.</Say>
  <Dial callerId="${config.twilio.phoneNumber}" record="false">
    <Number>${escapedPhone}</Number>
  </Dial>
  <Say voice="alice">The call has ended. Thank you.</Say>
</Response>`;
  }

  /**
   * Get call status
   */
  async getCallStatus(callSid) {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const call = await this.client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status,
        duration: call.duration,
        startTime: call.startTime,
        endTime: call.endTime
      };
    } catch (error) {
      console.error('Error fetching call status:', error);
      return null;
    }
  }
}

