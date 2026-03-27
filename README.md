# One Piece API

A REST API inspired by the One Piece universe, built with Express and Prisma.

## Stack

- Node.js 24 LTS + Express (version pinned via `.nvmrc` and `package.json` `engines`)
- PostgreSQL + Prisma
- JWT authentication
- Redis (infrastructure ready)
- Jest + Supertest

## Current Direction

- Database provider: Neon (PostgreSQL)
- Runtime deployment target: AWS Lambda with Serverless Framework
- API testing tool: Bruno (replacing Postman)
- Future API layer: GraphQL (planned)

## Quick Start

### 1) Install

```bash
npm install
cp .env.example .env
```

### 2) Choose database mode

- **Neon**: set `DATABASE_URL` to your Neon connection string.
- **Local Postgres**:

```bash
docker-compose up -d
```

### 3) Prisma setup

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4) Run API

```bash
npm run dev
```

## NPM Scripts

- `npm run dev`: start with nodemon
- `npm start`: start server
- `npm test`: run tests with coverage
- `npm run lint`: lint source
- `npm run db:generate`: generate Prisma client
- `npm run db:push`: push Prisma schema
- `npm run db:migrate`: create/apply dev migration
- `npm run db:seed`: seed data
- `npm run db:studio`: open Prisma Studio

## API Surface (Summary)

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/verify`

- Characters: `GET/POST/PUT/DELETE /api/characters`, `GET /api/characters/search`
- Devil Fruits: `GET/POST/PUT/DELETE /api/devil-fruits`, `GET /api/devil-fruits/type/:typeId`
- Organizations: `GET/POST/PUT/DELETE /api/organizations`, `GET /api/organizations/type/:organizationTypeId`, `GET /api/organizations/:id/members`
- Ships: `GET/POST/PUT/DELETE /api/ships`, `GET /api/ships/status/:status`
- Races: `GET /api/races`, `GET /api/races/:id`, `PUT /api/races/:id`
- Character Types: `GET /api/character-types`, `GET /api/character-types/:id`, `PUT /api/character-types/:id`
- Organization Types: `GET /api/organization-types`, `GET /api/organization-types/:id`, `PUT /api/organization-types/:id`
- Haki Types: `GET /api/haki-types`, `GET /api/haki-types/:id`, `PUT /api/haki-types/:id`
- Fruit Types: `GET /api/fruit-types`, `GET /api/fruit-types/:id`, `PUT /api/fruit-types/:id`

## Manual API Testing

Bruno is the standard tool for manual endpoint testing in this project. Store Bruno collections inside a `bruno/` directory at project root.

## Documentation

- `docs/api.md`
- `docs/development.md`
- `docs/database.md`
- `docs/deployment.md`
- `docs/architecture.md`

