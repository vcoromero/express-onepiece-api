const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rate-limiter');

/**
 * Authentication routes
 */

// Login - get JWT token
// Apply strict rate limiting to prevent brute force attacks
router.post('/login', authLimiter, AuthController.login);

// Verify if a token is valid
router.get('/verify', authMiddleware, AuthController.verifyToken);

module.exports = router;

