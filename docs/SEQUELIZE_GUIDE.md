# Sequelize ORM Guide

## 🎯 Introduction

This project has migrated from vanilla SQL queries with `mysql2` to **Sequelize**, a modern ORM for Node.js that allows you to:

- ✅ Work with models instead of raw SQL queries
- ✅ Model-level validations
- ✅ Cleaner entity relationships
- ✅ More maintainable and scalable code
- ✅ Improved type-safety

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

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=onepiece_db
```

---

## 🏗️ Model Structure

### Example: DevilFruitType Model

**Location:** `src/models/fruit-type.model.js`

```javascript
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

class DevilFruitType extends Model {
  // Static helper methods (optional)
  static async getAllTypes() {
    return await this.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
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

## 🏢 Service Layer Pattern

### Why Service Layer?

**Problem without Service Layer:**
- 🔴 Business logic mixed in controllers or models
- 🔴 Hard to test
- 🔴 Code duplication
- 🔴 Violates Single Responsibility Principle

**Solution: Service Layer**

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

### Service Example

**Location:** `src/services/fruit-type.service.js`

```javascript
const FruitType = require('../models/fruit-type.model');
const { Op } = require('sequelize');

class FruitTypeService {
  async getAllTypes() {
    return await FruitType.findAll({
      order: [['id', 'ASC']]
    });
  }

  async getTypeById(id) {
    return await FruitType.findOne({ where: { id } });
  }

  async createType(data) {
    const { name, description } = data;

    // Business logic: Check if name exists
    const exists = await FruitType.findOne({ where: { name: name.trim() } });
    if (exists) {
      const error = new Error('A fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Create
    return await FruitType.create({
      name: name.trim(),
      description: description ? description.trim() : null
    });
  }

  async updateType(id, data) {
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Check for duplicate name
    if (data.name) {
      const exists = await FruitType.findOne({
        where: {
          name: data.name,
          id: { [Op.ne]: id }
        }
      });
      if (exists) {
        const error = new Error('Another fruit type with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
    }

    await FruitType.update(data, { where: { id } });
    return await this.getTypeById(id);
  }

  async deleteType(id) {
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    await FruitType.destroy({ where: { id } });
    return fruitType;
  }
}

// Export as singleton
module.exports = new FruitTypeService();
```

### Controller Using Service

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

    // Basic validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Delegate to service
    const newFruitType = await fruitTypeService.createType({ name, description });

    res.status(201).json({
      success: true,
      data: newFruitType
    });
  } catch (error) {
    // Handle known service errors
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
```

---

## 🏗️ Architecture

### Responsibilities by Layer

#### Models (Schema Layer)
```javascript
// ✅ Define schema
// ✅ Define validations
// ✅ Define relationships
// ❌ NO business logic
// ❌ NO complex queries
```

#### Services (Business Logic Layer)
```javascript
// ✅ Business logic
// ✅ Complex queries
// ✅ Transactions
// ✅ Orchestrate multiple models
// ❌ NO HTTP handling
// ❌ NO req/res objects
```

#### Controllers (HTTP Layer)
```javascript
// ✅ Parse request
// ✅ Basic validation
// ✅ Call services
// ✅ Format response
// ❌ NO business logic
// ❌ NO direct model access
```

---

## 🧪 Testing

### Mock the Service Layer

**Location:** `__tests__/fruit-types.test.js`

```javascript
jest.mock('../src/services/fruit-type.service');
const fruitTypeService = require('../src/services/fruit-type.service');

describe('Fruit Types API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all fruit types', async () => {
    const mockData = [
      { id: 1, name: 'Paramecia', description: 'Test' }
    ];
    fruitTypeService.getAllTypes.mockResolvedValueOnce(mockData);
    
    const response = await request(app).get('/api/fruit-types');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(mockData);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    error.code = 'DUPLICATE_NAME';
    fruitTypeService.createType.mockRejectedValueOnce(error);
    
    const response = await request(app)
      .post('/api/fruit-types')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(409);
  });
});
```

---

## 🚀 Model Relationships

### Define Relationships

```javascript
// In DevilFruit.js
class DevilFruit extends Model {
  static associate(models) {
    // A devil fruit belongs to a type
    this.belongsTo(models.DevilFruitType, {
      foreignKey: 'type_id',
      as: 'type'
    });
    
    // A devil fruit can have a current user
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

### Queries with Relationships

```javascript
// Get type with all its fruits
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

---

## 💡 Best Practices

### 1. Use Transactions

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

### 2. Eager Loading vs Lazy Loading

```javascript
// ❌ Lazy loading (N+1 problem)
const types = await DevilFruitType.findAll();
for (const type of types) {
  const fruits = await type.getFruits(); // Multiple queries
}

// ✅ Eager loading (better performance)
const types = await DevilFruitType.findAll({
  include: ['fruits'] // Single query with JOIN
});
```

### 3. Use Error Codes

```javascript
class FruitTypeService {
  async createType(data) {
    const exists = await this.nameExists(data.name);
    if (exists) {
      const error = new Error('Name already exists');
      error.code = 'DUPLICATE_NAME'; // ← Error code
      throw error;
    }
  }
}

// In controller
try {
  await fruitTypeService.createType(data);
} catch (error) {
  if (error.code === 'DUPLICATE_NAME') {
    return res.status(409).json({ message: error.message });
  }
  res.status(500).json({ message: 'Internal error' });
}
```

---

## 📚 Additional Resources

- [Official Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Service Layer Pattern Guide](SERVICE_LAYER_PATTERN.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [Sequelize API Reference](https://sequelize.org/api/v6/)