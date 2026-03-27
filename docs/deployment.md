# Deployment Guide (AWS Lambda + Serverless + Neon)

## Target Architecture

- Runtime: AWS Lambda
- Gateway: API Gateway (HTTP API or REST API)
- Framework: Serverless Framework
- Database: Neon PostgreSQL
- ORM: Prisma

## Current Repository Status

This repository currently runs with `node src/index.js` for local/server runtime.

For Lambda deployment, add and maintain:

- `serverless.yml`
- Lambda handler file (for example `src/lambda.js`)
- Serverless Express adapter dependency

## Prerequisites

- AWS account + IAM credentials
- AWS CLI configured
- Serverless Framework v3+
- Neon project and connection string

## Required Environment Variables

- `DATABASE_URL` (Neon, with `sslmode=require`)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_LOGIN_MAX`
- Redis variables if cache is enabled

## Minimal Serverless Blueprint

```yaml
service: onepiece-api

provider:
  name: aws
  runtime: nodejs20.x
  stage: dev
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}
    JWT_EXPIRES_IN: ${env:JWT_EXPIRES_IN}
    ADMIN_USERNAME: ${env:ADMIN_USERNAME}
    ADMIN_PASSWORD_HASH: ${env:ADMIN_PASSWORD_HASH}

functions:
  api:
    handler: src/lambda.handler
    events:
      - httpApi:
          path: /{proxy+}
          method: ANY
```

## Deployment Flow

```bash
# 1) Install dependencies
npm install

# 2) Generate Prisma client
npm run db:generate

# 3) Deploy infrastructure and lambda
serverless deploy
```

## Database Migration Flow (Production)

Use migration deployment before or during release pipeline:

```bash
npx prisma migrate deploy
```

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

