import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database file path
const DB_PATH = path.join(__dirname, 'database.json');

// Initialize database if it doesn't exist
const initializeDatabase = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [],
      qrCodes: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  }
};

// Read database
const readDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], qrCodes: [] };
  }
};

// Write to database
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Helper: Get or create user by email
const getOrCreateUser = (email, name) => {
  const db = readDatabase();
  let user = db.users.find(u => u.email === email.toLowerCase());
  
  if (!user) {
    user = {
      id: uuidv4(),
      email: email.toLowerCase(),
      name: name,
      plan: 'free', // 'free' or 'premium'
      createdAt: new Date().toISOString(),
      qrCodesGenerated: 0
    };
    db.users.push(user);
    writeDatabase(db);
  }
  
  return user;
};

// Helper: Get user QR codes count
const getUserQRCount = (userId) => {
  const db = readDatabase();
  return db.qrCodes.filter(qr => qr.userId === userId).length;
};

// Helper: Check if user can generate QR (no limit for now)
const canGenerateQR = (user) => {
  const qrCount = getUserQRCount(user.id);
  return { allowed: true, reason: 'unlimited', count: qrCount, limit: 'unlimited' };
};

// API Routes

// Get user info and QR count
app.get('/api/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    const db = readDatabase();
    const user = db.users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return res.json({
        exists: false,
        plan: 'free',
        qrCount: 0,
        qrLimit: 'unlimited'
      });
    }
    
    const qrCount = getUserQRCount(user.id);
    const canGenerate = canGenerateQR(user);
    
    res.json({
      exists: true,
      userId: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      qrCount: qrCount,
      qrLimit: 'unlimited',
      canGenerate: true,
      reason: 'unlimited'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info', message: error.message });
  }
});

// Generate QR code
app.post('/api/qr/generate', (req, res) => {
  try {
    const { email, name, address, phone } = req.body;
    
    if (!email || !name || !phone) {
      return res.status(400).json({ error: 'Email, name, and phone are required' });
    }
    
    // Get or create user
    const user = getOrCreateUser(email, name);
    
    // No limit check - allow unlimited QR generation
    
    // Generate unique QR ID for masked calls
    const qrId = uuidv4();
    // QR code will link to a web page that handles masked calls
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrValue = `${baseUrl}/scan/${qrId}`;
    
    // Create QR code record
    const qrCode = {
      id: qrId,
      userId: user.id,
      email: email.toLowerCase(),
      name: name,
      address: address || '',
      phone: phone,
      qrValue: qrValue,
      createdAt: new Date().toISOString()
    };
    
    // Save to database
    const db = readDatabase();
    db.qrCodes.push(qrCode);
    writeDatabase(db);
    
    // Return QR code data
    res.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        qrValue: qrCode.qrValue,
        name: qrCode.name,
        email: qrCode.email,
        address: qrCode.address,
        phone: qrCode.phone
      },
      user: {
        plan: user.plan,
        qrCount: getUserQRCount(user.id),
        qrLimit: 'unlimited'
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code', message: error.message });
  }
});

// Get user's QR codes
app.get('/api/qr/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    const db = readDatabase();
    const user = db.users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return res.json({ qrCodes: [] });
    }
    
    const userQRCodes = db.qrCodes
      .filter(qr => qr.userId === user.id)
      .map(qr => ({
        id: qr.id,
        name: qr.name,
        email: qr.email,
        address: qr.address,
        phone: qr.phone,
        qrValue: qr.qrValue,
        createdAt: qr.createdAt
      }));
    
    res.json({ qrCodes: userQRCodes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get QR codes', message: error.message });
  }
});

// Upgrade to premium (placeholder - integrate with payment gateway later)
app.post('/api/user/upgrade', (req, res) => {
  try {
    const { email, paymentToken } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const db = readDatabase();
    const user = db.users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, we'll just update the plan
    // In production, verify payment before upgrading
    
    if (paymentToken) {
      // Payment verification would happen here
      user.plan = 'premium';
      user.upgradedAt = new Date().toISOString();
      writeDatabase(db);
      
      return res.json({
        success: true,
        message: 'Successfully upgraded to premium',
        plan: 'premium'
      });
    } else {
      // For demo purposes, allow upgrade without payment
      user.plan = 'premium';
      user.upgradedAt = new Date().toISOString();
      writeDatabase(db);
      
      return res.json({
        success: true,
        message: 'Successfully upgraded to premium (demo mode)',
        plan: 'premium'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade user', message: error.message });
  }
});

// Get QR code info by ID (for scanning page)
app.get('/api/qr/:qrId', (req, res) => {
  try {
    const { qrId } = req.params;
    const db = readDatabase();
    const qrCode = db.qrCodes.find(qr => qr.id === qrId);
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    // Return only public info (no phone number)
    res.json({
      id: qrCode.id,
      name: qrCode.name,
      address: qrCode.address,
      createdAt: qrCode.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get QR code info', message: error.message });
  }
});

// Initiate masked call
app.post('/api/call/initiate', async (req, res) => {
  try {
    const { qrId, callerPhone } = req.body;
    
    if (!qrId) {
      return res.status(400).json({ error: 'QR ID is required' });
    }
    
    const db = readDatabase();
    const qrCode = db.qrCodes.find(qr => qr.id === qrId);
    
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    // TODO: Integrate with telephony service (Twilio, etc.)
    // For now, return the owner's phone number
    // In production, this would:
    // 1. Get a masked number from Twilio
    // 2. Initiate call from callerPhone to masked number
    // 3. Route masked number to owner's phone (qrCode.phone)
    // 4. Never reveal the owner's actual phone number
    
    // Placeholder response
    // In production, use Twilio like this:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Create a masked number or use existing
    const maskedNumber = await getOrCreateMaskedNumber(qrCode.phone);
    
    // Initiate call
    await client.calls.create({
      to: callerPhone,
      from: maskedNumber,
      url: `${process.env.BASE_URL}/api/call/connect?ownerPhone=${encodeURIComponent(qrCode.phone)}`
    });
    */
    
    // For demo: return success with instructions
    res.json({
      success: true,
      message: 'Call initiated successfully',
      // In production, this would return a masked number
      maskedNumber: process.env.MASKED_NUMBER_PLACEHOLDER || 'Call feature requires Twilio integration',
      ownerPhone: qrCode.phone, // Remove this in production - only for demo
      note: 'This is a demo. In production, the owner\'s phone number would never be revealed.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate call', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database on startup
initializeDatabase();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized at ${DB_PATH}`);
});







