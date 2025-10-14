const express = require('express');
const router = express.Router();
const hakiTypeController = require('../controllers/haki-type.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * HakiType Routes
 * 
 * @route GET /api/haki-types - Get all Haki types (public)
 * @route GET /api/haki-types/:id - Get Haki type by ID (public)
 * @route PUT /api/haki-types/:id - Update Haki type (protected)
 */

// Public routes (GET only)
router.get('/haki-types', generalLimiter, hakiTypeController.getAllHakiTypes);
router.get('/haki-types/:id', generalLimiter, hakiTypeController.getHakiTypeById);

// Protected routes (PUT only)
router.put('/haki-types/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  hakiTypeController.updateHakiType
);

module.exports = router;
