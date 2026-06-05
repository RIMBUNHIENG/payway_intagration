import express from 'express';
const router = express.Router();
import AuthController from '../controllers/AuthController.js';
import { authenticate  } from '../middleware/auth.js';

// Public routes
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile.bind(AuthController));
router.put('/profile', authenticate, AuthController.updateProfile.bind(AuthController));
router.post('/change-password', authenticate, AuthController.changePassword.bind(AuthController));

export default router;
