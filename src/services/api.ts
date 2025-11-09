import type {
  User,
  QRCode,
  GenerateQRResponse,
  QRCodeInfo,
  CallResponse,
  UserFormData,
  ApiResponse
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://parking-qr-xage.onrender.com/api';

/**
 * Handle API response with standardized format
 * Backend returns: { success: true/false, message: "...", data: {...} }
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data: ApiResponse<T> = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'An error occurred');
  }
  
  // Return data.data if it exists, otherwise return the whole data object
  return (data.data as T) || (data as unknown as T);
};

/**
 * Make API request with error handling
 */
const apiRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return await handleResponse<T>(response);
  } catch (error) {
    console.error(`API Error [${url}]:`, error);
    throw error;
  }
};

// ==================== User APIs ====================

/**
 * Get user info and QR count
 */
export const getUserInfo = async (email: string): Promise<User> => {
  return apiRequest<User>(`/user/${encodeURIComponent(email)}`);
};

/**
 * Upgrade user to premium
 */
export const upgradeToPremium = async (
  email: string,
  paymentToken: string | null = null
): Promise<{ email: string; plan: 'premium' }> => {
  return apiRequest<{ email: string; plan: 'premium' }>('/user/upgrade', {
    method: 'POST',
    body: JSON.stringify({ email, paymentToken }),
  });
};

// ==================== QR Code APIs ====================

/**
 * Generate a new QR code
 */
export const generateQRCode = async (userData: UserFormData): Promise<GenerateQRResponse> => {
  return apiRequest<GenerateQRResponse>('/qr/generate', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Get QR code information by ID
 */
export const getQRCodeInfo = async (qrId: string): Promise<QRCodeInfo> => {
  return apiRequest<QRCodeInfo>(`/qr/${qrId}`);
};

// ==================== Call APIs ====================

/**
 * Initiate a masked call
 */
export const initiateCall = async (
  qrId: string,
  callerPhone: string | null = null
): Promise<CallResponse> => {
  return apiRequest<CallResponse>('/call/initiate', {
    method: 'POST',
    body: JSON.stringify({ qrId, callerPhone }),
  });
};

// ==================== Health Check ====================

/**
 * Check API health status
 */
export const checkHealth = async (): Promise<{ status: string; message: string }> => {
  return apiRequest<{ status: string; message: string }>('/health');
};

