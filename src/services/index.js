/**
 * Services Index
 * 
 * Exports all services for easy importing
 * Services contain business logic and orchestrate models
 * 
 * Usage:
 *   const { fruitTypeService } = require('../services');
 *   const data = await fruitTypeService.getAllTypes();
 */

const fruitTypeService = require('./fruit-type.service');
const shipService = require('./ship.service');
const authService = require('./auth.service');

module.exports = {
  fruitTypeService,
  shipService,
  authService
};

