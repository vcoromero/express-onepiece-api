# Development Guide

## Prerequisites

- Node.js 24 LTS (see `.nvmrc`; use `nvm use` or install the current Active LTS from [nodejs.org](https://nodejs.org/))
- npm
- Docker + Docker Compose (for local PostgreSQL/Redis)
- Bruno (manual API testing)

## Setup

```bash
npm install
cp .env.example .env
```

## Database Modes

## Mode A: Neon (recommended)

Set `DATABASE_URL` in `.env` using your Neon connection string:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<db>?sslmode=require"
```

Then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Mode B: Local PostgreSQL (Docker)

Start local services:

```bash
docker-compose up -d
```

The default compose setup exposes PostgreSQL on `localhost:5433` and Redis on `localhost:6379`.

Then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Run Application

```bash
npm run dev
```

Server starts on `PORT` from `.env` (default `3000`).

## Tests

```bash
npm test
npm run test:watch
```

## Lint

```bash
npm run lint
npm run lint:fix
```

## Manual API Testing (Bruno)

Bruno replaces Postman in this project.

- Keep collections in `bruno/`.
- Use environment variables for local and deployed base URLs.
- Store auth token in Bruno environment after calling `POST /api/auth/login`.

## Common Prisma Commands

- `npm run db:generate`
- `npm run db:push`
- `npm run db:migrate` (development migrations)
- `npm run db:seed`
- `npm run db:studio`

