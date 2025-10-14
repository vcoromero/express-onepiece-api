const express = require('express');
const router = express.Router();
const fruitTypesController = require('../controllers/fruit-types.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Routes for devil fruit types operations
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - PUT routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// GET routes - Public access with general rate limiting
router.get('/fruit-types', generalLimiter, fruitTypesController.getAllFruitTypes);
router.get('/fruit-types/:id', generalLimiter, fruitTypesController.getFruitTypeById);

// PUT routes - Require authentication and stricter rate limiting
router.put('/fruit-types/:id', 
  sensitiveOperationsLimiter, 
  authMiddleware, 
  fruitTypesController.updateFruitType
);

module.exports = router;
