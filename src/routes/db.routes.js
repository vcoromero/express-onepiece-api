const express = require('express');
const router = express.Router();
const dbController = require('../controllers/db.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rate-limiter');

/**
 * @route POST /api/db/sync
 * @desc Sync database with Sequelize models
 * @access Private (Admin only)
 * @middleware authMiddleware
 */
router.post('/sync', rateLimiter.sensitiveOperationsLimiter, authMiddleware, dbController.syncDatabase);

/**
 * @route GET /api/db/status
 * @desc Get database status and structure
 * @access Private (Admin only)
 * @middleware authMiddleware
 */
router.get('/status', authMiddleware, dbController.getDatabaseStatus);

/**
 * @route GET /api/db/available-sql-files
 * @desc Get available SQL files in schemas directory
 * @access Private (Admin only)
 * @middleware authMiddleware
 */
router.get('/available-sql-files', authMiddleware, dbController.getAvailableSqlFiles);

/**
 * @route POST /api/db/execute-sql
 * @desc Execute SQL files (single or multiple)
 * @access Private (Admin only)
 * @middleware authMiddleware
 * @body {string[]} fileNames - Array of SQL file names to execute (can be single file)
 */
router.post('/execute-sql', rateLimiter.sensitiveOperationsLimiter, authMiddleware, dbController.executeSqlFiles);

module.exports = router;
