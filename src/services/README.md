# Services Layer

This directory contains the **Business Logic Layer** of the application.

## 🎯 What is a Service?

Services implement **business logic** and **orchestrate models**. They sit between Controllers and Models.

```
Controller → Service → Model → Database
```

## 📋 Responsibilities

### ✅ Services SHOULD:
- Implement business rules and logic
- Orchestrate multiple models
- Handle transactions
- Transform data
- Validate business rules
- Throw meaningful errors with error codes

### ❌ Services SHOULD NOT:
- Handle HTTP requests/responses (that's for controllers)
- Access `req` or `res` objects
- Format HTTP responses
- Have routes knowledge

## 📁 Current Services

### `fruit-type.service.js`

Manages Devil Fruit Types business logic.

**Methods:**
- `getAllTypes()` - Get all fruit types ordered by ID
- `getTypeById(id)` - Get a specific fruit type
- `createType(data)` - Create new type (checks uniqueness)
- `updateType(id, data)` - Update existing type (checks uniqueness)
- `deleteType(id)` - Delete type (checks associations)
- `nameExists(name, excludeId)` - Check if name is taken
- `hasAssociatedFruits(id)` - Check if type has fruits

**Usage:**
```javascript
const fruitTypeService = require('./services/fruit-type.service');

// In controller
const types = await fruitTypeService.getAllTypes();
const type = await fruitTypeService.getTypeById(1);
```

## 🔧 Creating a New Service

### 1. Create Service File

```bash
touch src/services/character.service.js
```

### 2. Implement Service Class

```javascript
const Character = require('../models/character.model');
const Race = require('../models/race.model');
const { Op } = require('sequelize');

class CharacterService {
  /**
   * Get all characters with optional filters
   * Business rule: Always include race information
   */
  async getAllCharacters(filters = {}) {
    const where = {};
    if (filters.race) where.race_id = filters.race;
    if (filters.minBounty) where.bounty = { [Op.gte]: filters.minBounty };

    return await Character.findAll({
      where,
      include: [{ model: Race, as: 'race' }],
      order: [['bounty', 'DESC']]
    });
  }

  /**
   * Create a character
   * Business rule: Race must exist
   */
  async createCharacter(data) {
    // Business logic: Validate race exists
    const race = await Race.findByPk(data.race_id);
    if (!race) {
      const error = new Error('Invalid race ID');
      error.code = 'INVALID_RACE';
      throw error;
    }

    // Business logic: Check name uniqueness
    const exists = await Character.findOne({ where: { name: data.name } });
    if (exists) {
      const error = new Error('Character name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    return await Character.create(data);
  }
}

// Export as singleton
module.exports = new CharacterService();
```

### 3. Export in index.js

```javascript
// src/services/index.js
const fruitTypeService = require('./fruit-type.service');
const characterService = require('./character.service');

module.exports = {
  fruitTypeService,
  characterService
};
```

### 4. Use in Controller

```javascript
const { characterService } = require('../services');

const getAllCharacters = async (req, res) => {
  try {
    const filters = {
      race: req.query.race,
      minBounty: req.query.minBounty
    };
    
    const characters = await characterService.getAllCharacters(filters);
    
    res.status(200).json({
      success: true,
      count: characters.length,
      data: characters
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching characters'
    });
  }
};
```

## 🧪 Testing Services

### Mock the Model, Test the Service

```javascript
// __tests__/services/character.service.test.js
jest.mock('../../src/models/character.model');
jest.mock('../../src/models/race.model');

const Character = require('../../src/models/character.model');
const Race = require('../../src/models/race.model');
const characterService = require('../../src/services/character.service');

describe('CharacterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCharacter', () => {
    it('should throw error if race is invalid', async () => {
      Race.findByPk.mockResolvedValue(null);

      await expect(
        characterService.createCharacter({ name: 'Test', race_id: 999 })
      ).rejects.toThrow('Invalid race ID');
    });

    it('should create character if valid', async () => {
      Race.findByPk.mockResolvedValue({ id: 1, name: 'Human' });
      Character.findOne.mockResolvedValue(null);
      Character.create.mockResolvedValue({ id: 1, name: 'Luffy', race_id: 1 });

      const result = await characterService.createCharacter({
        name: 'Luffy',
        race_id: 1
      });

      expect(result).toHaveProperty('id', 1);
      expect(Character.create).toHaveBeenCalled();
    });
  });
});
```

## 💡 Best Practices

### Error Handling

Always use error codes for better handling:

```javascript
async createType(data) {
  const exists = await this.nameExists(data.name);
  if (exists) {
    const error = new Error('Name already exists');
    error.code = 'DUPLICATE_NAME'; // ← Custom error code
    throw error;
  }
}
```

Controller can then handle it:

```javascript
try {
  await service.createType(data);
} catch (error) {
  if (error.code === 'DUPLICATE_NAME') {
    return res.status(409).json({ message: error.message });
  }
  if (error.code === 'NOT_FOUND') {
    return res.status(404).json({ message: error.message });
  }
  res.status(500).json({ message: 'Internal error' });
}
```

### Transactions

Use transactions for multi-step operations:

```javascript
async createCharacterWithOrganization(characterData, orgData) {
  const transaction = await sequelize.transaction();
  
  try {
    const character = await Character.create(characterData, { transaction });
    
    await CharacterOrganization.create({
      character_id: character.id,
      organization_id: orgData.organization_id,
      role: orgData.role
    }, { transaction });
    
    await transaction.commit();
    return character;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### Documentation

Always document your service methods:

```javascript
/**
 * Get all characters with filters
 * 
 * @param {Object} filters - Filter options
 * @param {number} [filters.race] - Filter by race ID
 * @param {number} [filters.minBounty] - Minimum bounty
 * @returns {Promise<Array>} Array of characters
 * @throws {Error} If database error occurs
 */
async getAllCharacters(filters = {}) {
  // Implementation...
}
```

---

## 📚 Learn More

- [Service Layer Pattern Guide](../../docs/SERVICE_LAYER_PATTERN.md)
- [Sequelize Guide](../../docs/SEQUELIZE_GUIDE.md)
- [Project Structure](../../docs/PROJECT_STRUCTURE.md)