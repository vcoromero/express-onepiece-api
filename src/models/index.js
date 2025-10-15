/**
 * Models Index
 * Exports all Sequelize models
 */

const FruitType = require('./fruit-type.model');
const DevilFruit = require('./devil-fruit.model');
const HakiType = require('./haki-type.model');
const Race = require('./race.model');
const CharacterType = require('./character-type.model');
const OrganizationType = require('./organization-type.model');
const Character = require('./character.model');

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
  HakiType,
  Race,
  CharacterType,
  OrganizationType,
  Character
  // Add more models as they are created
};

