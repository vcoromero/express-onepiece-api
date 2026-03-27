# PostgreSQL + Prisma Migration Plan

## Overview

This document outlines the migration from MySQL + Sequelize to PostgreSQL + Prisma for the One Piece API.

## Migration Stages

### Stage 1: PostgreSQL + Prisma (Current Branch)

- [x] Create branch `feat/postgresql-prisma-migration`
- [x] Install dependencies (Prisma, pg, ioredis)
- [x] Create Prisma schema from Sequelize models
- [x] Update database configuration
- [x] Convert SQL seeds to Prisma seed script
- [ ] Update services to use Prisma
- [x] Add Docker Compose for local development
- [x] Run tests and verify (database seeded successfully)

### Stage 2: GraphQL Integration

- Replace REST API with GraphQL (Apollo Server)
- Define GraphQL schema from domain models
- Implement resolvers using Prisma
- Add cursor-based pagination
- Add authentication (API key for admin, public for queries)

### Stage 3: Redis Caching

- Add Redis for query caching
- Implement cache invalidation on mutations
- Use for session/token storage

---

## Technical Decisions

### Database

- **PostgreSQL** - Better cloud support (AWS RDS, Cloud SQL, ElastiCache-ready)
- **Prisma ORM** - Type-safe, built-in migrations, DynamoDB-ready for future

### Pagination

- **Cursor-based** - Better performance for large datasets, prevents offset manipulation

### Authentication

- **API Key** - For admin mutations (stored in header)
- **Public queries** - Read-only access without auth

### Caching Strategy

- Cache frequently accessed data (lists, details)
- TTL: 5 minutes for lists, 15 minutes for single items
- Invalidate on mutations

---

## Current API Endpoints (to be replaced with GraphQL)

| Entity | GET | POST | PUT | DELETE |
| -------- | ----- | ------ | ----- | -------- |
| Characters | `/api/characters` | `/api/characters` | `/api/characters/:id` | `/api/characters/:id` |
| Races | `/api/races` | `/api/races` | `/api/races/:id` | `/api/races/:id` |
| Character Types | `/api/character-types` | `/api/character-types` | `/api/character-types/:id` | `/api/character-types/:id` |
| Devil Fruits | `/api/devil-fruits` | `/api/devil-fruits` | `/api/devil-fruits/:id` | `/api/devil-fruits/:id` |
| Fruit Types | `/api/fruit-types` | `/api/fruit-types` | `/api/fruit-types/:id` | `/api/fruit-types/:id` |
| Haki Types | `/api/haki-types` | `/api/haki-types` | `/api/haki-types/:id` | `/api/haki-types/:id` |
| Organizations | `/api/organizations` | `/api/organizations` | `/api/organizations/:id` | `/api/organizations/:id` |
| Organization Types | `/api/organization-types` | `/api/organization-types` | `/api/organization-types/:id` | `/api/organization-types/:id` |
| Ships | `/api/ships` | `/api/ships` | `/api/ships/:id` | `/api/ships/:id` |

---

## Schema Mapping

### Sequelize → Prisma

| Sequelize Model | Prisma Model | Notes |
| ---------------- | -------------- | ------- |
| `Character` | `Character` | Main entity |
| `Race` | `Race` | Reference table |
| `CharacterType` | `CharacterType` | Reference table |
| `CharacterCharacterType` | Implicit (via relation) | Many-to-many |
| `DevilFruit` | `DevilFruit` | Has current_user_id |
| `FruitType` | `FruitType` | Reference (Paramecia, Zoan, Logia) |
| `HakiType` | `HakiType` | Reference table |
| `CharacterHaki` | `CharacterHaki` | Junction with mastery_level |
| `Organization` | `Organization` | Main entity |
| `OrganizationType` | `OrganizationType` | Reference table |
| `CharacterOrganization` | `CharacterOrganization` | Junction with role |
| `Ship` | `Ship` | Belongs to Organization |

---

## Seed Data Summary

| Table | Records |
| ------- | --------- |
| races | 12 |
| character_types | 21 |
| fruit_types | 3 |
| organization_types | 8 |
| haki_types | 3 |
| ships | 10 |
| characters | 22 |
| devil_fruits | 16 |
| organizations | 12 |

---

## Environment Variables

See `.env.example` for all required variables.

---

## Docker Services

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    ports: 5432
    
  redis:
    image: redis:7-alpine
    ports: 6379
```

---

## Commands

```bash
# Start local services
docker-compose up -d

# Prisma commands
npm run db:generate   # Generate Prisma Client
npm run db:push      # Push schema to DB
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database

# Development
npm run dev          # Start dev server
npm test            # Run tests
```

---

## Future Considerations

### DynamoDB Migration

Prisma supports DynamoDB natively. When ready:

1. Change provider in schema: `provider = "dynamodb"`
2. Update connection string
3. Adjust queries (no joins in DynamoDB)

### GraphQL Federation

When adding more services:

- Use Apollo Gateway
- Split domain into subgraphs
- Share schema via composition

---

## Notes

- Current REST API will be replaced entirely with GraphQL in Stage 2
- Redis setup is ready for future caching implementation
- All existing tests should pass after migration

---

## Current Status (Stage 1)

### Completed

- ✅ Branch created: `feat/postgresql-prisma-migration`
- ✅ Dependencies installed: @prisma/client, prisma, ioredis, pg
- ✅ Prisma schema created from Sequelize models
- ✅ PostgreSQL database running (docker-compose)
- ✅ Prisma Client generated
- ✅ Database schema pushed to PostgreSQL
- ✅ Seed data converted to Prisma seed script
- ✅ Database seeded successfully (22 characters, 16 devil fruits, etc.)
- ✅ Redis configured but not yet integrated

### Pending for Stage 1 Completion

- ⚠️ Update services layer to use Prisma instead of Sequelize (NOT STARTED)
- ⚠️ Run existing tests to verify no breaking changes
- ⚠️ Remove old Sequelize files (config/sequelize.config.js, models/, etc.)
- ⚠️ Update REST API to use new Prisma-based services

### Next Steps

1. Update `src/services/*.js` to use Prisma instead of Sequelize
2. Update REST controllers to work with new service layer
3. Run tests and verify functionality
4. Push changes and create PR

---

## Environment Setup

### Local Development

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### Production

```env
DATABASE_URL=postgresql://user:pass@your-db-host:5432/onepiece_db
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```
