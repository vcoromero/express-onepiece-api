const express = require('express');
const router = express.Router();
const organizationTypeController = require('../controllers/organization-type.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Organization Type Routes
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - PUT routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// Public routes (GET only)
router.get('/organization-types', generalLimiter, organizationTypeController.getAllOrganizationTypes);
router.get('/organization-types/:id', generalLimiter, organizationTypeController.getOrganizationTypeById);

// Protected routes (PUT only)
router.put('/organization-types/:id',
  sensitiveOperationsLimiter,
  authMiddleware,
  organizationTypeController.updateOrganizationType
);

module.exports = router;
