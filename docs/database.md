# Database Guide (Prisma + PostgreSQL)

## Provider

- ORM: Prisma
- Database: PostgreSQL
- Primary cloud target: Neon

`prisma/schema.prisma` uses:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Main Data Model

### Auth

- **`users`** — `User` model: `username` (unique), `password_hash` (bcrypt), `role` (`admin` | `editor`), `is_active`. Used by `POST /api/auth/login`.

## Reference tables

- `Race`
- `CharacterType`
- `FruitType`
- `OrganizationType`
- `HakiType`

## Main entities

- `Character`
- `DevilFruit`
- `Organization`
- `Ship`

## Junction tables

- `CharacterDevilFruit`
- `CharacterHaki`
- `CharacterCharacterType`
- `CharacterOrganization`

## Neon Setup

Use a Neon connection string in `.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require"
```

## Local PostgreSQL Setup (alternative)

Start local database:

```bash
docker-compose up -d
```

Default local connection from `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/onepiece_db?schema=public"
```

## Migration and Seed Scripts Review

Current package scripts:

- `npm run db:generate` -> `prisma generate`
- `npm run db:push` -> `prisma db push`
- `npm run db:migrate` -> `prisma migrate dev`
- `npm run db:seed` -> `node prisma/seed.js`

Recommended usage:

- **Development/local changes**: `db:migrate` (or `db:push` for fast prototyping)
- **Apply existing migrations in production**: `npx prisma migrate deploy`
- **Seed data**: `db:seed` (optional in production, required for local demo data)

## Suggested Workflows

## Neon (development or shared env)

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Local PostgreSQL (Docker)

```bash
docker-compose up -d
npm run db:generate
npm run db:push
npm run db:seed
```

## Migration-based workflow

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Notes

- Keep `DATABASE_URL` as the source of truth.
- `DB_HOST`, `DB_PORT`, etc. can be kept only if other runtime utilities need them.
- For serverless production, prefer migration deployment in CI/CD (`prisma migrate deploy`) before traffic.

