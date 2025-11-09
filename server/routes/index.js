import express from 'express';
import userRoutes from './userRoutes.js';
import qrRoutes from './qrRoutes.js';
import callRoutes from './callRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/user', userRoutes);
router.use('/qr', qrRoutes);
router.use('/call', callRoutes);

export default router;

