import { v4 as uuidv4 } from 'uuid';

export class QRCode {
  constructor(data, baseUrl) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.qrValue = data.qrValue || `${baseUrl}/scan/${this.id}`;
    this.name = data.name;
    this.email = data.email.toLowerCase();
    this.address = data.address;
    this.phone = data.phone;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      qrValue: this.qrValue,
      name: this.name,
      email: this.email,
      address: this.address,
      phone: this.phone,
      createdAt: this.createdAt
    };
  }

  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      address: this.address,
      phone: this.phone
    };
  }
}

