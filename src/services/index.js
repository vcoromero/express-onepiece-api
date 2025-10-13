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

// Add more services as they are created:
// const characterService = require('./character.service');
// const devilFruitService = require('./devil-fruit.service');
// const organizationService = require('./organization.service');

module.exports = {
  fruitTypeService
  // Export more services here
};

