# Project Structure Guide

## 📁 Project Structure

```
express-onepiece-api/
├── 📂 configs/                    # Environment variables (.env files)
│   ├── .env                       # Development (NOT committed)
│   ├── .env.test                  # Testing (NOT committed)
│   ├── .env.qa                    # QA template
│   ├── .env.production            # Production template
│   └── README.md                  # Configuration guide
│
├── 📂 src/                        # Source code
│   ├── 📂 config/                 # Code configurations
│   │   ├── db.config.js           # MySQL connection pool (legacy)
│   │   └── sequelize.config.js    # Sequelize ORM config
│   │
│   ├── 📂 models/                 # Sequelize models
│   │   ├── fruit-type.model.js    # Fruit types model
│   │   └── index.js               # Exports all models
│   │
│   ├── 📂 controllers/            # Business logic
│   │   ├── auth.controller.js     # Login, verify token
│   │   ├── health.controller.js   # Health check
│   │   └── fruit-types.controller.js # Fruit types CRUD
│   │
│   ├── 📂 routes/                 # Route definitions
│   │   ├── auth.routes.js         # Authentication routes
│   │   ├── health.routes.js       # Health check route
│   │   └── fruit-types.routes.js  # Fruit types routes
│   │
│   ├── 📂 middlewares/            # Custom middlewares
│   │   ├── auth.middleware.js     # JWT token verification
│   │   └── rate-limiter.js        # Rate limiting config
│   │
│   ├── 📂 utils/                  # Utilities and helpers
│   │   ├── jwt.util.js            # JWT generation/verification
│   │   └── logger.js              # Winston logger (CloudWatch ready)
│   │
│   ├── app.js                     # Express app setup
│   └── index.js                   # Entry point (starts server)
│
├── 📂 __tests__/                  # Unit tests
│   ├── auth.test.js
│   ├── health.test.js
│   ├── fruit-types.test.js
│   └── rate-limiter.test.js
│
├── 📂 database/                   # Database scripts
│   ├── schema.sql                 # Complete DB schema
│   └── README.md                  # Database documentation
│
├── 📂 docs/                       # Documentation
│   ├── AWS_DEPLOYMENT.md          # AWS deployment guide
│   ├── AUTHENTICATION.md          # Auth and JWT guide
│   ├── SEQUELIZE_GUIDE.md         # Sequelize usage guide
│   └── PROJECT_STRUCTURE.md       # This file
│
├── 📂 logs/                       # Application logs (NOT committed)
│   ├── combined.log               # All logs
│   ├── error.log                  # Errors only
│   └── security.log               # Security events
│
├── 📂 coverage/                   # Test coverage reports (generated)
│
├── 📄 Dockerfile                  # Docker configuration
├── 📄 .dockerignore               # Docker ignore rules
├── 📄 .gitignore                  # Git ignore rules
├── 📄 .eslintrc.json              # ESLint configuration
├── 📄 babel.config.js             # Babel config for Jest
├── 📄 jest.setup.js               # Jest test setup
├── 📄 package.json                # Dependencies & scripts
├── 📄 package-lock.json           # Lockfile
└── 📄 README.md                   # Main documentation
```

---

## 🤔 Why are `configs/` and `src/config/` separate?

### `configs/` - Environment Variables
**Purpose:** Contains `.env` files with secrets and environment-specific configuration

**Characteristics:**
- ❌ **NOT committed** (except templates)
- 🔒 Contains **sensitive information** (passwords, secrets)
- 🌍 **Different per environment** (dev, test, prod)
- 📝 Plain **text files** (.env)

**Example:**
```
configs/
├── .env              # Your local config (ignored by git)
├── .env.test         # Test config (ignored by git)
├── .env.production   # Production template
```

### `src/config/` - Code Configuration
**Purpose:** Contains JavaScript files with configuration logic

**Characteristics:**
- ✅ **ARE committed** (it's source code)
- 🔓 **Don't contain secrets** (read from process.env)
- 🔧 **Reusable logic** (functions, connections)
- 💻 **Code files** (.js)

**Example:**
```
src/config/
├── db.config.js         # MySQL connection setup
├── sequelize.config.js  # Sequelize ORM setup
```

### Analogy
```
configs/    = "Your house keys" (secrets, don't share them)
src/config/ = "The lock" (code that uses the keys)
```

---

## 📂 Detailed Description

### `/configs` - Environment Variables

Stores configuration per environment.

**Files:**
- `.env` - Your local configuration (created automatically)
- `.env.test` - Configuration for tests
- `.env.qa` - Template for QA
- `.env.production` - Template for production
- `README.md` - Detailed configuration guide

**Example content:**
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=secret
JWT_SECRET=your-secret-key
```

---

### `/src` - Source Code

All application code.

#### `/src/config` - Code Configurations

Configuration files in code.

**`db.config.js`** (Legacy - direct mysql2):
```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  // ...
});
```

**`sequelize.config.js`** (New - Sequelize ORM):
```javascript
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { /* config */ }
);
```

#### `/src/models` - Sequelize Models

Data models with Sequelize ORM.

**Advantages:**
- Model-level validations
- Cleaner queries
- Automatic relationships
- Improved type-safety

**Example:**
```javascript
class DevilFruitType extends Model {
  static async getAllTypes() {
    return await this.findAll({ order: [['id', 'ASC']] });
  }
}
```

#### `/src/controllers` - Business Logic

Contains business logic for each endpoint.

**Responsibilities:**
- Process requests
- Validate data
- Call models/services
- Format responses
- Handle errors

**Pattern:**
```javascript
const someAction = async (req, res) => {
  try {
    // 1. Validate input
    // 2. Process logic
    // 3. Respond with JSON
  } catch (error) {
    // Handle error
  }
};
```

#### `/src/routes` - Route Definitions

Defines HTTP routes and connects them to controllers.

**Responsibilities:**
- Map URLs to controllers
- Apply middlewares
- Define HTTP methods

**Example:**
```javascript
router.get('/items', controller.getAll);           // Public
router.post('/items', authMiddleware, controller.create); // Protected
```

#### `/src/middlewares` - Custom Middlewares

Functions that process requests before reaching controllers.

**`auth.middleware.js`:**
- Verifies JWT tokens
- Adds `req.user` with token info
- Returns 401 if token invalid

**`rate-limiter.js`:**
- Limits requests per IP
- Prevents abuse and attacks
- Protects cloud costs

#### `/src/utils` - Utilities

Reusable helper functions.

**`jwt.util.js`:**
- `generateToken()` - Creates JWT
- `verifyToken()` - Validates JWT
- `decodeToken()` - Decodes without verifying

**`logger.js`:**
- Configured Winston logger
- Multiple levels (debug, info, warn, error)
- CloudWatch integration
- Logs to files and console

#### `app.js` vs `index.js`

**`app.js`:**
- Configures Express
- Applies middlewares
- Defines routes
- **Does NOT start the server**
- **Exports `app` for tests**

**`index.js`:**
- Imports `app` from `app.js`
- **Starts the server** with `app.listen()`
- Application entry point

**Why separate?**
- Tests can import `app` without starting server
- Better separation of concerns
- More testable

---

### `/__tests__` - Unit Tests

Tests with Jest.

**Characteristics:**
- Use mocks (don't touch real DB)
- Fast and reliable
- Coverage reports
- CI/CD ready

**Convention:**
```
src/controllers/auth.controller.js
→ __tests__/auth.test.js

src/middlewares/rate-limiter.js
→ __tests__/rate-limiter.test.js
```

---

### `/database` - Database Scripts

Scripts and database documentation.

**`schema.sql`:**
- Complete MySQL schema
- Seed data included
- Normalized tables (3NF)
- No stored procedures (logic in app)

**Main tables:**
- `devil_fruit_types` - Fruit types (Paramecia, Zoan, Logia)
- `characters` - Characters
- `devil_fruits` - Devil fruits
- `organizations` - Organizations/crews
- And more...

---

### `/docs` - Documentation

Technical project documentation.

**Files:**
- `AWS_DEPLOYMENT.md` - AWS deployment
- `AUTHENTICATION.md` - Auth and JWT
- `SEQUELIZE_GUIDE.md` - Sequelize usage
- `PROJECT_STRUCTURE.md` - This file

**Advantage:**
- Main README more concise
- Modular and focused documentation
- Easy to maintain

---

### `/logs` - Application Logs

Logs generated by Winston.

**⚠️ NOT committed** (in `.gitignore`)

**Files:**
- `combined.log` - All logs
- `error.log` - Errors only
- `security.log` - Security events (logins, invalid tokens)

**Rotation:**
- Files rotate automatically by date
- Maximum 14 days history
- Compressed with gzip

---

## 🔄 Request Flow

```
1. Client makes request
   ↓
2. Express receives in app.js
   ↓
3. Rate Limiter middleware checks limits
   ↓
4. Router in /src/routes/ matches URL
   ↓
5. Auth Middleware (if protected route) verifies token
   ↓
6. Controller processes business logic
   ↓
7. Model/Sequelize interacts with DB
   ↓
8. Controller formats response
   ↓
9. Logger records the request
   ↓
10. Response sent to client
```

---

## 🎯 Best Practices

### ✅ DO

- Keep controllers thin (simple logic)
- Use models for complex queries
- Validate at multiple levels (routes, controllers, models)
- Log important events
- Write tests for new functionality
- Document important changes

### ❌ DON'T

- Don't put business logic in routes
- Don't commit `.env` files
- Don't put secrets in code
- Don't write raw SQL queries (use Sequelize)
- Don't ignore errors
- Don't mix concerns (clear separation)

---

## 📦 Adding New Functionality

### Example: Add Characters CRUD

1. **Create model:**
   ```
   src/models/Character.js
   ```

2. **Create controller:**
   ```
   src/controllers/character.controller.js
   ```

3. **Create routes:**
   ```
   src/routes/character.routes.js
   ```

4. **Register routes in app.js:**
   ```javascript
   const characterRoutes = require('./routes/character.routes');
   app.use('/api', characterRoutes);
   ```

5. **Create tests:**
   ```
   __tests__/character.test.js
   ```

6. **Document:**
   - Update README with new endpoints
   - Add examples to Postman collection

---

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (hot reload)

# Production
npm start               # Start server in production

# Testing
npm test                # Run tests with coverage
npm run test:watch      # Tests in watch mode

# Code Quality
npm run lint            # Check linting
npm run lint:fix        # Fix linting issues

# Security
npm run audit           # Security audit
npm run audit:fix       # Fix vulnerabilities
```

---

**Questions about structure?** Open an issue in the repo.
