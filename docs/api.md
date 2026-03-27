# API Documentation

## Base URLs

- Local: `http://localhost:3000`
- AWS API Gateway (Lambda): set after deployment

## Authentication

- Public endpoints: most `GET` routes.
- Protected endpoints: `POST`, `PUT`, `DELETE` routes that modify data.
- Auth type: `Bearer` JWT token.

```http
Authorization: Bearer <token>
```

### Auth Endpoints

- `POST /api/auth/login`
- `GET /api/auth/verify`

## Rate Limiting

- Global limiter on all API routes: default `100 requests / 15 min` (`RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_MS`).
- Auth login limiter: default `5 failed attempts / 15 min` (`RATE_LIMIT_LOGIN_MAX`).
- Sensitive operation limiter: default `50 requests / 15 min` for write operations.

## Endpoints

## Health

- `GET /api/health`

## Characters

- `GET /api/characters`
- `GET /api/characters/search`
- `GET /api/characters/:id`
- `POST /api/characters`
- `PUT /api/characters/:id`
- `DELETE /api/characters/:id`

`GET /api/characters` query params:

- `page`, `limit`
- `search`
- `race_id`
- `character_type_id`
- `min_bounty`, `max_bounty`
- `is_alive`
- `sortBy`, `sortOrder`

## Devil Fruits

- `GET /api/devil-fruits`
- `GET /api/devil-fruits/type/:typeId`
- `GET /api/devil-fruits/:id`
- `POST /api/devil-fruits`
- `PUT /api/devil-fruits/:id`
- `DELETE /api/devil-fruits/:id`

`GET /api/devil-fruits` query params:

- `page`, `limit`
- `search`
- `type_id`
- `sortBy`, `sortOrder`

## Organizations

- `GET /api/organizations`
- `GET /api/organizations/:id`
- `GET /api/organizations/type/:organizationTypeId`
- `GET /api/organizations/:id/members`
- `POST /api/organizations`
- `PUT /api/organizations/:id`
- `DELETE /api/organizations/:id`

`GET /api/organizations` query params:

- `page`, `limit`
- `search`
- `status`
- `organizationTypeId`
- `sortBy`, `sortOrder`

## Ships

- `GET /api/ships`
- `GET /api/ships/status/:status`
- `GET /api/ships/:id`
- `POST /api/ships`
- `PUT /api/ships/:id`
- `DELETE /api/ships/:id`

`GET /api/ships` query params:

- `page`, `limit`
- `status`
- `search`

## Reference Resources

### Races

- `GET /api/races`
- `GET /api/races/:id`
- `PUT /api/races/:id`

### Character Types

- `GET /api/character-types`
- `GET /api/character-types/:id`
- `PUT /api/character-types/:id`

### Organization Types

- `GET /api/organization-types`
- `GET /api/organization-types/:id`
- `PUT /api/organization-types/:id`

### Haki Types

- `GET /api/haki-types`
- `GET /api/haki-types/:id`
- `PUT /api/haki-types/:id`

### Fruit Types

- `GET /api/fruit-types`
- `GET /api/fruit-types/:id`
- `PUT /api/fruit-types/:id`

## Response Format

Most endpoints return:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

Paginated endpoints include `pagination`.

## Manual Testing with Bruno

Bruno is the official manual API testing tool for this project. Keep request collections under `bruno/` at repository root.

## Future GraphQL Plan

A GraphQL layer is planned for future phases. Current REST endpoints remain the source of truth until GraphQL is introduced.

