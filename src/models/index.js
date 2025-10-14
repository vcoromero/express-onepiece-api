/**
 * Models Index
 * Exports all Sequelize models
 */

const FruitType = require('./fruit-type.model');
const DevilFruit = require('./devil-fruit.model');
const HakiType = require('./haki-type.model');

// Future models can be added here:
// const Character = require('./character.model');
// const Organization = require('./organization.model');
// etc...

// Define associations
FruitType.associate({ DevilFruit });
DevilFruit.associate({ DevilFruitType: FruitType });

module.exports = {
  FruitType,
  DevilFruit,
  HakiType
  // Add more models as they are created
};

