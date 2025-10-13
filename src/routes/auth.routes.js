const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * Authentication routes
 */

// Login - get JWT token
router.post('/login', AuthController.login);

// Verify if a token is valid
router.get('/verify', authMiddleware, AuthController.verifyToken);

// Generate password hash (development only)
// IMPORTANT: Comment out or remove in production
if (process.env.NODE_ENV === 'development') {
  router.post('/generate-hash', AuthController.generatePasswordHash);
}

module.exports = router;

