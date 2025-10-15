# One Piece API 🏴‍☠️

A RESTful API inspired by One Piece, built with Express.js, MySQL, and Sequelize ORM.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com)
[![Coverage](https://img.shields.io/badge/coverage-93.75%25-brightgreen)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

- ✅ **Sequelize ORM** - Clean, type-safe queries
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Winston Logger** - CloudWatch ready
- ✅ **Jest Tests** - 451 tests, 93.75% coverage
- ✅ **Docker Ready** - Containerization included
- ✅ **AWS Optimized** - Deployment guides included

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd express-onepiece-api

# Install dependencies
npm install

# Create database
mysql -u root -p < database/schema.sql
```

### 2. Configuration

Configuration files are in the `configs/` directory:

```bash
# The .env file is already created with defaults
# Edit it if you need to change anything
nano configs/.env
```

Main variables:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=onepiece_db

JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h
```

> 📖 **Full configuration guide:** See [configs/README.md](configs/README.md)

### 3. Generate Password Hash

```bash
# Start server
npm run dev

# Generate hash (in another terminal)
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'

# Copy the hash to .env
# ADMIN_PASSWORD_HASH=$2a$10$...
```

### 4. Ready!

```bash
# Start in development mode
npm run dev

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 📚 Complete Documentation

### Architecture Guides
| Document | Description |
|----------|-------------|
| **[📁 Project Structure](docs/PROJECT_STRUCTURE.md)** | Folder organization and complete architecture |
| **[🏢 Service Layer Pattern](docs/SERVICE_LAYER_PATTERN.md)** | Layer architecture and separation of concerns |
| **[📖 Sequelize ORM Guide](docs/SEQUELIZE_GUIDE.md)** | ORM usage, models and relationships |

### Configuration and Deployment
| Document | Description |
|----------|-------------|
| **[⚙️ Environment Variables](configs/README.md)** | Environment-specific configuration and secrets |
| **[🗄️ Database](database/README.md)** | MySQL schema, tables and initial data |
| **[☁️ AWS Deployment](docs/AWS_DEPLOYMENT.md)** | Guides for Lambda, Beanstalk, ECS, EC2 |

### Security
| Document | Description |
|----------|-------------|
| **[🔐 JWT Authentication](docs/AUTHENTICATION.md)** | Login system, tokens and route protection |

---

## 🛠️ Available Scripts

```bash
npm start              # Production
npm run dev            # Development (hot reload)
npm test               # Tests with coverage
npm run test:watch     # Tests in watch mode
npm run lint           # Check code quality
npm run lint:fix       # Fix linting issues
npm run audit          # Security audit
```

---

## 🌐 API Endpoints

### Health & Auth

```bash
GET  /api/health                # Health check (public)
POST /api/auth/login            # Login (get JWT)
GET  /api/auth/verify           # Verify token (requires auth)
POST /api/auth/generate-hash    # Generate password hash (dev only)
```

### Devil Fruit Types

```bash
GET    /api/fruit-types         # Get all (public)
GET    /api/fruit-types/:id     # Get one (public)
POST   /api/fruit-types         # Create (requires auth)
PUT    /api/fruit-types/:id     # Update (requires auth)
DELETE /api/fruit-types/:id     # Delete (requires auth)
```

### Devil Fruits

```bash
GET    /api/devil-fruits                    # Get all with pagination & filters (public)
GET    /api/devil-fruits/:id                # Get one by ID (public)
GET    /api/devil-fruits/type/:typeId       # Get by type with pagination (public)
POST   /api/devil-fruits                    # Create (requires auth)
PUT    /api/devil-fruits/:id                # Update (requires auth)
DELETE /api/devil-fruits/:id                # Delete (requires auth)
```

#### Devil Fruits Query Parameters

**GET /api/devil-fruits** supports:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term for name
- `type_id` - Filter by type ID
- `rarity` - Filter by rarity (common, rare, legendary, mythical)
- `sortBy` - Sort field (id, name, rarity, power_level, created_at)
- `sortOrder` - Sort order (ASC, DESC)

**GET /api/devil-fruits/type/:typeId** supports:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (id, name, created_at)
- `sortOrder` - Sort order (ASC, DESC)

### Haki Types

```bash
GET    /api/haki-types          # Get all (public)
GET    /api/haki-types/:id      # Get one (public)
PUT    /api/haki-types/:id      # Update (requires auth)
```

### Races

```bash
GET    /api/races               # Get all (public)
GET    /api/races/:id           # Get one (public)
PUT    /api/races/:id           # Update (requires auth)
```

### Character Types

```bash
GET    /api/character-types     # Get all (public)
GET    /api/character-types/:id # Get one (public)
PUT    /api/character-types/:id # Update (requires auth)
```

### Organization Types

```bash
GET    /api/organization-types     # Get all (public)
GET    /api/organization-types/:id # Get one (public)
PUT    /api/organization-types/:id # Update (requires auth)
```

> 💡 **Postman Collection:** Import `onepiece-api.postman_collection.json`

---

## 🏗️ Architecture

This project follows the **Service Layer Pattern** for clean, maintainable code:

```
express-onepiece-api/
├── configs/              # Environment variables (.env)
├── src/
│   ├── config/          # Code configuration
│   ├── models/          # Sequelize models (schema only)
│   ├── services/        # Business logic layer ⭐ NEW
│   ├── controllers/     # HTTP handling
│   ├── routes/          # Route definitions
│   ├── middlewares/     # Auth, rate limiting
│   └── utils/           # JWT, logger
├── __tests__/           # Unit tests (mocking services)
├── database/            # SQL schema and docs
└── docs/                # Technical documentation
```

**Flow:** `Client → Controller → Service → Model → Database`

> 📖 **Full details:** See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

### ⚠️ `configs/` vs `src/config/` - What's the difference?

| `configs/` | `src/config/` |
|------------|---------------|
| `.env` files | `.js` files |
| Secrets (DON'T commit) | Code (DO commit) |
| Environment variables | Configuration logic |
| Passwords, API keys | DB setup, Sequelize config |

**Analogy:** `configs/` are the keys, `src/config/` is the lock.

---

## 🧪 Testing

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

**Current coverage:** 93.75% (451/451 tests passing ✅)

---

## 🐳 Docker

```bash
# Build
docker build -t onepiece-api .

# Run
docker run -p 3000:3000 --env-file configs/.env onepiece-api
```

---

## ☁️ Deployment

### AWS (Recommended)

This project is optimized for AWS with:
- Rate limiting (cost protection)
- CloudWatch logging
- Auto-scaling ready

**Deployment options:**
- **Lambda + API Gateway** - Serverless, cheapest (~$5/month)
- **Elastic Beanstalk** - Easiest (~$25-40/month)
- **ECS + Fargate** - Containers (~$15-25/month)
- **EC2** - Full control (~$0-10/month with free tier)

> ☁️ **Complete guide:** See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md)

### Heroku, Railway, Render

Also works on any PaaS that supports Node.js:

```bash
# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set DB_HOST=your_db_host
# ... etc

# Deploy
git push heroku main
```

---

## 🔒 Security

### Development ✅
```env
ADMIN_PASSWORD_HASH=simple_hash
JWT_SECRET=dev-key
JWT_EXPIRES_IN=24h
```

### Production ⚠️
```env
ADMIN_PASSWORD_HASH=$2a$10$secure_hash
JWT_SECRET=64_char_random_string
JWT_EXPIRES_IN=1h
NODE_ENV=production
```

> 🔐 **Complete guide:** See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)

**Security checklist:**
- ✅ Rate limiting enabled
- ✅ Short JWT expiration in production
- ✅ HTTPS in production
- ✅ Secrets in AWS Secrets Manager (not .env)
- ✅ Security groups configured
- ✅ Logging and monitoring active

---

## 🤝 Contributing

1. Fork the project
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🎯 Roadmap

- [ ] Implement more models (Characters, Organizations, Ships)
- [ ] Add relationships between models
- [ ] Refresh tokens
- [ ] GraphQL endpoint
- [ ] OpenAPI/Swagger documentation
- [ ] Redis caching
- [ ] WebSockets for real-time updates

---

## 🐛 Troubleshooting

### Can't connect to database
```bash
# Check if MySQL is running
mysql -u root -p

# Check variables in .env
cat configs/.env
```

### Tests failing
```bash
# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Check that .env.test exists
ls configs/.env.test
```

### Authentication error
```bash
# Regenerate hash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_password"}'

# Update ADMIN_PASSWORD_HASH in .env
```

> 📖 More troubleshooting in each specific guide in [docs/](docs/)

---

## 💬 Contact and Support

**Developer:** Victor Jesus Romero Perez  
📧 **Email:** vcoromero@gmail.com  
📱 **Phone:** +529931348794  
🐛 **Issues:** [GitHub Issues](https://github.com/your-repo/issues)  
📖 **Documentation:** [docs/](docs/)

---

<p align="center">
  🏴‍☠️ <em>"A man's dreams never die"</em> 🏴‍☠️<br>
  <strong>— Marshall D. Teach (Blackbeard)</strong>
</p>
