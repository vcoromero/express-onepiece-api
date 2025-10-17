# One Piece API Documentation

Welcome to the comprehensive documentation for the One Piece API. This documentation is organized by functionality and provides detailed information about all available endpoints, authentication, and usage examples.

## 📚 Documentation Structure

### 🔐 Authentication & System
- **[Authentication & Health API](AUTH_API.md)** - Authentication system, login, token verification, and health checks
- **[JWT Authentication Guide](AUTHENTICATION.md)** - Detailed authentication setup and security

### 👥 Main Entities
- **[Characters API](CHARACTERS_API.md)** - Character management with devil fruits, haki, and organization relationships
- **[Organizations API](ORGANIZATIONS_API.md)** - Organization management with members and ships
- **[Ships API](SHIPS_API.md)** - Ship management with organization relationships
- **[Devil Fruits API](DEVIL_FRUITS_API.md)** - Devil fruit management with types and relationships

### 📋 Reference Data
- **[Catalog API](CATALOG_API.md)** - Reference data for types, races, haki types, character types, and organization types

### 🏗️ Architecture & Development
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete project architecture and folder organization
- **[Service Layer Pattern](SERVICE_LAYER_PATTERN.md)** - Layer architecture and separation of concerns
- **[Sequelize ORM Guide](SEQUELIZE_GUIDE.md)** - ORM usage, models, and relationships

## 🚀 Quick Start

### 1. Authentication
```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. Use the Token
```bash
# Use token for protected endpoints
curl -X GET http://localhost:3000/api/characters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 API Overview

### Endpoint Categories
| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Authentication** | 4 | Login, token verification, health checks |
| **Characters** | 6 | Character CRUD with relationships |
| **Organizations** | 7 | Organization management with members |
| **Ships** | 6 | Ship management with organizations |
| **Devil Fruits** | 6 | Devil fruit management with types |
| **Catalog Data** | 15+ | Reference data for all entities |

### Key Features
- **🔍 Advanced Search**: Full-text search across all entities
- **📄 Pagination**: All list endpoints support pagination
- **🔧 Filtering**: Multiple filter options per endpoint
- **📊 Sorting**: Customizable sorting by multiple fields
- **🔗 Relationships**: Full relationship support between entities
- **🔒 Authentication**: JWT-based authentication for protected endpoints
- **⚡ Rate Limiting**: Built-in rate limiting for API protection

## 🛠️ Development

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Postman Collection
Import `onepiece-api.postman_collection.json` for a complete set of API examples and tests.

## 📈 Current Status

- **✅ 30 Endpoints** - All endpoints implemented and tested
- **✅ 778 Tests** - Comprehensive test coverage (94.21%)
- **✅ Complete Documentation** - All endpoints documented
- **✅ Postman Collection** - Ready-to-use API collection
- **✅ Relationships** - Full relationship support between entities

## 🔗 Related Documentation

- **[Main README](../README.md)** - Project overview and quick start
- **[Project Status](../PROJECT_STATUS.md)** - Current development status
- **[Configuration Guide](../configs/README.md)** - Environment configuration
- **[Database Schema](../database/README.md)** - Database structure and setup

---

*This documentation is automatically updated with each release. For the latest information, always refer to the main project repository.*
