const express = require('express');
const router = express.Router();
const raceController = require('../controllers/race.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Race Routes
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - PUT routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// Public routes (GET only)
router.get('/races', generalLimiter, raceController.getAllRaces);
router.get('/races/:id', generalLimiter, raceController.getRaceById);

// Protected routes (PUT only)
router.put('/races/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  raceController.updateRace
);

module.exports = router;
