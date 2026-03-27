# Deployment Guide (AWS Lambda + Serverless + Neon)

**New to AWS?** Follow the step-by-step beginner guide (IAM user, what Serverless creates, VPC when you need it, deploy, verify): [aws-first-deployment-guide.md](./aws-first-deployment-guide.md).

## Target Architecture

- Runtime: AWS Lambda
- Gateway: API Gateway (HTTP API or REST API)
- Framework: Serverless Framework
- Database: Neon PostgreSQL
- ORM: Prisma

## Current Repository Status

- **Local:** `npm run dev` / `npm start` → `src/index.js` (`dotenv` + `app.listen`).
- **AWS Lambda:** `serverless.yml` + `src/lambda.js` (`@codegenie/serverless-express` wrapping `src/app.js`). Dev dependencies: `serverless` (v3), **`serverless-dotenv-plugin`**. The plugin reads **`.env`** (see `custom.dotenv.path` in `serverless.yml`) and injects the listed keys into Lambda `provider.environment`, so you do **not** need to `export` secrets before `serverless deploy`. Prisma client uses **`rhel-openssl-3.0.x`** for the Lambda/Linux runtime (see `prisma/schema.prisma` `binaryTargets`).

## Prerequisites

- AWS account + IAM credentials
- AWS CLI configured
- Serverless Framework v3+
- Neon project and connection string

## Required Environment Variables

- `DATABASE_URL` (Neon, with `sslmode=require`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_LOGIN_MAX`
- Redis variables if cache is enabled

**Users / login:** credentials live in the PostgreSQL **`users`** table (see Prisma `User` model). Bootstrap a first admin with `SEED_ADMIN_USERNAME` + `SEED_ADMIN_PASSWORD` and `npm run db:seed`, or insert a row manually (bcrypt hash in `password_hash`).

## Serverless configuration

The canonical definition is **`serverless.yml`** at the repo root. **`serverless-dotenv-plugin`** loads `.env` and merges only keys listed in `custom.dotenv.include` into `provider.environment` (required keys are enforced via `custom.dotenv.required.env`). The deployment package excludes `.env` via `package.patterns`.

**Do not** share or commit output of `serverless print` in public channels — it expands resolved environment values.

### Lambda package size (250 MB unzipped limit)

The deployment zip must stay under AWS Lambda’s **unzipped** size limit. This project:

- Sets **`package.excludeDevDependencies: true`** so Jest, ESLint, `prisma` CLI, `serverless`, etc. are not bundled.
- Excludes heavy **optional** paths that often appear in `node_modules` (e.g. legacy **`aws-sdk` v2**, **Prisma Studio**, duplicate **Prisma query engines** when you generated on macOS/Linux with more than one `binaryTargets`).

Run **`npm run db:generate`** on the same machine/OS you deploy from, or in CI use a **Linux** job so the generated `.prisma/client` matches Lambda. If deploy still fails, run `npx serverless package` and inspect `.serverless/*.zip` size.

## Deployment Flow

```bash
# 1) Install dependencies
npm install

# 2) Ensure `.env` exists at the repo root with required variables (see Required Environment Variables)

# 3) Deploy (runs prisma generate, then serverless deploy)
npm run deploy

# Or step by step:
npm run db:generate
npx serverless deploy
```

## Database Migration Flow (Production)

Apply migrations before or during release:

```bash
npx prisma migrate deploy
```

If the database already had tables created outside Prisma Migrate (e.g. only `db push` before), either [baseline](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/troubleshooting-development) the migration history or run the SQL in `prisma/migrations/*/migration.sql` manually once, then mark the migration as applied.

Seed only if your environment requires initial data:

```bash
npm run db:seed
```

## Prisma + Neon in Serverless

- Use Neon connection string with TLS (`sslmode=require`).
- Keep Prisma client reused across invocations when possible (module-level singleton).
- Avoid opening new clients per request.
- Prefer running migrations in CI/CD, not inside request handlers.

## Optional Optimization Path

For serverless-heavy traffic, evaluate Prisma driver adapters for Neon and tune connection behavior for Lambda concurrency.

## Post-Deploy Checklist

- API Gateway URL responds on `/api/health`
- Auth login works with configured admin credentials
- Prisma queries succeed against Neon
- Rate limiter environment variables are set for production traffic

