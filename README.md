# One Piece API 🏴‍☠️

A RESTful API inspired by One Piece, built with Express.js, MySQL, and Sequelize ORM.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com)
[![Coverage](https://img.shields.io/badge/coverage-87.37%25-brightgreen)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![AWS](https://img.shields.io/badge/AWS-deployed-orange)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

- ✅ **Sequelize ORM** - Clean, type-safe queries
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Winston Logger** - Structured logging
- ✅ **Jest Tests** - 778 tests, 87.37% coverage
- ✅ **Complete CRUD** - Characters, Ships, Organizations, Devil Fruits
- ✅ **Modular Database Seeding** - Granular control over data initialization
- ✅ **Database Diagnostics** - Automated issue detection and recommendations
- ✅ **AWS Deployment** - Production-ready cloud deployment with monitoring

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd express-onepiece-api

# Install dependencies
npm install

# Create database and seed data
mysql -u root -p < database/schema.sql

# Optional: Use modular seeding (recommended)
# This allows granular control over database seeding
curl -X POST http://localhost:3000/api/db/execute-sql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"files": ["01-clean-database.sql", "02-seed-races.sql", "03-seed-character-types.sql"]}'
```

### 2. Configuration

Environment variables are now in the project root:

```bash
# The .env file is in the root directory
# Edit it if you need to change anything
nano .env
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

> 📖 **Environment files:** `.env` (local), `.env.aws` (production), `.env.test` (testing)

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

### 4. Database Seeding (Optional)

The API now supports modular database seeding for better control:

```bash
# Check available SQL files
curl -X GET http://localhost:3000/api/db/available-sql-files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Execute specific seed files
curl -X POST http://localhost:3000/api/db/execute-sql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"files": ["01-clean-database.sql", "02-seed-races.sql", "03-seed-character-types.sql"]}'

# Diagnose database issues
curl -X GET http://localhost:3000/api/db/diagnose \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Ready!

```bash
# Start in development mode
npm run dev

# Test the API
curl http://localhost:3000/api/health
```

---

## ☁️ Live Deployment

The API is currently deployed on **AWS** and available for testing:

- **🌐 Production URL:** [https://d1lu4jq11jb97o.cloudfront.net/](https://d1lu4jq11jb97o.cloudfront.net/)
- **📊 Monitoring:** AWS CloudWatch integration
- **🔒 Security:** HTTPS enabled with AWS security groups
- **📈 Performance:** AWS CloudFront CDN with global edge locations

### Quick Test (Live API)

```bash
# Health check
curl https://d1lu4jq11jb97o.cloudfront.net/api/health
```

---

## 📚 Complete Documentation

### Architecture Guides
| Document | Description |
|----------|-------------|
| **[📁 Project Structure](docs/PROJECT_STRUCTURE.md)** | Folder organization and complete architecture |
| **[🏢 Service Layer Pattern](docs/SERVICE_LAYER_PATTERN.md)** | Layer architecture and separation of concerns |
| **[📖 Sequelize ORM Guide](docs/SEQUELIZE_GUIDE.md)** | ORM usage, models and relationships |

### API Documentation
| Document | Description |
|----------|-------------|
| **[🔐 Authentication & Health](docs/AUTH_API.md)** | Authentication system and API health endpoints |
| **[👥 Characters API](docs/CHARACTERS_API.md)** | Character management with relationships |
| **[🏴‍☠️ Organizations API](docs/ORGANIZATIONS_API.md)** | Organization management with members and ships |
| **[🚢 Ships API](docs/SHIPS_API.md)** | Ship management with organization relationships |
| **[🍎 Devil Fruits API](docs/DEVIL_FRUITS_API.md)** | Devil fruit management with types and relationships |
| **[📋 Catalog API](docs/CATALOG_API.md)** | Reference data for types, races, and categories |

### Configuration and Deployment
| Document | Description |
|----------|-------------|
| **[⚙️ Environment Variables](configs/README.md)** | Environment-specific configuration and secrets |
| **[🗄️ Database](database/README.md)** | MySQL schema, tables and initial data |

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

### Quick Reference

| Endpoint Group | Documentation | Description |
|----------------|---------------|-------------|
| **[🔐 Authentication & Health](docs/AUTH_API.md)** | Health check, login, token verification | Authentication system and API health |
| **[👥 Characters](docs/CHARACTERS_API.md)** | Character CRUD, search, relationships | Character management with devil fruits, haki, organizations |
| **[🏴‍☠️ Organizations](docs/ORGANIZATIONS_API.md)** | Organization CRUD, members, ships | Organization management with members and ships |
| **[🚢 Ships](docs/SHIPS_API.md)** | Ship CRUD, status filtering | Ship management with organization relationships |
| **[🍎 Devil Fruits](docs/DEVIL_FRUITS_API.md)** | Devil fruit CRUD, types, filtering | Devil fruit management with types and relationships |
| **[📋 Catalog Data](docs/CATALOG_API.md)** | Types, races, haki types | Reference data for the main entities |

### Endpoint Summary

#### Health & Authentication
```bash
GET  /api/health                # Health check (public)
POST /api/auth/login            # Login (get JWT)
GET  /api/auth/verify           # Verify token (requires auth)
POST /api/auth/generate-hash    # Generate password hash (dev only)
```

#### Database Management
```bash
GET  /api/db/status             # Database status and table info
GET  /api/db/available-sql-files # List available SQL seed files
POST /api/db/execute-sql       # Execute SQL files (requires auth)
GET  /api/db/diagnose           # Diagnose database issues (requires auth)
```

#### Main Entities
```bash
# + CRUD operations for each (see detailed docs)
```

### Key Features

- **🔍 Advanced Search**: Full-text search across all entities
- **📄 Pagination**: All list endpoints support pagination (page, limit)
- **🔧 Filtering**: Multiple filter options per endpoint
- **📊 Sorting**: Customizable sorting by multiple fields
- **🔗 Relationships**: Full relationship support between entities
- **🔒 Authentication**: JWT-based authentication for protected endpoints
- **⚡ Rate Limiting**: Built-in rate limiting for API protection

> 💡 **Postman Collection:** Import `onepiece-api.postman_collection.json`  
> 📚 **Detailed Documentation:** See individual API documentation files in `docs/`

---

## 🏗️ Architecture

This project follows the **Service Layer Pattern** for clean, maintainable code:

```
express-onepiece-api/
├── .env                 # Environment variables (local)
├── .env.aws            # Environment variables (production)
├── .env.test           # Environment variables (testing)
├── src/
│   ├── config/         # Code configuration
│   ├── models/         # Sequelize models (schema only)
│   ├── services/       # Business logic layer ⭐ NEW
│   ├── controllers/    # HTTP handling
│   ├── routes/         # Route definitions
│   ├── middlewares/    # Auth, rate limiting
│   └── utils/          # JWT, logger
├── __tests__/          # Unit tests (mocking services)
├── database/           # SQL schema and docs
└── docs/               # Technical documentation
```

**Flow:** `Client → Controller → Service → Model → Database`

> 📖 **Full details:** See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

### ⚠️ Environment Files - What's the difference?

| `.env` | `.env.aws` | `.env.test` |
|--------|------------|-------------|
| Local development | AWS production | Testing |
| MySQL local | RDS MySQL | Test database |
| Development secrets | Production secrets | Test secrets |

**Analogy:** `.env` files are the keys, `src/config/` is the lock.

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

**Current coverage:** 87.37% (778/778 tests passing ✅)

---

---

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

- [x] Implement Ships model with full CRUD operations
- [x] Implement Characters model with full CRUD operations
- [x] Implement Organizations model with full CRUD operations
- [x] Add relationships between models
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
cat .env
```

### Tests failing
```bash
# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Check that .env.test exists
ls .env.test
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
