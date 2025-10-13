# Sequelize Guide - One Piece API

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Models](#models)
5. [Service Layer](#service-layer)
6. [Architecture](#architecture)
7. [Testing](#testing)
8. [Next Steps](#next-steps)

---

## 🎯 Introduction

This project has been migrated from vanilla SQL queries with `mysql2` to **Sequelize**, a modern ORM for Node.js that allows you to:

- ✅ Work with models instead of raw SQL queries
- ✅ Model-level validations
- ✅ Cleaner entity relationships
- ✅ More maintainable and scalable code
- ✅ Automatic migrations (optional)
- ✅ Improved type-safety

---

## 📦 Installation

Sequelize is already installed in the project:

```bash
npm install sequelize
```

**Related dependencies:**
- `mysql2` (already installed) - MySQL driver
- `sequelize` - ORM

---

## ⚙️ Configuration

### Configuration File

**Location:** `src/config/sequelize.config.js`

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'onepiece_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);
```

### Environment Variables

Make sure you have these variables in your `.env` files:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=onepiece_db
```

---

## 🏗️ Models

### Model Structure

**Location:** `src/models/`

**Example:** `src/models/fruit-type.model.js`

```javascript
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

class DevilFruitType extends Model {
  // Static helper methods
  static async getAllTypes() {
    return await this.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  static async getTypeById(id) {
    return await this.findOne({
      where: { id },
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  static async nameExists(name, excludeId = null) {
    const where = { name: name.trim() };
    if (excludeId) {
      where.id = { [require('sequelize').Op.ne]: excludeId };
    }
    const existing = await this.findOne({ where });
    return existing !== null;
  }
}

// Initialize the model
DevilFruitType.init(
  {
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
        len: { args: [1, 50], msg: 'Name cannot exceed 50 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'DevilFruitType',
    tableName: 'devil_fruit_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = DevilFruitType;
```

### Export Models

**File:** `src/models/index.js`

```javascript
const FruitType = require('./fruit-type.model');
// Import more models here

module.exports = {
  FruitType
  // Export more models here
};
```

---

## 🏢 Service Layer

### Why Service Layer?

**The Problem:** Mixing business logic in models or controllers leads to:
- 🔴 Hard to test
- 🔴 Difficult to maintain
- 🔴 Code duplication
- 🔴 Violates Single Responsibility Principle

**The Solution:** Service Layer Pattern

```
┌──────────────┐
│  Controller  │  ← HTTP handling, request/response
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Service    │  ← Business logic, orchestration
└──────┬───────┘
       │
       ↓
┌──────────────┐
│    Model     │  ← Schema, validations, relationships
└──────────────┘
```

### Service Layer Structure

**Location:** `src/services/`

**Example:** `src/services/fruit-type.service.js`

```javascript
const FruitType = require('../models/fruit-type.model');
const { Op } = require('sequelize');

class FruitTypeService {
  /**
   * Get all fruit types
   */
  async getAllTypes() {
    return await FruitType.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  /**
   * Get a fruit type by ID
   */
  async getTypeById(id) {
    return await FruitType.findOne({
      where: { id },
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  /**
   * Check if a name already exists
   */
  async nameExists(name, excludeId = null) {
    const where = { name: name.trim() };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const existing = await FruitType.findOne({ where });
    return existing !== null;
  }

  /**
   * Create a new fruit type
   */
  async createType(data) {
    const { name, description } = data;

    // Business logic: Check if name already exists
    const exists = await this.nameExists(name);
    if (exists) {
      const error = new Error('A fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Create the fruit type
    const newFruitType = await FruitType.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    return {
      id: newFruitType.id,
      name: newFruitType.name,
      description: newFruitType.description,
      created_at: newFruitType.created_at,
      updated_at: newFruitType.updated_at
    };
  }

  /**
   * Update an existing fruit type
   */
  async updateType(id, data) {
    const { name, description } = data;

    // Business logic: Check if fruit type exists
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Business logic: If name is being updated, check for duplicates
    if (name !== undefined) {
      const exists = await this.nameExists(name, id);
      if (exists) {
        const error = new Error('Another fruit type with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
    }

    // Build update object
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;

    // Update the record
    await FruitType.update(updates, { where: { id } });

    // Return updated record
    return await this.getTypeById(id);
  }

  /**
   * Delete a fruit type
   */
  async deleteType(id) {
    // Business logic: Check if fruit type exists
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Business logic: Check if there are associated fruits
    // (Implementation depends on your relationships)

    // Delete the fruit type
    await FruitType.destroy({ where: { id } });

    return { id: fruitType.id, name: fruitType.name };
  }
}

// Export as singleton
module.exports = new FruitTypeService();
```

### Controller Using Service

**File:** `src/controllers/fruit-types.controller.js`

```javascript
const fruitTypeService = require('../services/fruit-type.service');

const getAllFruitTypes = async (req, res) => {
  try {
    // Controller only handles HTTP
    const fruitTypes = await fruitTypeService.getAllTypes();
    
    res.status(200).json({
      success: true,
      count: fruitTypes.length,
      data: fruitTypes
    });
  } catch (error) {
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

    // Basic validation in controller
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Business logic in service
    const newFruitType = await fruitTypeService.createType({ name, description });

    res.status(201).json({
      success: true,
      message: 'Fruit type created successfully',
      data: newFruitType
    });
  } catch (error) {
    console.error('Error creating fruit type:', error);

    // Handle known service errors
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
```

### Benefits of Service Layer

| Benefit | Description |
|---------|-------------|
| **Separation of Concerns** | Controllers handle HTTP, Services handle business logic, Models handle data |
| **Testability** | Easy to mock services in controller tests, easy to test services independently |
| **Reusability** | Services can be used from controllers, scheduled jobs, CLI commands, etc. |
| **Maintainability** | Changes to business logic only affect services, not controllers or models |
| **Scalability** | Services can orchestrate multiple models and external APIs |

---

## 🏗️ Architecture

### Recommended Folder Structure

```
src/
├── models/              # Data models (schema, validations, relationships)
│   ├── fruit-type.model.js
│   ├── character.model.js
│   └── index.js
│
├── services/            # Business logic layer
│   ├── fruit-type.service.js
│   ├── character.service.js
│   └── auth.service.js
│
├── controllers/         # HTTP handling layer
│   ├── fruit-types.controller.js
│   ├── character.controller.js
│   └── auth.controller.js
│
└── routes/              # Route definitions
    ├── fruit-types.routes.js
    ├── character.routes.js
    └── auth.routes.js
```

### Responsibilities by Layer

#### Models (Schema Layer)
```javascript
class DevilFruitType extends Model {}

DevilFruitType.init({
  // ✅ Define schema
  // ✅ Define validations
  // ✅ Define relationships
  // ❌ NO business logic
  // ❌ NO queries (use services)
});
```

#### Services (Business Logic Layer)
```javascript
class FruitTypeService {
  // ✅ Business logic
  // ✅ Complex queries
  // ✅ Transactions
  // ✅ Orchestrate multiple models
  // ❌ NO HTTP handling
  // ❌ NO request/response objects
}
```

#### Controllers (HTTP Layer)
```javascript
const getAllFruitTypes = async (req, res) => {
  // ✅ Parse request
  // ✅ Basic validation
  // ✅ Call services
  // ✅ Format response
  // ❌ NO business logic
  // ❌ NO direct model access
};
```

---

## 🎮 Usage in Controllers (Deprecated Pattern)

**⚠️ Note:** The pattern below is deprecated. Use Service Layer instead (see above).

<details>
<summary>Click to see old pattern (not recommended)</summary>

### Before (Vanilla SQL Queries)

```javascript
const { pool } = require('../config/db.config');

const getAllFruitTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description FROM devil_fruit_types ORDER BY id ASC'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Now (With Sequelize + Service Layer) ✨

```javascript
const fruitTypeService = require('../services/fruit-type.service');

const getAllFruitTypes = async (req, res) => {
  try {
    const fruitTypes = await fruitTypeService.getAllTypes();
    res.json({ success: true, data: fruitTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Common CRUD Operations

#### Create
```javascript
// Via Service (recommended)
const newFruitType = await fruitTypeService.createType({
  name: 'Mythical Zoan',
  description: 'Rare Zoan type'
});

// Direct model access (only in services)
const newFruitType = await FruitType.create({
  name: 'Mythical Zoan',
  description: 'Rare Zoan type'
});
```

#### Read
```javascript
// Via Service (recommended)
const allTypes = await fruitTypeService.getAllTypes();
const type = await fruitTypeService.getTypeById(1);

// Direct model access (only in services)
const allTypes = await FruitType.findAll();
const type = await FruitType.findByPk(1);
const paramecia = await FruitType.findOne({
  where: { name: 'Paramecia' }
});
```

#### Update
```javascript
// Via Service (recommended)
await fruitTypeService.updateType(id, { name: 'New Name' });

// Direct model access (only in services)
const fruitType = await FruitType.findByPk(id);
await fruitType.update({ name: 'New Name' });

// Or update directly
await FruitType.update(
  { description: 'Updated description' },
  { where: { id: 1 } }
);
```

#### Delete
```javascript
// Via Service (recommended)
await fruitTypeService.deleteType(id);

// Direct model access (only in services)
const fruitType = await FruitType.findByPk(id);
await fruitType.destroy();

// Or delete directly
await FruitType.destroy({ where: { id: 1 } });
```

</details>

---

## 🧪 Testing

### Mocking the Service Layer

**Best Practice:** Mock the Service Layer, not the Model directly.

**Location:** `__tests__/fruit-types.test.js`

```javascript
// Mock the Service Layer
jest.mock('../src/services/fruitType.service', () => ({
  getAllTypes: jest.fn(),
  getTypeById: jest.fn(),
  createType: jest.fn(),
  updateType: jest.fn(),
  deleteType: jest.fn()
}));

const fruitTypeService = require('../src/services/fruitType.service');

describe('Fruit Types API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all fruit types', async () => {
    // Mock service response
    const mockData = [
      { id: 1, name: 'Paramecia', description: 'Test', created_at: new Date(), updated_at: new Date() }
    ];
    fruitTypeService.getAllTypes.mockResolvedValueOnce(mockData);
    
    const response = await request(app).get('/api/fruit-types');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockData);
    expect(fruitTypeService.getAllTypes).toHaveBeenCalledTimes(1);
  });

  it('should handle service errors gracefully', async () => {
    // Mock service throwing an error
    const error = new Error('Service error');
    error.code = 'DUPLICATE_NAME';
    fruitTypeService.createType.mockRejectedValueOnce(error);
    
    const response = await request(app)
      .post('/api/fruit-types')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(409); // Conflict
    expect(response.body.message).toContain('exists');
  });
});
```

### Why Mock Services Instead of Models?

| Approach | Pros | Cons |
|----------|------|------|
| **Mock Service** ✅ | Tests controller logic only, Fast, Follows architecture | Doesn't test service logic |
| **Mock Model** ❌ | Tests controller + service | Breaks encapsulation, Harder to maintain |
| **Integration Test** 🔄 | Tests full stack | Slow, Needs DB, Complex setup |

**Recommendation:** Use all three:
1. **Unit tests:** Mock services (fast, most tests)
2. **Integration tests:** Real DB (fewer tests, critical paths)
3. **Service tests:** Test service logic separately

---

## 🚀 Next Steps

### 1. Create Service for Each Entity

Follow the Service Layer pattern for new features:

```
src/
├── models/
│   ├── fruit-type.model.js       ✅ Done
│   ├── character.model.js        ← Create this
│   ├── devil-fruit.model.js      ← Create this
│   └── organization.model.js     ← Create this
│
└── services/
    ├── fruit-type.service.js     ✅ Done
    ├── character.service.js      ← Create this
    ├── devil-fruit.service.js    ← Create this
    └── organization.service.js   ← Create this
```

### 2. Define Relationships Between Models

**Example relationships:**

```javascript
// In DevilFruit.js
class DevilFruit extends Model {
  static associate(models) {
    // A Devil Fruit belongs to a type
    this.belongsTo(models.DevilFruitType, {
      foreignKey: 'type_id',
      as: 'type'
    });
    
    // A Devil Fruit can have a current user
    this.belongsTo(models.Character, {
      foreignKey: 'current_user_id',
      as: 'currentUser'
    });
  }
}

// In DevilFruitType.js
class DevilFruitType extends Model {
  static associate(models) {
    // A type can have many fruits
    this.hasMany(models.DevilFruit, {
      foreignKey: 'type_id',
      as: 'fruits'
    });
  }
}
```

### 3. Queries with Relationships

```javascript
// Get fruit type with all its fruits
const fruitType = await FruitType.findByPk(1, {
  include: [{
    model: DevilFruit,
    as: 'fruits'
  }]
});

// Get devil fruit with its type and current user
const devilFruit = await DevilFruit.findByPk(1, {
  include: [
    { model: FruitType, as: 'type' },
    { model: Character, as: 'currentUser' }
  ]
});
```

### 4. Create Service Tests

Test your services independently:

```javascript
// __tests__/services/fruit-type.service.test.js
const fruitTypeService = require('../../src/services/fruit-type.service');
const FruitType = require('../../src/models/fruit-type.model');

jest.mock('../../src/models/fruit-type.model');

describe('FruitTypeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTypes', () => {
    it('should return all fruit types ordered by id', async () => {
      const mockTypes = [
        { id: 1, name: 'Paramecia' },
        { id: 2, name: 'Zoan' }
      ];
      FruitType.findAll.mockResolvedValue(mockTypes);

      const result = await fruitTypeService.getAllTypes();

      expect(result).toEqual(mockTypes);
      expect(FruitType.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        attributes: expect.any(Array)
      });
    });
  });

  describe('createType', () => {
    it('should throw error if name exists', async () => {
      FruitType.findOne.mockResolvedValue({ id: 1, name: 'Paramecia' });

      await expect(
        fruitTypeService.createType({ name: 'Paramecia' })
      ).rejects.toThrow('already exists');
    });

    it('should create type if name is unique', async () => {
      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockResolvedValue({
        id: 1,
        name: 'New Type',
        description: 'Test'
      });

      const result = await fruitTypeService.createType({
        name: 'New Type',
        description: 'Test'
      });

      expect(result).toHaveProperty('id', 1);
      expect(FruitType.create).toHaveBeenCalled();
    });
  });
});
```

### 5. Implement Migrations (Optional)

Sequelize can generate and run migrations:

```bash
# Install CLI
npm install --save-dev sequelize-cli

# Initialize
npx sequelize-cli init

# Create migration
npx sequelize-cli migration:generate --name create-devil-fruits

# Run migrations
npx sequelize-cli db:migrate
```

### 6. Add Custom Validations

```javascript
class DevilFruitType extends Model {}

DevilFruitType.init({
  name: {
    type: DataTypes.STRING(50),
    validate: {
      notEmpty: true,
      isAlphanumeric: true, // Only alphanumeric
      len: [1, 50],
      // Custom validation
      isUnique: async (value) => {
        const exists = await DevilFruitType.findOne({ where: { name: value } });
        if (exists) {
          throw new Error('Name must be unique');
        }
      }
    }
  }
});
```

---

## 📚 Additional Resources

- [Official Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Sequelize API Reference](https://sequelize.org/api/v6/)
- [Migrations Guide](https://sequelize.org/docs/v6/other-topics/migrations/)
- [Validations](https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/)

---

## 💡 Tips and Best Practices

### Architecture Best Practices

1. **Use Service Layer** - Keep business logic in services, not controllers or models
2. **Models = Schema Only** - Models should only define structure, validations, and relationships
3. **Services = Business Logic** - Services orchestrate models and implement business rules
4. **Controllers = HTTP Only** - Controllers handle requests/responses, call services
5. **Mock Services in Tests** - Test controllers by mocking services, not models

### Sequelize Best Practices

1. **Use transactions** - For operations requiring atomicity
   ```javascript
   const transaction = await sequelize.transaction();
   try {
     await Model1.create(data, { transaction });
     await Model2.update(data, { where: { id }, transaction });
     await transaction.commit();
   } catch (error) {
     await transaction.rollback();
     throw error;
   }
   ```

2. **Lazy loading vs Eager loading** - Choose based on needs
   ```javascript
   // Lazy loading (N+1 problem)
   const types = await DevilFruitType.findAll();
   for (const type of types) {
     const fruits = await type.getFruits(); // ❌ Multiple queries
   }

   // Eager loading (better performance)
   const types = await DevilFruitType.findAll({
     include: ['fruits'] // ✅ Single query with JOIN
   });
   ```

3. **Define indexes** - For better query performance
   ```javascript
   DevilFruitType.init({
     name: { type: DataTypes.STRING }
   }, {
     indexes: [
       { fields: ['name'] },
       { fields: ['created_at', 'status'] }
     ]
   });
   ```

4. **Use hooks wisely** - For automatic logic
   ```javascript
   DevilFruitType.beforeCreate((instance) => {
     instance.name = instance.name.toUpperCase();
   });
   ```

5. **Use scopes** - Define common queries
   ```javascript
   DevilFruitType.init({}, {
     scopes: {
       active: { where: { status: 'active' } },
       withFruits: { include: ['fruits'] }
     }
   });

   // Usage
   const activeTypes = await DevilFruitType.scope('active').findAll();
   ```

### Error Handling in Services

```javascript
class FruitTypeService {
  async createType(data) {
    // Use error codes for better handling
    const exists = await this.nameExists(data.name);
    if (exists) {
      const error = new Error('Name already exists');
      error.code = 'DUPLICATE_NAME'; // ← Custom error code
      throw error;
    }
    // ...
  }
}

// In controller
try {
  await fruitTypeService.createType(data);
} catch (error) {
  if (error.code === 'DUPLICATE_NAME') {
    return res.status(409).json({ message: error.message });
  }
  // Handle other errors
}
```

---

## 🎉 Congratulations!

Your project now uses Sequelize and is ready to scale. The code is cleaner, more maintainable, and professional.

**Questions?** Check the documentation or open an issue.

---

**Last updated:** October 2025
