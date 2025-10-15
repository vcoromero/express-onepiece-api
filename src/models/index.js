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
const CharacterHaki = require('./character-haki.model');
const CharacterDevilFruit = require('./character-devil-fruit.model');
const CharacterCharacterType = require('./character-character-type.model');
const CharacterOrganization = require('./character-organization.model');
const Organization = require('./organization.model');
const Ship = require('./ship.model');

// Future models can be added here:
// const Character = require('./character.model');
// const Organization = require('./organization.model');
// etc...

// Define associations
FruitType.associate({ DevilFruit });
DevilFruit.associate({ DevilFruitType: FruitType });

// Character associations
Character.associate({ Race, DevilFruit, CharacterHaki, HakiType, CharacterDevilFruit, CharacterCharacterType, CharacterOrganization, CharacterType, Organization });
Race.associate({ Character });

// CharacterHaki associations
CharacterHaki.associate({ Character, HakiType });

// CharacterDevilFruit associations
CharacterDevilFruit.associate({ Character, DevilFruit });

// CharacterCharacterType associations
CharacterCharacterType.associate({ Character, CharacterType });

// CharacterOrganization associations
CharacterOrganization.associate({ Character, Organization });

// Organization associations
Organization.associate({ OrganizationType, Character, Ship, CharacterOrganization });

// Ship associations
Ship.associate({ Organization });

module.exports = {
  FruitType,
  DevilFruit,
  HakiType,
  Race,
  CharacterType,
  OrganizationType,
  Character,
  CharacterHaki,
  CharacterDevilFruit,
  CharacterCharacterType,
  CharacterOrganization,
  Organization,
  Ship
  // Add more models as they are created
};

