# Authentication API Documentation

This documentation describes the available endpoints for authentication and health checks in the One Piece API.

## Available Endpoints

### Health Check

#### Get API Health Status
**GET** `/api/health`

Gets the current health status of the API.

#### Example Response:
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0"
}
```

### Authentication

#### Login
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

#### Body (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "username": "admin"
    }
  }
}
```

#### Error Response:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Verify Token
**GET** `/api/auth/verify`

Verifies if the provided JWT token is valid.

#### Headers:
- `Authorization: Bearer <token>`

#### Example Response:
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "username": "admin"
    },
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### Generate Password Hash (Development Only)
**POST** `/api/auth/generate-hash`

Generates a bcrypt hash for a password. Only available in development mode.

#### Body (JSON):
```json
{
  "password": "admin123"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Password hash generated",
  "data": {
    "hash": "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
  }
}
```

## Authentication Flow

### 1. Login Process
1. Send POST request to `/api/auth/login` with username and password
2. Server validates credentials
3. If valid, server returns JWT token
4. Store token for subsequent requests

### 2. Using the Token
1. Include token in Authorization header: `Authorization: Bearer <token>`
2. Server validates token on each protected request
3. If token is valid, request proceeds
4. If token is invalid/expired, server returns 401 Unauthorized

### 3. Token Verification
1. Send GET request to `/api/auth/verify` with token in header
2. Server validates token
3. Returns token status and user information

## Error Codes

### 400 Bad Request
- Missing username or password
- Invalid request format

### 401 Unauthorized
- Invalid credentials
- Missing or invalid token
- Expired token

### 403 Forbidden
- Token valid but insufficient permissions

### 500 Internal Server Error
- Internal server error

## Security Features

### JWT Token
- **Algorithm**: HS256
- **Expiration**: Configurable (default: 24h in development, 1h in production)
- **Secret**: Environment variable (JWT_SECRET)

### Password Security
- **Hashing**: bcrypt with salt rounds
- **Storage**: Hashed passwords only, never plain text

### Rate Limiting
- **Login attempts**: 3 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes
- **Protected endpoints**: 50 requests per 15 minutes

## Environment Configuration

### Development
```env
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
```

### Production
```env
JWT_SECRET=64-character-random-string
JWT_EXPIRES_IN=1h
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$secure-hash
```

## Best Practices

### Token Management
- Store tokens securely (not in localStorage for production)
- Implement token refresh mechanism
- Log out users when tokens expire

### Password Security
- Use strong passwords
- Generate secure password hashes
- Never log passwords

### Rate Limiting
- Implement client-side rate limiting
- Handle rate limit responses gracefully
- Use exponential backoff for retries

## Example Usage

### Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Use Token for Protected Request
```bash
curl -X GET http://localhost:3000/api/characters \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Verify Token
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
