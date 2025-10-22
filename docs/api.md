# 📚 API Documentation

## Overview

The One Piece API provides comprehensive access to the One Piece universe data through RESTful endpoints. All endpoints return JSON responses and support pagination, filtering, and search functionality.

## Base URL

- **Production**: `d1lu4jq11jb97o.cloudfront.net`
- **Local Development**: `http://localhost:3000`

## Authentication

**GET endpoints are public** and don't require authentication. **POST, PUT, and DELETE endpoints require JWT authentication**.

Include the token in the Authorization header for protected endpoints:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

```bash
curl -X POST https://d1lu4jq11jb97o.cloudfront.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Core Endpoints

### Health Check
```http
GET /api/health
```
Returns API status and basic information. **Public endpoint - no authentication required**.

### Authentication
```http
POST /api/auth/login          # Public - no auth required
GET /api/auth/verify          # Protected - requires JWT token
```

### Characters
```http
GET /api/characters           # Public - no auth required
GET /api/characters/:id       # Public - no auth required
POST /api/characters          # Protected - requires JWT token
PUT /api/characters/:id       # Protected - requires JWT token
DELETE /api/characters/:id    # Protected - requires JWT token
```

### Organizations
```http
GET /api/organizations        # Public - no auth required
GET /api/organizations/:id    # Public - no auth required
POST /api/organizations       # Protected - requires JWT token
PUT /api/organizations/:id    # Protected - requires JWT token
DELETE /api/organizations/:id # Protected - requires JWT token
```

### Ships
```http
GET /api/ships               # Public - no auth required
GET /api/ships/:id           # Public - no auth required
POST /api/ships              # Protected - requires JWT token
PUT /api/ships/:id           # Protected - requires JWT token
DELETE /api/ships/:id        # Protected - requires JWT token
```

### Devil Fruits
```http
GET /api/devil-fruits        # Public - no auth required
GET /api/devil-fruits/:id    # Public - no auth required
POST /api/devil-fruits       # Protected - requires JWT token
PUT /api/devil-fruits/:id    # Protected - requires JWT token
DELETE /api/devil-fruits/:id # Protected - requires JWT token
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Search & Filtering
- `search`: Full-text search across relevant fields
- `status`: Filter by status (alive, deceased, unknown)
- `type_id`: Filter by type ID
- `organization_id`: Filter by organization

### Sorting
- `sort`: Field to sort by
- `order`: Sort order (asc, desc)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Data retrieved successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Rate Limiting

- **General endpoints**: 100 requests per 15 minutes
- **Sensitive endpoints**: 50 requests per 15 minutes

## Examples

### Get All Characters (Public - No Auth Required)
```bash
curl -X GET "https://d1lu4jq11jb97o.cloudfront.net/api/characters?page=1&limit=10"
```

### Search Characters (Public - No Auth Required)
```bash
curl -X GET "https://d1lu4jq11jb97o.cloudfront.net/api/characters?search=luffy&status=alive"
```

### Create New Character (Protected - Requires JWT Token)
```bash
curl -X POST "https://d1lu4jq11jb97o.cloudfront.net/api/characters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Monkey D. Luffy",
    "alias": "Straw Hat Luffy",
    "bounty": 3000000000,
    "status": "alive",
    "race_id": 1
  }'
```

## Postman Collection

Import the provided Postman collection for easy API testing:

- `onepiece-api-get-only.postman_collection.json`
