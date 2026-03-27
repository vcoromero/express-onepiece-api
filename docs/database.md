# Database Schema

## Overview

The One Piece API uses **PostgreSQL** with **Prisma ORM**. The schema follows Third Normal Form (3NF) principles and handles complex many-to-many relationships between One Piece universe entities.

## Database Structure

### Core Tables

#### Characters

- **Primary Key**: `id`
- **Fields**: `name`, `alias`, `bounty` (BigInt), `status`, `raceId`, `age`, `birthday`, `height`, `origin`, `description`, `debut`
- **Relationships**: Many-to-many with organizations, devil fruits, haki types, character types

#### Organizations

- **Primary Key**: `id`
- **Fields**: `name`, `organizationTypeId`, `status`, `leaderId`, `description`
- **Relationships**: One-to-many with ships, many-to-many with characters

#### Ships

- **Primary Key**: `id`
- **Fields**: `name`, `organizationId`, `status`, `description`
- **Relationships**: Belongs to organization

#### Devil Fruits

- **Primary Key**: `id`
- **Fields**: `name`, `japaneseName`, `typeId`, `description`, `currentUserId`
- **Relationships**: Many-to-many with characters via `CharacterDevilFruit`

### Reference Tables

#### Races

- Human, Fishman, Mink, Giant, Celestial Dragon, etc.

#### CharacterTypes

- Pirate, Marine, Captain, Yonko, Warlord, Revolutionary, etc.

#### OrganizationTypes

- Pirate Crew, Marine, Revolutionary Army, World Government, etc.

#### HakiTypes

- Observation Haki, Armament Haki, Conqueror's Haki

#### FruitTypes

- Paramecia, Zoan, Logia

### Relationship Tables

#### CharacterOrganization

- Links characters to organizations with role and currency flag
- Fields: `characterId`, `organizationId`, `role`, `isCurrent`

#### CharacterDevilFruit

- Links characters to devil fruits
- Fields: `characterId`, `devilFruitId`, `isCurrent`

#### CharacterHaki

- Links characters to haki types with mastery level
- Fields: `characterId`, `hakiTypeId`, `masteryLevel`

#### CharacterCharacterType

- Links characters to character types with currency flag
- Fields: `characterId`, `characterTypeId`, `isCurrent`

---

## Prisma Setup

The schema file is located at `prisma/schema.prisma`.

### Generate Prisma Client

```bash
npm run db:generate
# Equivalent to: prisma generate
```

### Push Schema to Database (development)

```bash
npm run db:push
# Equivalent to: prisma db push
```

### Run Migrations (production)

```bash
npm run db:migrate
# Equivalent to: prisma migrate dev
```

### Seed the Database

```bash
npm run db:seed
# Equivalent to: node prisma/seed.js
```

### Open Prisma Studio

```bash
npm run db:studio
# Equivalent to: prisma studio
```

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

## Local Development Setup

### Using Docker Compose (recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed
```

### Manual PostgreSQL Setup

```bash
# Create database and user
psql -U postgres -c "CREATE USER onepiece_user WITH PASSWORD 'yourpassword';"
psql -U postgres -c "CREATE DATABASE onepiece_db OWNER onepiece_user;"

# Set DATABASE_URL in .env
DATABASE_URL=postgresql://onepiece_user:yourpassword@localhost:5432/onepiece_db
```

---

## Environment Configuration

```env
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/onepiece_db

# Redis (for future caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Troubleshooting

### Connection Issues

```bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1;"

# Check Prisma connection
npx prisma db pull
```

### Prisma Client Out of Sync

```bash
# Regenerate client after schema changes
npm run db:generate
```

### Reset Database (development only)

```bash
# Drop all tables and re-push schema
npx prisma migrate reset
npm run db:seed
```

### Performance

Prisma automatically creates indexes for primary keys and foreign keys. For large datasets, consider adding custom indexes via migrations:

```prisma
model Character {
  @@index([name])
  @@index([status])
  @@index([raceId])
}
```
