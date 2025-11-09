import express from 'express';
import { UserController } from '../controllers/UserController.js';

const router = express.Router();
const userController = new UserController();

router.get('/:email', userController.getUserInfo);
router.post('/upgrade', userController.upgradeToPremium);

export default router;

