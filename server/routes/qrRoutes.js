import express from 'express';
import { QRCodeController } from '../controllers/QRCodeController.js';

const router = express.Router();
const qrController = new QRCodeController();

router.post('/generate', qrController.generateQRCode);
router.get('/:qrId', qrController.getQRCodeInfo);

export default router;

