# Project Structure Guide

## 📁 Folder Tree

```
express-onepiece-api/
├── 📂 configs/              # Environment variables (.env)
├── 📂 src/                  # Source code
│   ├── config/              # Code configuration
│   ├── models/              # Sequelize models
│   ├── services/            # Business logic ⭐
│   ├── controllers/         # HTTP handling
│   ├── routes/              # Route definitions
│   ├── middlewares/         # Auth, rate limiting
│   ├── utils/               # JWT, logger
│   ├── app.js               # Express setup
│   └── index.js             # Entry point
├── 📂 __tests__/            # Unit tests
├── 📂 database/             # SQL schema and docs
├── 📂 docs/                 # Technical documentation
└── 📂 logs/                 # Application logs (NOT committed)
```

---

## 🤔 `configs/` vs `src/config/` - Why Separated?

### `configs/` - Environment Variables
**Purpose:** `.env` files with secrets and environment-specific configuration

**Characteristics:**
- ❌ NOT committed (except templates)
- 🔒 Sensitive information (passwords, secrets)
- 🌍 Different per environment (dev, test, prod)
- 📝 Text files (.env)

### `src/config/` - Code Configuration
**Purpose:** JavaScript files with configuration logic

**Characteristics:**
- ✅ ARE committed (it's source code)
- 🔓 Don't contain secrets (read from process.env)
- 🔧 Reusable logic (functions, connections)
- 💻 Code files (.js)

### Analogy
```
configs/    = "Your house keys" (secrets, don't share them)
src/config/ = "The lock" (code that uses the keys)
```

---

## 📂 Detailed Description

### `/src` - Source Code

#### `/src/config` - Code Configuration

**`db.config.js`** (Legacy - direct mysql2):
- Direct MySQL connection pool
- Kept for compatibility

**`sequelize.config.js`** (New - Sequelize ORM):
- Sequelize configuration
- Used by all new models

#### `/src/models` - Sequelize Models

Define data structure and validations.

**Responsibilities:**
- ✅ Schema definition
- ✅ Model-level validations
- ✅ Relationships (associations)
- ❌ NO business logic
- ❌ NO complex query methods

#### `/src/services` - Business Logic Layer ⭐

**New layer** implementing the Service Layer Pattern.

**Responsibilities:**
- ✅ Business logic and rules
- ✅ Complex queries
- ✅ Orchestration of multiple models
- ✅ Transactions
- ✅ Data transformation
- ❌ NO HTTP handling (req, res)

See [SERVICE_LAYER_PATTERN.md](SERVICE_LAYER_PATTERN.md) for more details.

#### `/src/controllers` - HTTP Handling

**Responsibilities:**
- ✅ Process requests
- ✅ Basic input validation
- ✅ Call services
- ✅ Format responses
- ✅ Handle errors
- ❌ NO business logic
- ❌ NO direct model access

#### `/src/routes` - Route Definitions

**Responsibilities:**
- ✅ Map URLs to controllers
- ✅ Apply middlewares
- ✅ Define HTTP methods

**Example:**
```javascript
router.get('/items', controller.getAll);           // Public
router.post('/items', authMiddleware, controller.create); // Protected
```

#### `/src/middlewares` - Custom Middlewares

**`auth.middleware.js`:**
- Verifies JWT tokens
- Adds `req.user` with token info
- Returns 401 if token invalid

**`rate-limiter.js`:**
- Limits requests per IP
- Prevents abuse and attacks
- Protects cloud costs

#### `/src/utils` - Utilities

**`jwt.util.js`:**
- `generateToken()` - Creates JWT
- `verifyToken()` - Validates JWT

**`logger.js`:**
- Winston logger configured
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
6. Controller processes HTTP logic
   ↓
7. Service implements business logic
   ↓
8. Model/Sequelize interacts with DB
   ↓
9. Controller formats response
   ↓
10. Logger records the request
    ↓
11. Response sent to client
```

---

## 🎯 Best Practices

### ✅ DO

- Keep controllers thin (simple logic)
- Use services for complex logic
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
   src/models/character.model.js
   ```

2. **Create service:**
   ```
   src/services/character.service.js
   ```

3. **Create controller:**
   ```
   src/controllers/character.controller.js
   ```

4. **Create routes:**
   ```
   src/routes/character.routes.js
   ```

5. **Register routes in app.js:**
   ```javascript
   const characterRoutes = require('./routes/character.routes');
   app.use('/api', characterRoutes);
   ```

6. **Create tests:**
   ```
   __tests__/character.test.js
   ```

7. **Document:**
   - Update README with new endpoints
   - Add examples to Postman collection

---

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (hot reload)

# Production
npm start                # Start server in production

# Testing
npm test                 # Run tests with coverage
npm run test:watch       # Tests in watch mode

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues

# Security
npm run audit            # Security audit
npm run audit:fix        # Fix vulnerabilities
```

---

## 📚 More Information

- **Architecture:** [SERVICE_LAYER_PATTERN.md](SERVICE_LAYER_PATTERN.md)
- **ORM:** [SEQUELIZE_GUIDE.md](SEQUELIZE_GUIDE.md)
- **Authentication:** [AUTHENTICATION.md](AUTHENTICATION.md)
- **Deployment:** [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md)