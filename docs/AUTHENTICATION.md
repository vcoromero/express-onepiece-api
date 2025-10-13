# Authentication Guide - One Piece API

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Quick Setup](#quick-setup)
3. [Generate Password Hash](#generate-password-hash)
4. [Login and Tokens](#login-and-tokens)
5. [Protecting Routes](#protecting-routes)
6. [Best Practices](#best-practices)

---

## 🔐 Introduction

This API uses **JWT (JSON Web Tokens)** for authentication.

**Flow:**
1. Admin logs in with username/password
2. Backend validates and returns a JWT token
3. Client includes the token in subsequent requests
4. Backend validates the token on protected routes

---

## ⚡ Quick Setup

### 1. Generate Password Hash

```bash
# Start dev server
npm run dev

# Generate hash for your password
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'

# Response:
# {
#   "success": true,
#   "hash": "$2a$10$..."
# }
```

### 2. Configure .env

Add the hash to your `configs/.env` file:

```env
# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...  # ← Your hash here

# JWT Configuration
JWT_SECRET=your-very-long-random-secret-key
JWT_EXPIRES_IN=24h
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_secure_password"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 4. Use the Token

```bash
curl -X POST http://localhost:3000/api/fruit-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Mythical Zoan",
    "description": "Rare type"
  }'
```

---

## 🔑 Generate Password Hash

### Method 1: Development Endpoint (Recommended)

**⚠️ This endpoint ONLY works in NODE_ENV=development or test**

```bash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "MySecurePassword123!"}'
```

### Method 2: Direct Node.js

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(h => console.log(h));"
```

### Method 3: Node.js Script

Create `generate-hash.js`:

```javascript
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.log('Usage: node generate-hash.js "your_password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nPassword Hash:');
  console.log(hash);
  console.log('\nAdd to your .env:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});
```

Usage:
```bash
node generate-hash.js "MySecurePassword123!"
```

---

## 🎫 Login and Tokens

### POST /api/auth/login

Authenticates user and returns a JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjk5OTk5OTk5LCJleHAiOjE3MDAwODYzOTl9.abc123...",
    "expiresIn": "24h",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### GET /api/auth/verify

Verifies if a token is valid.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "username": "admin",
    "role": "admin",
    "iat": 1699999999,
    "exp": 1700086399
  }
}
```

**Response (Error - Invalid Token):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Response (Error - No Token):**
```json
{
  "success": false,
  "message": "Authentication token not provided"
}
```

---

## 🛡️ Protecting Routes

### Using Auth Middleware

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/your.controller');

// PUBLIC routes - No authentication required
router.get('/items', controller.getAll);
router.get('/items/:id', controller.getById);

// PROTECTED routes - Authentication required
router.post('/items', authMiddleware, controller.create);
router.put('/items/:id', authMiddleware, controller.update);
router.delete('/items/:id', authMiddleware, controller.delete);

module.exports = router;
```

### Custom Middleware

If you need additional validations:

```javascript
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware that checks specific role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Usage
router.delete('/items/:id', authMiddleware, requireAdmin, controller.delete);
```

### Access User Info in Controllers

The middleware adds `req.user` with token information:

```javascript
const createItem = async (req, res) => {
  try {
    // Access authenticated user info
    const username = req.user.username;
    const role = req.user.role;
    
    console.log(`User ${username} (${role}) is creating an item`);
    
    // Your logic here...
  } catch (error) {
    // Error handling...
  }
};
```

---

## ✅ Best Practices

### Development

```env
# ✅ Simple passwords are OK
ADMIN_PASSWORD_HASH=$2a$10$simple_hash_for_dev

# ✅ Simple JWT Secret
JWT_SECRET=dev-secret-key-12345

# ✅ Long-lived tokens to avoid constant re-login
JWT_EXPIRES_IN=24h

# ✅ Generate-hash endpoint enabled
NODE_ENV=development
```

### Production

```env
# ⚠️ STRONG and unique password
# Generate with: openssl rand -base64 32
ADMIN_PASSWORD_HASH=$2a$10$secure_production_hash

# ⚠️ LONG and random JWT Secret (64+ characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=f3d4e5c6b7a8910234567890abcdef...128_characters_total

# ⚠️ Short-lived tokens
JWT_EXPIRES_IN=1h

# ⚠️ NODE_ENV in production (disables generate-hash endpoint)
NODE_ENV=production
```

### General Security

1. **HTTPS in production**
   - Never send tokens over HTTP
   - Use ALB, CloudFront, or API Gateway with SSL

2. **Tokens in headers, NOT in URL**
   ```bash
   # ✅ CORRECT
   curl -H "Authorization: Bearer TOKEN" https://api.example.com/items
   
   # ❌ WRONG (token visible in logs)
   curl https://api.example.com/items?token=TOKEN
   ```

3. **Rate limiting on login**
   - Project already includes rate limiting
   - Login limited to 5 attempts per 15 minutes
   - Prevents brute force attacks

4. **Renew tokens**
   - Implement refresh tokens for better UX
   - Or increase JWT_EXPIRES_IN in development

5. **Remove generate-hash in production**
   - Endpoint automatically disables with NODE_ENV=production
   - NEVER expose it in production

6. **Rotate secrets**
   - Change JWT_SECRET periodically
   - Change admin password every 3-6 months

7. **Security logging**
   - App already logs failed login attempts
   - Check `logs/security.log` regularly

---

## 🐛 Troubleshooting

### "Invalid credentials" with correct password

**Cause:** Hash doesn't match password

**Solution:**
1. Regenerate the hash
2. Verify you copied the entire hash (must start with `$2a$10$`)
3. Ensure there are no spaces or line breaks

### "Authentication token not provided"

**Cause:** Didn't send Authorization header

**Solution:**
```bash
# Include the header
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" ...
```

### "Invalid or expired token"

**Possible causes:**
- Token expired (check JWT_EXPIRES_IN)
- JWT_SECRET changed (regenerate token)
- Token malformed

**Solution:**
1. Login again to get fresh token
2. Verify JWT_SECRET hasn't changed

### "JWT_SECRET is not configured"

**Cause:** Missing environment variable

**Solution:**
```bash
# Verify configs/.env exists and contains:
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=24h
```

---

## 🔄 Implement Refresh Tokens (Advanced)

To improve UX without sacrificing security:

```javascript
// TODO: Implement refresh tokens
// 1. Short access token (15min)
// 2. Long refresh token (7 days)
// 3. /api/auth/refresh endpoint to renew access token
// 4. Store refresh tokens in DB with user/device info
```

This allows:
- Keep access tokens short (more secure)
- Don't force login every 15 minutes (better UX)
- Invalidate specific sessions (better control)

---

## 📚 Resources

- [JWT.io](https://jwt.io/) - Token debugger
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [OWASP Auth Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Questions?** Open an issue in the repo.
