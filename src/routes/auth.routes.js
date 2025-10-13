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

// Generate password hash (development and test only)
// IMPORTANT: Comment out or remove in production
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  router.post('/generate-hash', AuthController.generatePasswordHash);
}

module.exports = router;

