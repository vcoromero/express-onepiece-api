# One Piece API

[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A comprehensive RESTful API inspired by the One Piece universe, built with **Express.js**, **PostgreSQL**, and **Prisma ORM**. Provides access to characters, organizations, ships, devil fruits, haki types, and their complex relationships.

## Features

- **Complete One Piece Universe**: Characters, Organizations, Ships, Devil Fruits, Haki
- **PostgreSQL + Prisma ORM**: Type-safe queries, migrations, and schema management
- **JWT Authentication**: Secure token-based authentication for protected endpoints
- **Advanced Relationships**: Complex many-to-many relationships between entities
- **Full-Text Search**: Search across all entities with filters and pagination
- **Rate Limiting**: Built-in protection against abuse
- **Comprehensive Testing**: Jest with Prisma mocks
- **Docker Compose**: Local development stack out of the box

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Caching**: Redis (configured, available for future use)
- **Testing**: Jest with Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Architecture

This project follows a **Service Layer Pattern**:

``` text
Client → Controller → Service → Prisma Client → PostgreSQL
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data validation
- **Prisma Client**: Type-safe database access
- **Middleware**: Authentication, rate limiting, logging

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Installation

```bash
# Clone the repository
git clone https://github.com/vcoromero/express-onepiece-api.git
cd express-onepiece-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with One Piece data
npm run db:seed
```

### Run

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`.

## API Endpoints

### Core Entities

| Entity | GET (list) | GET (by id) | POST | PUT | DELETE |
| -------- | ----------- | ------------- | ------ | ----- | -------- |
| Characters | `/api/characters` | `/api/characters/:id` | `/api/characters` | `/api/characters/:id` | `/api/characters/:id` |
| Races | `/api/races` | `/api/races/:id` | — | `/api/races/:id` | `/api/races/:id` |
| Character Types | `/api/character-types` | `/api/character-types/:id` | — | `/api/character-types/:id` | `/api/character-types/:id` |
| Devil Fruits | `/api/devil-fruits` | `/api/devil-fruits/:id` | `/api/devil-fruits` | `/api/devil-fruits/:id` | `/api/devil-fruits/:id` |
| Fruit Types | `/api/fruit-types` | `/api/fruit-types/:id` | `/api/fruit-types` | `/api/fruit-types/:id` | `/api/fruit-types/:id` |
| Haki Types | `/api/haki-types` | `/api/haki-types/:id` | — | `/api/haki-types/:id` | — |
| Organizations | `/api/organizations` | `/api/organizations/:id` | `/api/organizations` | `/api/organizations/:id` | `/api/organizations/:id` |
| Organization Types | `/api/organization-types` | `/api/organization-types/:id` | — | `/api/organization-types/:id` | `/api/organization-types/:id` |
| Ships | `/api/ships` | `/api/ships/:id` | `/api/ships` | `/api/ships/:id` | `/api/ships/:id` |

### Other endpoints

| Method | Path | Description |
| -------- | ------ | ------------- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/verify` | Verify token |
| POST | `/api/auth/generate-hash` | Generate bcrypt hash (dev only) |

See [API Documentation](docs/api.md) for full details.

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/onepiece_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...

# Server
PORT=3000
NODE_ENV=development
```

## Testing

```bash
# Run all tests with coverage
npm test

# Watch mode
npm run test:watch
```

Tests use mocked Prisma client — no database connection required.

## Documentation

- [API Documentation](docs/api.md) — Complete API reference
- [Database Schema](docs/database.md) — PostgreSQL schema and Prisma setup
- [Deployment Guide](docs/deployment.md) — Production deployment
- [Development Guide](docs/development.md) — Local development setup
- [Migration Notes](docs/migration/postgresql-prisma-migration.md) — MySQL → PostgreSQL migration log

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Author

**Victor Jesus Romero Perez**

- Email: <vcoromero@gmail.com>
- GitHub: [@vcoromero](https://github.com/vcoromero)

---

<p align="center">
  <strong>"A man's dreams never die"</strong><br>
  <em>— Marshall D. Teach (Blackbeard)</em>
</p>
