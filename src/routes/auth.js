const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile.bind(AuthController));
router.put('/profile', authenticate, AuthController.updateProfile.bind(AuthController));
router.post('/change-password', authenticate, AuthController.changePassword.bind(AuthController));

module.exports = router;
