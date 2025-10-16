const express = require('express');
const router = express.Router();
const shipController = require('../controllers/ship.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rate-limiter');

/**
 * Ship Routes
 * 
 * Public endpoints (GET):
 * - GET /api/ships - List all ships with pagination
 * - GET /api/ships/:id - Get ship by ID
 * - GET /api/ships/status/:status - Get ships by status
 * 
 * Protected endpoints (POST, PUT, DELETE):
 * - POST /api/ships - Create new ship (requires auth)
 * - PUT /api/ships/:id - Update ship (requires auth)
 * - DELETE /api/ships/:id - Delete ship (requires auth)
 */

// Public routes (GET only - no authentication required)
// Rate limiting: 100 requests per 15 minutes
router.get('/', shipController.getAllShips);
router.get('/status/:status', shipController.getShipsByStatus);
router.get('/:id', shipController.getShipById);

// Protected routes (POST, PUT, DELETE - authentication required)
// Rate limiting: 50 requests per 15 minutes
router.post('/', authMiddleware, rateLimiter.sensitiveOperationsLimiter, shipController.createShip);
router.put('/:id', authMiddleware, rateLimiter.sensitiveOperationsLimiter, shipController.updateShip);
router.delete('/:id', authMiddleware, rateLimiter.sensitiveOperationsLimiter, shipController.deleteShip);

module.exports = router;
