# Service Layer Pattern

## 🎯 Overview

This project follows the **Service Layer Pattern**, a proven architecture used in professional applications like NestJS, Spring Boot, and Django.

```
┌──────────────────┐
│    Controller    │  ← HTTP: Requests/Responses
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│     Service      │  ← Business Logic
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│      Model       │  ← Data: Schema, Validations, Relationships
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
const { DataTypes, Model } = require('sequelize');

class FruitType extends Model {
  static associate(models) {
    // ✅ Define relationships
    this.hasMany(models.DevilFruit, {
      foreignKey: 'type_id',
      as: 'fruits'
    });
  }
}

FruitType.init({
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
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [1, 50], msg: 'Name max 50 chars' }
    }
  },
  description: { type: DataTypes.TEXT, allowNull: true }
}, {
  sequelize,
  tableName: 'devil_fruit_types'
});
```

**What belongs in Models:**
- ✅ Schema definition
- ✅ Field validations
- ✅ Relationships (associations)
- ❌ **NO** business logic
- ❌ **NO** query methods

---

### 2. Service Layer (Business Logic)

**Location:** `src/services/`  
**Responsibility:** Implement ALL business logic

```javascript
const FruitType = require('../models/fruit-type.model');
const { Op } = require('sequelize');

class FruitTypeService {
  async getAllTypes() {
    return await FruitType.findAll({
      order: [['id', 'ASC']]
    });
  }

  async createType(data) {
    const { name, description } = data;

    // Business rule: Name must be unique
    const exists = await FruitType.findOne({ where: { name: name.trim() } });
    if (exists) {
      const error = new Error('A fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Create record
    return await FruitType.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });
  }

  async deleteType(id) {
    // Business rule: Check existence
    const fruitType = await FruitType.findByPk(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Business rule: Check associations
    const hasAssociated = await this.hasAssociatedFruits(id);
    if (hasAssociated) {
      const error = new Error('Cannot delete fruit type with associated fruits');
      error.code = 'HAS_ASSOCIATIONS';
      throw error;
    }

    await FruitType.destroy({ where: { id } });
    return fruitType;
  }

  async hasAssociatedFruits(id) {
    // Check if there are associated fruits...
  }
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
- ❌ **NO** HTTP handling (req, res)
- ❌ **NO** direct access from routes

---

### 3. Controller Layer (HTTP Handling)

**Location:** `src/controllers/`  
**Responsibility:** Handle HTTP requests/responses

```javascript
const fruitTypeService = require('../services/fruit-type.service');

const getAllFruitTypes = async (req, res) => {
  try {
    const fruitTypes = await fruitTypeService.getAllTypes();

    res.status(200).json({
      success: true,
      count: fruitTypes.length,
      data: fruitTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fruit types'
    });
  }
};

const createFruitType = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Basic HTTP validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Delegate logic to service
    const newFruitType = await fruitTypeService.createType({ name, description });

    res.status(201).json({
      success: true,
      data: newFruitType
    });
  } catch (error) {
    // Map service errors to HTTP status codes
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating fruit type'
    });
  }
};

module.exports = {
  getAllFruitTypes,
  createFruitType
};
```

**What belongs in Controllers:**
- ✅ Parse request (body, params, query)
- ✅ Basic input validation
- ✅ Call service methods
- ✅ Format HTTP responses
- ✅ Map errors to HTTP status codes
- ❌ **NO** business logic
- ❌ **NO** direct model access

---

## 📋 Responsibility Table

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
jest.mock('../src/services/fruit-type.service');
const fruitTypeService = require('../src/services/fruit-type.service');

it('should return 409 when name exists', async () => {
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
jest.mock('../../src/models/fruit-type.model');
const FruitType = require('../../src/models/fruit-type.model');

it('should throw error if name exists', async () => {
  FruitType.findOne.mockResolvedValue({ id: 1 });

  await expect(
    fruitTypeService.createType({ name: 'Existing' })
  ).rejects.toThrow('already exists');
});
```

---

## 🎯 Benefits of Service Layer

### Before (Without Service Layer) ❌

```javascript
// Controller with mixed business logic
const createFruitType = async (req, res) => {
  if (!name) return res.status(400).json(...);
  
  // Business logic in controller
  const exists = await FruitType.findOne({ where: { name } });
  if (exists) return res.status(409).json(...);
  
  const created = await FruitType.create({ name });
  res.json({ data: created });
};
```

**Problems:**
- 🔴 Business logic mixed with HTTP
- 🔴 Hard to reuse (from CLI, jobs, etc.)
- 🔴 Difficult to test in isolation
- 🔴 Controllers become bloated

### After (With Service Layer) ✅

```javascript
// Controller focused only on HTTP
const createFruitType = async (req, res) => {
  try {
    if (!name) return res.status(400).json(...);
    
    const created = await fruitTypeService.createType({ name, description });
    
    res.status(201).json({ data: created });
  } catch (error) {
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

## 📦 Adding New Functionality

### Step 1: Create Model

```javascript
// src/models/character.model.js
class Character extends Model {
  static associate(models) {
    this.belongsTo(models.Race, { foreignKey: 'race_id' });
  }
}

Character.init({
  name: { type: DataTypes.STRING(100), allowNull: false },
  bounty: { type: DataTypes.BIGINT.UNSIGNED, defaultValue: 0 },
  race_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
}, { sequelize });
```

### Step 2: Create Service

```javascript
// src/services/character.service.js
class CharacterService {
  async createCharacter(data) {
    // Business rule: Validate race exists
    const raceExists = await Race.findByPk(data.race_id);
    if (!raceExists) {
      const error = new Error('Invalid race ID');
      error.code = 'INVALID_RACE';
      throw error;
    }

    // Business rule: Name unique
    const exists = await Character.findOne({ where: { name: data.name } });
    if (exists) {
      const error = new Error('Character name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    return await Character.create(data);
  }
}

module.exports = new CharacterService();
```

### Step 3: Create Controller

```javascript
// src/controllers/character.controller.js
const characterService = require('../services/character.service');

const createCharacter = async (req, res) => {
  try {
    const { name, race_id, bounty } = req.body;

    // Basic validation
    if (!name || !race_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and race_id are required'
      });
    }

    const newCharacter = await characterService.createCharacter(req.body);

    res.status(201).json({
      success: true,
      data: newCharacter
    });
  } catch (error) {
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
```

### Step 4: Create Routes

```javascript
// src/routes/character.routes.js
const router = express.Router();
const characterController = require('../controllers/character.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/characters', characterController.getAllCharacters);
router.post('/characters', authMiddleware, characterController.createCharacter);

module.exports = router;
```

### Step 5: Register Routes

```javascript
// src/app.js
const characterRoutes = require('./routes/character.routes');
app.use('/api', characterRoutes);
```

---

## ✅ Best Practices

### DO ✅

1. **Keep layers separated**
   - Never skip layers (Controller → Model ❌)
   - Always: Controller → Service → Model ✅

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

4. **Use transactions for multi-step operations**
   ```javascript
   const transaction = await sequelize.transaction();
   try {
     await Character.create(data, { transaction });
     await Organization.create(orgData, { transaction });
     await transaction.commit();
   } catch (error) {
     await transaction.rollback();
     throw error;
   }
   ```

### DON'T ❌

1. **Don't put business logic in controllers**
   ```javascript
   // ❌ BAD
   const create = async (req, res) => {
     const exists = await Model.findOne({ where: { name } });
     if (exists) return res.status(409).json(...);
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

2. **Don't access models directly from controllers**
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

### Always Use For:
- ✅ CRUD operations
- ✅ Complex queries with multiple models
- ✅ Business rule validation
- ✅ Transactions
- ✅ Data transformation
- ✅ External API integration

### Can Skip For:
- Simple pass-through operations (very rare)
- One-liner utilities
- Configuration loaders

**Recommendation:** When in doubt, use a service. It's better to have a thin service than bloated controllers.

---

## 📚 More Information

- [Sequelize Guide](SEQUELIZE_GUIDE.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Authentication](AUTHENTICATION.md)