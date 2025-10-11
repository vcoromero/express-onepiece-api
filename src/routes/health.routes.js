const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

router.get('/health', healthController.getHealth);

module.exports = router;

