# Project Enhancements and Cleanup Plan

## Overview

This document outlines the steps to enhance the project after the PostgreSQL + Prisma migration. The main goals are to remove legacy AWS Serverless deployment configurations, rebuild and enhance the unit testing suite, and correct outdated documentation.

## Phase 1: Remove Serverless Deployment to AWS

The project is moving away from AWS Serverless deployments. We need to clean up all related configurations and dependencies.

### Tasks

- [x] Delete `serverless.yml`
- [x] Delete `src/lambda.js`
- [x] Remove `serverless-http`, `serverless-dotenv-plugin`, and `serverless-offline` from `package.json`
- [x] Remove `@aws-sdk/client-secrets-manager` dependency
- [x] Simplify `src/config/secrets.js` to read directly from environment variables

## Phase 2: Enhance Unit Testing

The previous tests were built for Sequelize and have been deleted or broken during the Prisma migration. We need to rebuild a robust testing suite using Jest and Prisma mocks.

### Tasks

- [x] Recreate authentication tests (`__tests__/auth.test.js`) using Supertest
- [x] Recreate `__tests__/characters.test.js` with mocked Prisma
- [x] Recreate `__tests__/character-types.test.js` with mocked Prisma
- [x] Recreate `__tests__/devil-fruits.test.js` with mocked Prisma
- [x] Recreate `__tests__/fruit-types.test.js` with mocked Prisma
- [x] Recreate `__tests__/haki-types.test.js` with mocked Prisma
- [x] Recreate `__tests__/organization-types.test.js` with mocked Prisma
- [x] Recreate `__tests__/races.test.js` with mocked Prisma
- [x] Recreate `__tests__/health.test.js` using Supertest
- [x] Recreate `__tests__/middlewares/rate-limiter.test.js`
- [x] Recreate `__tests__/rate-limiter.test.js` (integration)
- [x] Recreate `__tests__/utils/endpoint-display.test.js`
- [x] Recreate `__tests__/utils/jwt.util.test.js`
- [x] Remove `characters.test.js` from `testPathIgnorePatterns` in `package.json`

## Phase 3: Update Documentation

Several documentation files contained outdated information regarding MySQL/Sequelize and AWS Serverless deployment.

### Tasks

- [x] Rewrite `docs/deployment.md`: Remove AWS Serverless. Now covers Docker, VPS/bare-metal, PM2, Nginx.
- [x] Rewrite `docs/database.md`: Reflects PostgreSQL + Prisma (removed all MySQL references).
- [x] Rewrite `docs/development.md`: Updated prerequisites (Docker instead of MySQL), PostgreSQL setup, updated project structure.
- [x] Update `README.md`: Updated tech stack, quick start, endpoints table, removed AWS badges/references.
- [x] Update `docs/migration/postgresql-prisma-migration.md`: Removed AWS-specific production env section.
