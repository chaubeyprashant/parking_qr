import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: Get or create user by email
const getOrCreateUser = async (email, name) => {
  try {
    // Try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser && !findError) {
      return existingUser;
    }

    // Create new user if not found
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        name: name,
        plan: 'free'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw insertError;
    }

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

// Helper: Get user QR codes count
const getUserQRCount = async (userId) => {
  try {
    const { count, error } = await supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Error counting QR codes:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUserQRCount:', error);
    return 0;
  }
};

// Helper: Check if user can generate QR (no limit for now)
const canGenerateQR = async (user) => {
  const qrCount = await getUserQRCount(user.id);
  return { allowed: true, reason: 'unlimited', count: qrCount, limit: 'unlimited' };
};

// API Routes

// Get user info and QR count
app.get('/api/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || error) {
      return res.json({
        exists: false,
        plan: 'free',
        qrCount: 0,
        qrLimit: 'unlimited'
      });
    }

    const qrCount = await getUserQRCount(user.id);
    const canGenerate = await canGenerateQR(user);

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
app.post('/api/qr/generate', async (req, res) => {
  try {
    const { email, name, address, phone } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ error: 'Email, name, and phone are required' });
    }

    // Get or create user
    const user = await getOrCreateUser(email, name);

    // No limit check - allow unlimited QR generation

    // Generate unique QR ID for masked calls
    const qrId = uuidv4();
    // QR code will link to a web page that handles masked calls
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrValue = `${baseUrl}/scan/${qrId}`;

    // Create QR code record
    const { data: qrCode, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        id: qrId,
        user_id: user.id,
        email: email.toLowerCase(),
        name: name,
        address: address || '',
        phone: phone,
        qr_value: qrValue
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating QR code:', insertError);
      return res.status(500).json({ error: 'Failed to create QR code', message: insertError.message });
    }

    const qrCount = await getUserQRCount(user.id);

    // Return QR code data
    res.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        qrValue: qrCode.qr_value,
        name: qrCode.name,
        email: qrCode.email,
        address: qrCode.address,
        phone: qrCode.phone
      },
      user: {
        plan: user.plan,
        qrCount: qrCount,
        qrLimit: 'unlimited'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code', message: error.message });
  }
});

// Get user's QR codes
app.get('/api/qr/user/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || userError) {
      return res.json({ qrCodes: [] });
    }

    const { data: qrCodes, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR codes:', error);
      return res.json({ qrCodes: [] });
    }

    const formattedQRCodes = (qrCodes || []).map(qr => ({
      id: qr.id,
      name: qr.name,
      email: qr.email,
      address: qr.address,
      phone: qr.phone,
      qrValue: qr.qr_value,
      createdAt: qr.created_at
    }));

    res.json({ qrCodes: formattedQRCodes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get QR codes', message: error.message });
  }
});

// Get QR code info by ID (for scanning page)
app.get('/api/qr/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('id, name, address, created_at')
      .eq('id', qrId)
      .single();

    if (!qrCode || error) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({
      id: qrCode.id,
      name: qrCode.name,
      address: qrCode.address,
      createdAt: qrCode.created_at
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

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('phone')
      .eq('id', qrId)
      .single();

    if (!qrCode || error) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // TODO: Integrate with telephony service (Twilio, etc.)
    // For now, return success with instructions
    res.json({
      success: true,
      message: 'Call initiated successfully',
      maskedNumber: process.env.MASKED_NUMBER_PLACEHOLDER || 'Call feature requires Twilio integration',
      ownerPhone: qrCode.phone, // Remove this in production - only for demo
      note: 'This is a demo. In production, the owner\'s phone number would never be revealed.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate call', message: error.message });
  }
});

// Upgrade to premium (placeholder - integrate with payment gateway later)
app.post('/api/user/upgrade', async (req, res) => {
  try {
    const { email, paymentToken } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!user || userError) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
    // For now, we'll just update the plan
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        plan: 'premium',
        upgraded_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: 'Failed to upgrade user', message: updateError.message });
    }

    res.json({
      success: true,
      message: 'Successfully upgraded to premium',
      plan: 'premium'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade user', message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Using Supabase database`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`✅ Health check: /api/health`);
});

