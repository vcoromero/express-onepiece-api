# Environment Configuration Guide

This directory contains environment configuration files for different deployment environments.

## 📁 `configs/` vs `src/config/` - What's the difference?

| `configs/` | `src/config/` |
|------------|---------------|
| `.env` files | `.js` files |
| Secrets (DO NOT commit) | Code (DO commit) |
| Environment variables | Configuration logic |
| Passwords, API keys | DB setup, Sequelize config |

**Analogy:** `configs/` are the keys, `src/config/` is the lock.

See [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) for more details.

---

## 🚀 Quick Setup

```bash
# Environment files are already created with defaults
# Edit them as needed
nano configs/.env
```

**Never commit** `.env` files (already in `.gitignore`)

---

## 📋 Required Environment Variables

### Server
```env
PORT=3000
NODE_ENV=development  # development, qa, production
```

### Database
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=onepiece_db
DB_PORT=3306
```

### JWT (Security)
```env
# Development - simple values are OK
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h

# Production - secure values REQUIRED
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=64+_character_random_string
JWT_EXPIRES_IN=1h
```

### Admin Credentials
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...  # See generation section
```

**Generate password hash:**
```bash
# 1. Start server
npm run dev

# 2. Generate hash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'

# 3. Copy hash to .env
```

### Rate Limiting (CRITICAL for AWS)
```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Requests per window
RATE_LIMIT_LOGIN_MAX=5           # Login attempts

# Why this is important:
# - Prevents DDoS attacks that increase costs
# - Protection against brute force
# - Controls compute/bandwidth usage
```

### Logging (Recommended for AWS)
```env
LOG_LEVEL=info              # debug, info, warn, error
LOG_FILE=logs/app.log       
LOG_HTTP_REQUESTS=false     # true in development, false in production

# Winston logger is configured for CloudWatch
# Use LOG_LEVEL=info in production for balance between detail and cost
```

---

## 🔒 Security Checklist

### Development ✅
- Simple passwords are OK
- Simple JWT_SECRET is OK
- Relaxed rate limits

### Production ⚠️
- **Strong and unique password**
- **Secure JWT_SECRET (64+ random characters)**
- **Short JWT_EXPIRES_IN (1h recommended)**
- **Strict rate limits**
- **HTTPS enabled**
- **Use AWS Secrets Manager** (not .env)
- **Remove /generate-hash endpoint** (automatically disabled with NODE_ENV=production)

---

## 🛠️ Generate Secure Values

### Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Password Hash
```bash
# Option 1: API endpoint (development only)
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "YourSecurePassword123!"}'

# Option 2: Node.js direct
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(h => console.log(h));"
```

---

## 🐛 Troubleshooting

### "JWT_SECRET is not configured"
**Solution:** Verify that `.env` exists in `configs/` and contains `JWT_SECRET`

### "Invalid credentials" with correct password
**Solution:** 
1. Regenerate password hash
2. Verify you copied the complete hash (must start with `$2a$10$`)
3. No spaces or line breaks

### Variables not loading
**Solution:**
```javascript
// Make sure to load .env
require('dotenv').config({ path: './configs/.env' });
```

---

## 📝 Best Practices

1. **Never commit `.env`** - Already in `.gitignore`
2. **Different secrets per environment** - Don't reuse between dev/prod
3. **Rotate secrets regularly** - Change JWT_SECRET periodically in production
4. **Document new variables** - Keep this README updated
5. **Validate variables on startup** - Check required variables on startup
6. **Use Secrets Manager in production** - AWS Secrets Manager, Azure Key Vault, etc.

---

## 📚 Resources

- [Environment Variables in Node.js](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [Authentication Guide](../docs/AUTHENTICATION.md)
- [AWS Deployment](../docs/AWS_DEPLOYMENT.md)