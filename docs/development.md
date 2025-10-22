# 🛠️ Development Guide

## Local Development Setup

This guide will help you set up the One Piece API for local development.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **MySQL**: 8.0 or higher
- **npm**: 8.0 or higher
- **Git**: For version control

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vcoromero/express-onepiece-api.git
cd express-onepiece-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=onepiece_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-development-secret
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

#### Create MySQL Database
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE onepiece_db;
USE onepiece_db;
```

#### Execute Schema Files
```bash
# Execute schema files in order
for file in database/schemas/*.sql; do
  echo "Executing $file..."
  mysql -u root -p onepiece_db < "$file"
done
```

#### Verify Database Setup
```bash
# Check tables were created
mysql -u root -p -e "USE onepiece_db; SHOW TABLES;"

# Check sample data
mysql -u root -p -e "USE onepiece_db; SELECT COUNT(*) FROM characters;"
```

### 5. Start Development Server

```bash
# Start with hot reload
npm run dev

# Or start normally
npm start
```

### 6. Verify Installation

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"success":true,"message":"API is healthy","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Development Scripts

### Available Commands

```bash
# Development
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production server

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage

# Code Quality
npm run lint         # Check code style
npm run lint:fix     # Fix code style issues
npm run audit        # Security audit
npm run audit:fix    # Fix security issues
```

### Testing

#### Run All Tests
```bash
npm test
```

#### Run Specific Test Files
```bash
# Test specific module
npm test -- --testPathPattern=characters

# Test with coverage
npm test -- --coverage --testPathPattern=characters
```

#### Watch Mode
```bash
# Watch all tests
npm run test:watch

# Watch specific tests
npm run test:watch -- --testPathPattern=characters
```

## Project Structure

```
express-onepiece-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic layer
│   ├── models/          # Sequelize models
│   ├── routes/          # Route definitions
│   ├── middlewares/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app configuration
│   ├── index.js         # Application entry point
│   └── lambda.js        # AWS Lambda handler
├── __tests__/           # Test files
├── database/            # Database schema and seeds
├── docs/                # Documentation
├── coverage/            # Test coverage reports
└── logs/                # Application logs
```

## Architecture Overview

### Service Layer Pattern

```
Client Request → Controller → Service → Model → Database
                     ↓
                Response ← Controller ← Service ← Model
```

#### Controllers
- Handle HTTP requests and responses
- Validate input parameters
- Call appropriate services
- Format responses

#### Services
- Contain business logic
- Handle data processing
- Manage relationships
- Return structured responses

#### Models
- Define database schema
- Handle data validation
- Manage relationships
- Provide query interface

## Database Development

### Schema Files

The database uses modular SQL files for better organization:

```
database/schemas/
├── 01-clean-database.sql      # Clean existing data
├── 02-seed-races.sql          # Seed races
├── 03-seed-character-types.sql # Seed character types
├── 04-seed-devil-fruit-types.sql # Seed devil fruit types
├── 05-seed-organization-types.sql # Seed organization types
├── 06-seed-haki-types.sql     # Seed haki types
├── 07-seed-ships.sql          # Seed ships
├── 08-seed-characters.sql     # Seed characters
├── 09-seed-devil-fruits.sql   # Seed devil fruits
├── 10-seed-organizations.sql  # Seed organizations
├── 11-seed-character-haki.sql # Seed character-haki relationships
├── 12-seed-character-devil-fruits.sql # Seed character-devil fruit relationships
├── 13-seed-character-character-types.sql # Seed character-type relationships
└── 14-seed-character-organizations.sql # Seed character-organization relationships
```

### Adding New Data

1. **Create SQL file** in `database/schemas/`
2. **Follow naming convention**: `XX-description.sql`
3. **Test locally** before committing
4. **Update documentation** if needed

### Database Relationships

#### Character Relationships
- **Many-to-Many**: Organizations, Devil Fruits, Haki Types, Character Types
- **One-to-Many**: Race (belongs to one race)

#### Organization Relationships
- **One-to-Many**: Ships (has many ships)
- **Many-to-Many**: Characters (has many members)
- **One-to-One**: Leader (has one leader)

## API Development

### Adding New Endpoints

1. **Create Model** (if needed)
2. **Create Service** for business logic
3. **Create Controller** for HTTP handling
4. **Create Routes** for URL mapping
5. **Add Tests** for all functionality
6. **Update Documentation**

### Example: Adding a New Entity

#### 1. Create Model
```javascript
// src/models/new-entity.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

const NewEntity = sequelize.define('NewEntity', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = NewEntity;
```

#### 2. Create Service
```javascript
// src/services/new-entity.service.js
const NewEntity = require('../models/new-entity.model');

class NewEntityService {
  async getAllEntities(options = {}) {
    // Implementation
  }
  
  async getEntityById(id) {
    // Implementation
  }
  
  async createEntity(entityData) {
    // Implementation
  }
  
  async updateEntity(id, updateData) {
    // Implementation
  }
  
  async deleteEntity(id) {
    // Implementation
  }
}

module.exports = new NewEntityService();
```

#### 3. Create Controller
```javascript
// src/controllers/new-entity.controller.js
const newEntityService = require('../services/new-entity.service');

class NewEntityController {
  async getAllEntities(req, res) {
    // Implementation
  }
  
  async getEntityById(req, res) {
    // Implementation
  }
  
  async createEntity(req, res) {
    // Implementation
  }
  
  async updateEntity(req, res) {
    // Implementation
  }
  
  async deleteEntity(req, res) {
    // Implementation
  }
}

module.exports = new NewEntityController();
```

#### 4. Create Routes
```javascript
// src/routes/new-entity.routes.js
const express = require('express');
const router = express.Router();
const newEntityController = require('../controllers/new-entity.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.get('/', newEntityController.getAllEntities);
router.get('/:id', newEntityController.getEntityById);

// Protected routes
router.post('/', authMiddleware, newEntityController.createEntity);
router.put('/:id', authMiddleware, newEntityController.updateEntity);
router.delete('/:id', authMiddleware, newEntityController.deleteEntity);

module.exports = router;
```

#### 5. Add Tests
```javascript
// __tests__/new-entity.test.js
const request = require('supertest');
const app = require('../src/app');

describe('New Entity API', () => {
  test('GET /api/new-entities should return all entities', async () => {
    const response = await request(app)
      .get('/api/new-entities')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

## Debugging

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -h localhost
```

#### 2. Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

#### 3. Environment Variables
```bash
# Check environment variables
node -e "console.log(process.env.DB_HOST)"

# Verify .env file
cat .env
```

### Logging

#### Application Logs
```bash
# View application logs
tail -f logs/combined.log

# View error logs
tail -f logs/error.log
```

#### Database Logs
```bash
# View MySQL logs
sudo tail -f /var/log/mysql/error.log
```

## Code Quality

### ESLint Configuration
```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Testing Standards
- **Coverage**: Minimum 80% coverage
- **Unit Tests**: Test individual functions
- **Integration Tests**: Test API endpoints
- **Mocking**: Mock external dependencies

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Performance Optimization

### Database Queries
- Use appropriate indexes
- Avoid N+1 queries
- Use pagination for large datasets
- Optimize JOIN operations

### Memory Management
- Monitor memory usage
- Use connection pooling
- Implement proper error handling
- Clean up resources

### Caching
- Implement Redis for caching
- Use database query caching
- Cache frequently accessed data
- Implement cache invalidation

## Troubleshooting

### Common Development Issues

#### 1. Tests Failing
```bash
# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Check test environment
NODE_ENV=test npm test
```

#### 2. Database Sync Issues
```bash
# Restart application
npm run dev

# Check Sequelize sync
# Look for sync messages in console
```

#### 3. Authentication Issues
```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env with new secret
```

## Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch
3. **Make** changes with tests
4. **Run** all tests
5. **Commit** with descriptive messages
6. **Push** and create PR

### Code Standards
- Follow ESLint configuration
- Write comprehensive tests
- Document new features
- Update API documentation
- Follow commit message conventions

### Pull Request Process
1. **Describe** changes clearly
2. **Include** test results
3. **Update** documentation
4. **Request** code review
5. **Address** feedback promptly
