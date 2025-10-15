const express = require('express');
const router = express.Router();
const characterController = require('../controllers/character.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Character Routes
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - POST, PUT, DELETE routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// Public routes (GET only)
router.get('/characters', generalLimiter, characterController.getAllCharacters);
router.get('/characters/search', generalLimiter, characterController.searchCharacters);
router.get('/characters/:id', generalLimiter, characterController.getCharacterById);

// Protected routes (POST, PUT, DELETE)
router.post('/characters',
  sensitiveOperationsLimiter,
  authMiddleware,
  characterController.createCharacter
);

router.put('/characters/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  characterController.updateCharacter
);

router.delete('/characters/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  characterController.deleteCharacter
);

module.exports = router;
