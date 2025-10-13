const express = require('express');
const router = express.Router();
const devilFruitController = require('../controllers/devil-fruit.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { generalLimiter, sensitiveOperationsLimiter } = require('../middlewares/rate-limiter');

/**
 * Routes for devil fruits CRUD operations
 * 
 * Security implementation:
 * - GET routes: Public access with general rate limiting (100 req/15min)
 * - POST/PUT/DELETE routes: Require JWT authentication + stricter rate limiting (50 req/15min)
 */

// GET routes - Public access with general rate limiting
router.get('/devil-fruits', generalLimiter, devilFruitController.getAllDevilFruits);
router.get('/devil-fruits/type/:typeId', generalLimiter, devilFruitController.getDevilFruitsByType);
router.get('/devil-fruits/:id', generalLimiter, devilFruitController.getDevilFruitById);

// POST/PUT/DELETE routes - Require authentication and stricter rate limiting
router.post('/devil-fruits', 
  sensitiveOperationsLimiter, 
  authMiddleware, 
  devilFruitController.createDevilFruit
);

router.put('/devil-fruits/:id', 
  sensitiveOperationsLimiter, 
  authMiddleware, 
  devilFruitController.updateDevilFruit
);

router.delete('/devil-fruits/:id', 
  sensitiveOperationsLimiter, 
  authMiddleware, 
  devilFruitController.deleteDevilFruit
);

module.exports = router;
