# Environment Configuration Guide

This directory contains environment configuration templates for different deployment environments.

## ⚠️ `configs/` vs `src/config/` - What's the difference?

### `configs/` (This folder) - Environment Variables
- Contains `.env` files with **secrets and environment-specific configuration**
- ❌ **NOT committed** to git (except templates)
- 🔒 **Sensitive** information (passwords, API keys, secrets)
- 📝 Plain **text files** (.env)

### `src/config/` - Code Configuration  
- Contains `.js` files with **configuration logic**
- ✅ **ARE committed** to git (it's source code)
- 🔓 **Don't contain secrets** (read from `process.env`)
- 💻 **JavaScript code** files (.js)

**Analogy:**
- `configs/` = Your house keys (don't share them)
- `src/config/` = The lock (the code that uses the keys)

See [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) for more details.

## Quick Setup

1. **All environment files are in the `configs/` directory:**
   ```bash
   configs/.env              # Local development (DO NOT COMMIT)
   configs/.env.test         # Test environment
   configs/.env.qa           # QA environment
   configs/.env.production   # Production environment
   configs/.env.example      # Template/reference
   ```

2. **For local development:**
   ```bash
   # The configs/.env file is already created with defaults
   # Edit it with your local values if needed
   ```

3. **Never commit** environment files (already in `.gitignore`)

---

## Environment Variables

### Server Configuration

```env
PORT=3000
NODE_ENV=development  # development, qa, production
```

### Database Configuration

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=onepiece_db
DB_PORT=3306
```

### JWT Configuration

**Development:**
```env
JWT_SECRET=dev-secret-key-do-not-use-in-production
JWT_EXPIRES_IN=24h
```

**Production:**
```env
# Generate a secure secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=f3d4e5c6b7a8... # 64+ character random string
JWT_EXPIRES_IN=1h  # Shorter expiration for production
```

### Admin Credentials

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...  # See below for generation
```

**To generate password hash:**
```bash
# Start dev server
npm run dev

# Generate hash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'

# Copy the hash to ADMIN_PASSWORD_HASH
```

### Security (Recommended for Production/AWS)

```env
# Rate limiting configuration - CRITICAL for AWS cost control
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window (general API)
RATE_LIMIT_LOGIN_MAX=5           # Max login attempts per window

# Why this is important for AWS:
# - Prevents DDoS attacks that could increase costs
# - Protects against brute force attacks
# - Controls compute/bandwidth usage
```

### Logging (Highly Recommended for AWS)

```env
LOG_LEVEL=info              # debug, info, warn, error
LOG_FILE=logs/app.log       # Log file path
LOG_HTTP_REQUESTS=false     # Set to true to log all HTTP requests

# AWS CloudWatch Integration:
# Winston logger is configured to work with CloudWatch Logs
# Set LOG_LEVEL=info in production to balance detail with cost
```

---

## Environment Templates

### Local Development (configs/.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=onepiece_db
DB_PORT=3306

# JWT
JWT_SECRET=dev-secret-key-for-local-development-only
JWT_EXPIRES_IN=24h

# Admin
ADMIN_USERNAME=admin
# Password: "admin123" (development only)
ADMIN_PASSWORD_HASH=$2a$10$8vQ9ZxGPQ5KHYpQKmEWZDuYjLZGJ5wZH5gH5.mQxJQF9nQxJQF9nO

# Security (relaxed for development)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=10

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/development.log
LOG_HTTP_REQUESTS=true  # Log all requests in development
```

### Test Environment (configs/.env.test)

```env
# Server
PORT=3000
NODE_ENV=test

# Database (use test database)
DB_HOST=localhost
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=onepiece_db_test
DB_PORT=3306

# JWT
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h

# Admin
ADMIN_USERNAME=testadmin
ADMIN_PASSWORD_HASH=$2a$10$8vQ9ZxGPQ5KHYpQKmEWZDuYjLZGJ5wZH5gH5.mQxJQF9nQxJQF9nO

# Security
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=10

# Logging (minimal in tests)
LOG_LEVEL=error
LOG_FILE=logs/test.log
LOG_HTTP_REQUESTS=false
```

### QA Environment (configs/.env.qa)

```env
# Server
PORT=3000
NODE_ENV=qa

# Database
DB_HOST=qa-db-server
DB_USER=qa_user
DB_PASSWORD=qa_secure_password
DB_NAME=onepiece_db_qa
DB_PORT=3306

# JWT
JWT_SECRET=qa-secret-key-for-testing-only
JWT_EXPIRES_IN=12h

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$your_qa_password_hash_here

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_LOGIN_MAX=10

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/qa.log
```

### Production Environment (configs/.env.production)

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=onepiece_db_production
DB_PORT=3306

# JWT - CRITICAL: Use secure random strings
JWT_SECRET=CHANGE_THIS_TO_SECURE_64_CHAR_RANDOM_STRING
JWT_EXPIRES_IN=1h

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$your_production_password_hash_here

# Security (stricter in production)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50       # Stricter for production
RATE_LIMIT_LOGIN_MAX=3           # Only 3 login attempts per 15 min

# Logging (AWS CloudWatch ready)
LOG_LEVEL=info
LOG_FILE=logs/production.log
LOG_HTTP_REQUESTS=false          # Disable to reduce log volume/costs
```

---

## Security Checklist

### Development
- ✅ Any password is fine for learning
- ✅ Simple JWT_SECRET is acceptable
- ✅ Relaxed rate limits

### Production
- ⚠️ **Use strong, unique admin password**
- ⚠️ **Generate secure JWT_SECRET** (64+ random characters)
- ⚠️ **Shorter token expiration** (1h recommended)
- ⚠️ **Stricter rate limits**
- ⚠️ **Never use development passwords**
- ⚠️ **Enable HTTPS**
- ⚠️ **Remove /generate-hash endpoint**

---

## Generating Secure Values

### Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Output: f3d4e5c6b7a8...128_characters...
```

### Password Hash
```bash
# Option 1: Use the API endpoint (development only)
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "YourSecurePassword123!"}'

# Option 2: Use Node.js directly
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(h => console.log(h));"
```

---

## Troubleshooting

### "JWT_SECRET is not configured"
**Solution:** Make sure `.env` file exists in project root and contains `JWT_SECRET`

### "Authentication configuration error"
**Solution:** Check that `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` are set in `.env`

### "Invalid credentials" on correct password
**Solution:** Regenerate the password hash and update `ADMIN_PASSWORD_HASH`

### Can't access environment variables
**Solution:** Ensure you're loading the `.env` file:
```javascript
require('dotenv').config();
```

---

## Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different secrets per environment** - Development vs Production
3. **Rotate secrets regularly** - Change JWT_SECRET periodically in production
4. **Document required variables** - Keep this README updated
5. **Use environment variable validation** - Check all required vars on startup
6. **Store production secrets securely** - Use AWS Secrets Manager, Azure Key Vault, etc.

---

## Example: Creating Your Environment

```bash
# 1. Create .env file
touch configs/.env

# 2. Add basic configuration
cat > configs/.env << 'EOF'
PORT=3000
NODE_ENV=development
JWT_SECRET=my-dev-secret-key
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=
EOF

# 3. Generate password hash
npm run dev
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'

# 4. Copy hash and add to .env
# 5. Restart server
# 6. Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Done! 🎉
