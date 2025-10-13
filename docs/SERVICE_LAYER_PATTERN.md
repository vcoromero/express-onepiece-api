# Service Layer Pattern - Architecture Guide

## 🎯 Overview

This project follows the **Service Layer Pattern**, a proven architecture used in professional applications like NestJS, Spring Boot, and Django.

```
┌──────────────────┐
│    Controller    │  ← HTTP Layer: Handles requests/responses
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│     Service      │  ← Business Layer: Implements business logic
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│      Model       │  ← Data Layer: Schema, validations, relationships
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│     Database     │  ← MySQL with Sequelize ORM
└──────────────────┘
```

---

## 🏗️ Architecture Layers

### 1. Model Layer (Data Schema)

**Location:** `src/models/`  
**Responsibility:** Define data structure ONLY

```javascript
// src/models/fruit-type.model.js
const { DataTypes, Model } = require('sequelize');

class FruitType extends Model {
  static associate(models) {
    // ✅ Define relationships here
    this.hasMany(models.DevilFruit, {
      foreignKey: 'type_id',
      as: 'fruits'
    });
  }
}

FruitType.init({
  // ✅ Define schema
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      // ✅ Define validations
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [1, 50], msg: 'Name cannot exceed 50 characters' }
    }
  }
  // ...
}, {
  sequelize,
  tableName: 'devil_fruit_types'
});

module.exports = FruitType;
```

**What belongs in Models:**
- ✅ Schema definition
- ✅ Field validations
- ✅ Relationships (associations)
- ✅ Database constraints
- ❌ **NO business logic**
- ❌ **NO query methods**

---

### 2. Service Layer (Business Logic)

**Location:** `src/services/`  
**Responsibility:** Implement all business logic

```javascript
// src/services/fruit-type.service.js
const FruitType = require('../models/fruit-type.model');
const { Op } = require('sequelize');

class FruitTypeService {
  /**
   * Get all fruit types
   * Business rule: Always order by ID
   */
  async getAllTypes() {
    return await FruitType.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  /**
   * Create a new fruit type
   * Business rule: Name must be unique
   */
  async createType(data) {
    const { name, description } = data;

    // Business logic: Check uniqueness
    const exists = await this.nameExists(name);
    if (exists) {
      const error = new Error('A fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Create the record
    const newFruitType = await FruitType.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    // Business logic: Format response
    return {
      id: newFruitType.id,
      name: newFruitType.name,
      description: newFruitType.description,
      created_at: newFruitType.created_at,
      updated_at: newFruitType.updated_at
    };
  }

  /**
   * Delete a fruit type
   * Business rule: Cannot delete if has associated fruits
   */
  async deleteType(id) {
    // Business logic: Check existence
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Business logic: Check associations
    const hasAssociated = await this.hasAssociatedFruits(id);
    if (hasAssociated) {
      const count = await this.getAssociatedFruitsCount(id);
      const error = new Error('Cannot delete fruit type because it has associated devil fruits');
      error.code = 'HAS_ASSOCIATIONS';
      error.associatedCount = count;
      throw error;
    }

    // Delete
    await FruitType.destroy({ where: { id } });

    return { id: fruitType.id, name: fruitType.name };
  }

  // Helper methods
  async nameExists(name, excludeId = null) { ... }
  async hasAssociatedFruits(id) { ... }
}

// Export as singleton
module.exports = new FruitTypeService();
```

**What belongs in Services:**
- ✅ Business logic and rules
- ✅ Complex queries and aggregations
- ✅ Orchestration of multiple models
- ✅ Transactions
- ✅ Data transformation
- ✅ Integration with external APIs
- ❌ **NO HTTP handling** (req, res)
- ❌ **NO direct access from routes**

---

### 3. Controller Layer (HTTP Handling)

**Location:** `src/controllers/`  
**Responsibility:** Handle HTTP requests/responses

```javascript
// src/controllers/fruit-types.controller.js
const fruitTypeService = require('../services/fruit-type.service');

const getAllFruitTypes = async (req, res) => {
  try {
    // ✅ Call service
    const fruitTypes = await fruitTypeService.getAllTypes();

    // ✅ Format HTTP response
    res.status(200).json({
      success: true,
      count: fruitTypes.length,
      data: fruitTypes
    });
  } catch (error) {
    // ✅ Handle errors and return appropriate HTTP status
    console.error('Error fetching fruit types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fruit types',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createFruitType = async (req, res) => {
  try {
    const { name, description } = req.body;

    // ✅ Basic HTTP validation (required fields, format)
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters'
      });
    }

    // ✅ Delegate business logic to service
    const newFruitType = await fruitTypeService.createType({ name, description });

    // ✅ Return HTTP response
    res.status(201).json({
      success: true,
      message: 'Fruit type created successfully',
      data: newFruitType
    });
  } catch (error) {
    console.error('Error creating fruit type:', error);

    // ✅ Handle known service errors with appropriate HTTP status
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating fruit type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllFruitTypes,
  getFruitTypeById,
  createFruitType,
  updateFruitType,
  deleteFruitType
};
```

**What belongs in Controllers:**
- ✅ Parse request (body, params, query)
- ✅ Basic input validation (required, format)
- ✅ Call appropriate service methods
- ✅ Format HTTP responses
- ✅ Map service errors to HTTP status codes
- ❌ **NO business logic**
- ❌ **NO direct model access**
- ❌ **NO database queries**

---

## 📋 Responsibilities Breakdown

| Layer | Can Access | Cannot Access | Responsibilities |
|-------|-----------|---------------|------------------|
| **Controller** | Services | Models, DB | HTTP, validation, responses |
| **Service** | Models | req/res objects | Business logic, orchestration |
| **Model** | Database | Services, Controllers | Schema, validations, relationships |

---

## 🧪 Testing Strategy

### Unit Tests (Controllers)

**Mock:** Services  
**Test:** HTTP handling, input validation, response formatting

```javascript
// __tests__/fruit-types.test.js
jest.mock('../src/services/fruit-type.service');
const fruitTypeService = require('../src/services/fruit-type.service');

it('should return 409 when name exists', async () => {
  // Mock service throwing duplicate error
  const error = new Error('Name already exists');
  error.code = 'DUPLICATE_NAME';
  fruitTypeService.createType.mockRejectedValueOnce(error);

  const response = await request(app)
    .post('/api/fruit-types')
    .send({ name: 'Existing' });

  expect(response.status).toBe(409);
  expect(response.body.success).toBe(false);
});
```

### Unit Tests (Services)

**Mock:** Models  
**Test:** Business logic, data transformation

```javascript
// __tests__/services/fruit-type.service.test.js
jest.mock('../../src/models/fruit-type.model');
const FruitType = require('../../src/models/fruit-type.model');
const fruitTypeService = require('../../src/services/fruit-type.service');

it('should throw error if name exists', async () => {
  FruitType.findOne.mockResolvedValue({ id: 1 });

  await expect(
    fruitTypeService.createType({ name: 'Existing' })
  ).rejects.toThrow('already exists');
});
```

### Integration Tests

**Mock:** Nothing  
**Test:** Full stack with real database

```javascript
// __tests__/integration/fruit-types.integration.test.js
// No mocks - uses real database
describe('Fruit Types Integration', () => {
  it('should create, read, update, delete', async () => {
    // Create
    const created = await fruitTypeService.createType({
      name: 'Integration Test',
      description: 'Test'
    });

    // Read
    const found = await fruitTypeService.getTypeById(created.id);
    expect(found.name).toBe('Integration Test');

    // Update
    await fruitTypeService.updateType(created.id, { name: 'Updated' });

    // Delete
    await fruitTypeService.deleteType(created.id);
  });
});
```

---

## 🎯 Benefits of Service Layer

### Before (Without Service Layer) ❌

```javascript
// Controller had business logic
const createFruitType = async (req, res) => {
  // Validation in controller
  if (!name) return res.status(400).json(...);
  
  // Business logic in controller
  const exists = await FruitType.findOne({ where: { name } });
  if (exists) return res.status(409).json(...);
  
  // Direct model access
  const created = await FruitType.create({ name });
  
  res.json({ data: created });
};
```

**Problems:**
- 🔴 Business logic mixed with HTTP handling
- 🔴 Hard to reuse logic (e.g., from CLI, jobs)
- 🔴 Difficult to test in isolation
- 🔴 Controllers become bloated

### After (With Service Layer) ✅

```javascript
// Controller is thin and focused
const createFruitType = async (req, res) => {
  try {
    // Basic validation
    if (!name) return res.status(400).json(...);
    
    // Delegate to service
    const created = await fruitTypeService.createType({ name, description });
    
    // Return response
    res.status(201).json({ data: created });
  } catch (error) {
    // Handle service errors
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json(...);
  }
};
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Business logic reusable
- ✅ Easy to test
- ✅ Controllers stay thin
- ✅ Professional architecture

---

## 📦 Example: Adding a New Feature

### Step 1: Create Model (Schema)

```javascript
// src/models/Character.js
class Character extends Model {
  static associate(models) {
    this.belongsTo(models.Race, { foreignKey: 'race_id' });
    this.hasMany(models.CharacterOrganization, { foreignKey: 'character_id' });
  }
}

Character.init({
  name: { type: DataTypes.STRING(100), allowNull: false },
  bounty: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 },
  race_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  // ... more fields
}, { sequelize });
```

### Step 2: Create Service (Business Logic)

```javascript
// src/services/character.service.js
class CharacterService {
  async getAllCharacters(filters = {}) {
    const where = {};
    if (filters.race) where.race_id = filters.race;
    if (filters.minBounty) where.bounty = { [Op.gte]: filters.minBounty };

    return await Character.findAll({
      where,
      include: ['race', 'organizations'],
      order: [['bounty', 'DESC']]
    });
  }

  async createCharacter(data) {
    // Business logic: Validate race exists
    const raceExists = await Race.findByPk(data.race_id);
    if (!raceExists) {
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

  async updateBounty(characterId, newBounty) {
    // Business logic: Log bounty changes for audit
    const character = await Character.findByPk(characterId);
    if (!character) {
      const error = new Error('Character not found');
      error.code = 'NOT_FOUND';
      throw error;
    }

    const oldBounty = character.bounty;
    await character.update({ bounty: newBounty });

    // Business logic: Log the change
    console.log(`Bounty updated: ${character.name} - ${oldBounty} → ${newBounty}`);

    return character;
  }
}

module.exports = new CharacterService();
```

### Step 3: Create Controller (HTTP Handling)

```javascript
// src/controllers/character.controller.js
const characterService = require('../services/character.service');

const getAllCharacters = async (req, res) => {
  try {
    // Parse query parameters
    const filters = {
      race: req.query.race,
      minBounty: req.query.minBounty
    };

    // Call service
    const characters = await characterService.getAllCharacters(filters);

    // Return response
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

const createCharacter = async (req, res) => {
  try {
    const { name, age, race_id, bounty } = req.body;

    // Basic validation
    if (!name || !race_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and race_id are required'
      });
    }

    // Delegate to service
    const newCharacter = await characterService.createCharacter(req.body);

    res.status(201).json({
      success: true,
      data: newCharacter
    });
  } catch (error) {
    // Handle known errors
    if (error.code === 'INVALID_RACE') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating character'
    });
  }
};

module.exports = {
  getAllCharacters,
  createCharacter
};
```

### Step 4: Create Routes

```javascript
// src/routes/character.routes.js
const express = require('express');
const router = express.Router();
const characterController = require('../controllers/character.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/characters', characterController.getAllCharacters);
router.get('/characters/:id', characterController.getCharacterById);
router.post('/characters', authMiddleware, characterController.createCharacter);
router.put('/characters/:id', authMiddleware, characterController.updateCharacter);
router.delete('/characters/:id', authMiddleware, characterController.deleteCharacter);

module.exports = router;
```

### Step 5: Register Routes

```javascript
// src/app.js
const characterRoutes = require('./routes/character.routes');

app.use('/api', characterRoutes);
```

---

## 🧪 Testing with Service Layer

### Controller Tests (Mock Service)

```javascript
// __tests__/character.test.js
jest.mock('../src/services/character.service');
const characterService = require('../src/services/character.service');

describe('Character Controller', () => {
  it('should handle service error', async () => {
    const error = new Error('Invalid race');
    error.code = 'INVALID_RACE';
    characterService.createCharacter.mockRejectedValueOnce(error);

    const response = await request(app)
      .post('/api/characters')
      .send({ name: 'Test', race_id: 999 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid race');
  });
});
```

### Service Tests (Mock Model)

```javascript
// __tests__/services/character.service.test.js
jest.mock('../../src/models/Character');
jest.mock('../../src/models/Race');
const Character = require('../../src/models/Character');
const Race = require('../../src/models/Race');
const characterService = require('../../src/services/character.service');

describe('CharacterService', () => {
  it('should throw error if race is invalid', async () => {
    Race.findByPk.mockResolvedValue(null);

    await expect(
      characterService.createCharacter({ name: 'Test', race_id: 999 })
    ).rejects.toThrow('Invalid race ID');
  });
});
```

---

## ✅ Best Practices

### DO ✅

1. **Keep layers separated**
   - Controllers → Services → Models
   - Never skip layers (Controller → Model ❌)

2. **Use error codes**
   ```javascript
   const error = new Error('Descriptive message');
   error.code = 'SEMANTIC_CODE';
   throw error;
   ```

3. **Export services as singletons**
   ```javascript
   module.exports = new FruitTypeService();
   ```

4. **Document service methods**
   ```javascript
   /**
    * Create a fruit type
    * @param {Object} data - Fruit type data
    * @returns {Promise<Object>} Created fruit type
    * @throws {Error} If validation fails
    */
   async createType(data) { ... }
   ```

5. **Use transactions for multi-step operations**
   ```javascript
   async createCharacterWithOrganization(characterData, orgData) {
     const transaction = await sequelize.transaction();
     try {
       const character = await Character.create(characterData, { transaction });
       await CharacterOrganization.create({
         character_id: character.id,
         ...orgData
       }, { transaction });
       await transaction.commit();
       return character;
     } catch (error) {
       await transaction.rollback();
       throw error;
     }
   }
   ```

### DON'T ❌

1. **Don't put business logic in controllers**
   ```javascript
   // ❌ BAD
   const create = async (req, res) => {
     const exists = await Model.findOne({ where: { name } });
     if (exists) return res.status(409).json(...);
     // ...
   };

   // ✅ GOOD
   const create = async (req, res) => {
     try {
       const data = await service.create(req.body);
       res.json(data);
     } catch (error) {
       if (error.code === 'DUPLICATE') return res.status(409).json(...);
     }
   };
   ```

2. **Don't put business logic in models**
   ```javascript
   // ❌ BAD
   class User extends Model {
     static async createWithValidation(data) {
       if (await this.exists(data.email)) throw new Error('Exists');
       return await this.create(data);
     }
   }

   // ✅ GOOD - Put in service instead
   class UserService {
     async createUser(data) {
       if (await this.emailExists(data.email)) throw new Error('Exists');
       return await User.create(data);
     }
   }
   ```

3. **Don't access models directly from controllers**
   ```javascript
  // ❌ BAD
  const getAll = async (req, res) => {
    const data = await FruitType.findAll();
    res.json(data);
  };

  // ✅ GOOD
  const getAll = async (req, res) => {
    const data = await fruitTypeService.getAllTypes();
    res.json(data);
  };
   ```

---

## 🎯 When to Use Service Layer

### Always Use Service Layer For:

- ✅ CRUD operations
- ✅ Complex queries with multiple models
- ✅ Business rule validation
- ✅ Transactions
- ✅ Data transformation
- ✅ External API integration
- ✅ Background jobs

### Can Skip Service Layer For:

- Simple pass-through operations (very rare)
- One-liner utilities
- Configuration loaders

**Recommendation:** When in doubt, use a service. It's better to have a thin service than bloated controllers.

---

## 📚 Real-World Example

### Complete Flow: Create Character

```javascript
// 1. CLIENT REQUEST
POST /api/characters
{
  "name": "Monkey D. Luffy",
  "race_id": 1,
  "bounty": 3000000000
}

// 2. CONTROLLER (HTTP Layer)
const createCharacter = async (req, res) => {
  // Parse and validate HTTP input
  if (!req.body.name) return res.status(400).json(...);
  
  // Call service
  const character = await characterService.createCharacter(req.body);
  
  // Return HTTP response
  res.status(201).json({ success: true, data: character });
};

// 3. SERVICE (Business Layer)
async createCharacter(data) {
  // Business rule: Check race exists
  const race = await Race.findByPk(data.race_id);
  if (!race) throw new Error('Invalid race');
  
  // Business rule: Check name unique
  const exists = await Character.findOne({ where: { name: data.name } });
  if (exists) throw new Error('Name exists');
  
  // Business rule: Set default bounty
  data.bounty = data.bounty || 0;
  
  // Create via model
  return await Character.create(data);
}

// 4. MODEL (Data Layer)
class Character extends Model {}
Character.init({
  // Just schema
  name: { type: DataTypes.STRING, allowNull: false },
  bounty: { type: DataTypes.BIGINT, defaultValue: 0 }
}, { sequelize });

// 5. DATABASE
INSERT INTO characters (name, race_id, bounty) VALUES (?, ?, ?)
```

---

## 🚀 Migration Path

### If You Have Existing Code Without Service Layer

1. **Create service file**
   ```bash
   touch src/services/yourEntity.service.js
   ```

2. **Move business logic from controller to service**
   - Copy logic from controller
   - Paste into service methods
   - Remove HTTP-specific code

3. **Update controller to use service**
   - Import service
   - Call service methods
   - Handle service errors

4. **Update tests to mock service**
   - Change mocks from model to service
   - Test controller logic only

5. **Create service tests**
   - Test business logic separately
   - Mock models in service tests

---

## 🎉 Congratulations!

Your project now follows professional architecture with:
- ✅ Clear separation of concerns
- ✅ Highly testable code
- ✅ Reusable business logic
- ✅ Industry-standard patterns
- ✅ Ready to scale

---

**Questions?** Open an issue or check [docs/SEQUELIZE_GUIDE.md](SEQUELIZE_GUIDE.md)

**Last updated:** October 2025

