# Architecture Guide

## High-Level Flow

```text
Route -> Middleware -> Controller -> Service -> Prisma Client -> PostgreSQL (Neon/local)
```

## Project Structure

```text
src/
  app.js
  index.js
  config/
  controllers/
  middlewares/
  routes/
  services/
  utils/
prisma/
  schema.prisma
  seed.js
docs/
```

## Layer Responsibilities

## Routes

- Define endpoint paths and middleware chain.
- Do not contain business logic.

## Middlewares

- Cross-cutting concerns (JWT auth, rate limiting, request protection).

## Controllers

- Parse request inputs (`params`, `query`, `body`).
- Validate request format.
- Call services.
- Return HTTP responses.

## Services

- Own business rules and data orchestration.
- Access Prisma directly via `src/config/prisma.config.js`.
- Return structured domain/service results.

## Service Layer Rules (merged from old services README)

Services should:

- implement business rules
- validate domain conditions
- orchestrate multi-entity operations
- use transactions for multi-step writes
- throw/return meaningful errors

Services should not:

- use `req`/`res`
- return HTTP status codes
- know route paths
- format transport-level response payloads

## Prisma Service Example Pattern

```js
const prisma = require('../config/prisma.config');

async function getCharacters({ page, limit }) {
  const skip = (page - 1) * limit;
  const [rows, total] = await prisma.$transaction([
    prisma.character.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
    prisma.character.count()
  ]);

  return { rows, total, page, limit };
}
```

## Security Design

- `helmet` for secure HTTP headers
- `cors` enabled
- global rate limiter + auth/sensitive limiters
- JWT protection on write endpoints

## Deployment Orientation

- Local runtime: Node process (`npm run dev`, `npm start`)
- Target runtime: AWS Lambda via Serverless Framework
- Database: Neon PostgreSQL

## Future GraphQL Integration

GraphQL is planned as a future API layer. Expected integration:

```text
GraphQL Resolver -> Service -> Prisma
REST Controller -> Service -> Prisma
```

This keeps one business-logic layer while supporting both REST and GraphQL during migration.

