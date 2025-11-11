// API Response Types

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface User {
  exists?: boolean;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  qrCount: number;
}

export interface QRCode {
  id: string;
  userId: string;
  qrValue: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  createdAt: string;
}

export interface GenerateQRResponse {
  qrCode: QRCode;
  user: User;
}

export interface QRCodeInfo {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface CallResponse {
  success: boolean;
  message: string;
  maskedNumber?: string;
  ownerPhone?: string;
  note?: string;
  requiresPhoneNumber?: boolean;
  callSid?: string;
  status?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  address: string;
  phone: string;
}

