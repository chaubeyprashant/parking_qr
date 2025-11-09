const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get user info and QR count
export const getUserInfo = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// Generate QR code
export const generateQRCode = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/qr/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate QR code');
    }
    
    return data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Get user's QR codes
export const getUserQRCodes = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/qr/user/${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch QR codes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    throw error;
  }
};

// Upgrade to premium
export const upgradeToPremium = async (email, paymentToken = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, paymentToken }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upgrade');
    }
    
    return data;
  } catch (error) {
    console.error('Error upgrading to premium:', error);
    throw error;
  }
};

// Get QR code info by ID (for scanning page)
export const getQRCodeInfo = async (qrId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/qr/${qrId}`);
    if (!response.ok) {
      throw new Error('QR code not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching QR code info:', error);
    throw error;
  }
};

// Initiate masked call
export const initiateCall = async (qrId, callerPhone = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/call/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qrId, callerPhone }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initiate call');
    }
    
    return data;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};







