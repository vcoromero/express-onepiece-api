const express = require('express');
const router = express.Router();
const fruitTypesController = require('../controllers/fruit-types.controller');

// Routes for devil fruit types CRUD operations
router.get('/fruit-types', fruitTypesController.getAllFruitTypes);
router.get('/fruit-types/:id', fruitTypesController.getFruitTypeById);
router.post('/fruit-types', fruitTypesController.createFruitType);
router.put('/fruit-types/:id', fruitTypesController.updateFruitType);
router.delete('/fruit-types/:id', fruitTypesController.deleteFruitType);

module.exports = router;
