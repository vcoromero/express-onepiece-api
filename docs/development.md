# Development Guide

## Local Development Setup

This guide will help you set up the One Piece API for local development.

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **Docker** and **Docker Compose**: For running PostgreSQL and Redis locally
- **npm**: 8.0 or higher
- **Git**: For version control

---

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
cp .env.example .env
```

Edit `.env` with your local values:

```env
# Database
DATABASE_URL=postgresql://onepiece_user:onepiece_password@localhost:5432/onepiece_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=24h

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...  # Generate with POST /api/auth/generate-hash

# Server
PORT=3000
NODE_ENV=development
LOG_HTTP_REQUESTS=true
```

### 4. Start Docker Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 5. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to the database
npm run db:push

# Seed with One Piece data
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`. On startup, all available endpoints are printed to the console.

---

## Available Scripts

| Script | Description |
| -------- | ------------- |
| `npm start` | Start the server in production mode |
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm test` | Run all tests with coverage |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source files |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## Docker Services

The `docker-compose.yml` defines:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    port: 5432
    credentials: onepiece_user / onepiece_password / onepiece_db

  redis:
    image: redis:7-alpine
    port: 6379
```

### Docker Compose commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (drops all data)
docker-compose down -v
docker-compose up -d
```

---

## Project Structure

``` text
express-onepiece-api/
├── __tests__/              # Jest test files
│   ├── utils/
│   ├── middlewares/
│   └── *.test.js
├── docs/                   # Documentation
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Seed data script
├── src/
│   ├── app.js              # Express app setup
│   ├── index.js            # Server entry point
│   ├── config/             # Configuration files (prisma, redis, auth)
│   ├── controllers/        # Route handler functions
│   ├── middlewares/        # Auth and rate limiting
│   ├── routes/             # Express route definitions
│   ├── services/           # Business logic layer
│   └── utils/              # Helpers (JWT, logger, endpoint display)
├── .env.example
├── .env.test
├── babel.config.js
├── docker-compose.yml
├── jest.setup.js
└── package.json
```

---

## Architecture

The project follows a **Service Layer Pattern**:

``` text
HTTP Request
    ↓
Route (src/routes/)
    ↓
Middleware (auth, rate limiter)
    ↓
Controller (src/controllers/)
    ↓
Service (src/services/)
    ↓
Prisma Client (src/config/prisma.config.js)
    ↓
PostgreSQL
```

- **Controllers**: Handle HTTP request/response lifecycle
- **Services**: Contain business logic and data validation
- **Prisma Client**: Type-safe database queries

---

## Testing

### Run all tests

```bash
npm test
```

### Run with coverage

```bash
npm test -- --coverage
```

### Run a specific test file

```bash
npx jest __tests__/races.test.js
```

### Watch mode

```bash
npm run test:watch
```

Tests use **Jest** with **mocked Prisma client** so no real database connection is needed to run unit tests. Integration tests for auth and health endpoints use **Supertest**.

The test environment is configured via `.env.test`.

---

## API Authentication

The API uses **JWT authentication** for protected endpoints (POST, PUT, DELETE).

### Generate an admin password hash

```bash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "yourpassword"}'
```

Copy the returned hash to `ADMIN_PASSWORD_HASH` in your `.env`.

### Login to get a token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}'
```

### Use the token for protected routes

```bash
curl -X POST http://localhost:3000/api/races \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mink", "description": "Animal-human hybrid race"}'
```

---

## Linting

The project uses ESLint. Run:

```bash
npm run lint
npm run lint:fix
```

---

## Common Issues

### Prisma Client not generated

```bash
npm run db:generate
```

### Database connection refused

Make sure Docker services are running:

```bash
docker-compose up -d
docker-compose ps
```

### Seed data not showing

```bash
npm run db:seed
```

### Port already in use

```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)
```
