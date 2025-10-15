const express = require('express');
const router = express.Router();
const characterTypeController = require('../controllers/character-type.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Character Type Routes
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - PUT routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// Public routes (GET only)
router.get('/character-types', generalLimiter, characterTypeController.getAllCharacterTypes);
router.get('/character-types/:id', generalLimiter, characterTypeController.getCharacterTypeById);

// Protected routes (PUT only)
router.put('/character-types/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  characterTypeController.updateCharacterType
);

module.exports = router;
