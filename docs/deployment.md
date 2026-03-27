# Deployment Guide

## Overview

This API is a standard Node.js Express application. It can be deployed on any platform that supports Node.js, including VPS servers, Docker containers, or managed PaaS providers.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional, for future caching)
- npm or yarn

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=24h

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...  # bcrypt hash

# Server
PORT=3000
NODE_ENV=production

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Docker Deployment (Recommended)

The project includes a `docker-compose.yml` for running the full stack locally or in production.

### 1. Start all services

```bash
docker-compose up -d
```

### 2. Run database migrations and seed

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 3. Start the API

```bash
npm start
```

---

## Manual Deployment (VPS / Bare Metal)

### 1. Install Node.js dependencies

```bash
npm install --omit=dev
```

### 2. Set up PostgreSQL

```bash
# Create user and database
psql -U postgres -c "CREATE USER onepiece_user WITH PASSWORD 'yourpassword';"
psql -U postgres -c "CREATE DATABASE onepiece_db OWNER onepiece_user;"
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

### 4. Generate Prisma client and push schema

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start the server

```bash
npm start
```

---

## Process Management with PM2

For production, use PM2 to keep the process running and auto-restart on failure.

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start src/index.js --name onepiece-api

# Save the process list for auto-restart on reboot
pm2 save
pm2 startup
```

### Useful PM2 commands

```bash
pm2 status            # View running processes
pm2 logs onepiece-api # View logs
pm2 restart onepiece-api
pm2 stop onepiece-api
pm2 delete onepiece-api
```

---

## Nginx Reverse Proxy

When running on a VPS, use Nginx as a reverse proxy in front of the Node.js app.

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable HTTPS with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Production Checklist

- [ ] `NODE_ENV=production` is set
- [ ] `JWT_SECRET` is a strong random value
- [ ] PostgreSQL is running and accessible
- [ ] Database schema has been pushed and seed run
- [ ] `ADMIN_PASSWORD_HASH` is a valid bcrypt hash
- [ ] PM2 or equivalent process manager is configured
- [ ] Nginx reverse proxy is configured
- [ ] HTTPS certificate is installed
- [ ] Rate limiting values are appropriate for traffic volume
- [ ] Logs directory is writable

---

## Logging

Logs are written to the `logs/` directory using Winston. In production, set `LOG_LEVEL=error` to reduce noise:

```env
LOG_LEVEL=error
LOG_HTTP_REQUESTS=false
```

---

## Health Check

Verify the API is running:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "One Piece API is running",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```
