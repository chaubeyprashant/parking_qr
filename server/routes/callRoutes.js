import express from 'express';
import { CallController } from '../controllers/CallController.js';

const router = express.Router();
const callController = new CallController();

router.post('/initiate', callController.initiateCall);

export default router;

