# Devil Fruits API Documentation

This documentation describes the available endpoints for devil fruit management in the One Piece API.

## Available Endpoints

### 1. Get All Devil Fruits
**GET** `/api/devil-fruits`

Gets a paginated list of all devil fruits with optional filters.

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term to filter by name
- `type_id` (optional): Devil fruit type ID to filter by
- `rarity` (optional): Rarity to filter by (common, rare, legendary, mythical)
- `sortBy` (optional): Sort field (id, name, rarity, power_level, created_at)
- `sortOrder` (optional): Sort order (ASC, DESC)

#### Example Response:
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10
  },
  "data": [
    {
      "id": 1,
      "name": "Gomu Gomu no Mi",
      "type_id": 1,
      "description": "Rubber fruit",
      "abilities": "Stretching abilities",
      "current_user": "Monkey D. Luffy",
      "rarity": "legendary",
      "power_level": 95,
      "is_awakened": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "type": {
        "id": 1,
        "name": "Paramecia",
        "description": "Superhuman powers"
      }
    }
  ]
}
```

### 2. Get Devil Fruit by ID
**GET** `/api/devil-fruits/:id`

Gets a specific devil fruit by its ID.

#### Parameters:
- `id`: Devil fruit ID

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Gomu Gomu no Mi",
    "type_id": 1,
    "description": "Rubber fruit",
    "abilities": "Stretching abilities",
    "current_user": "Monkey D. Luffy",
    "previous_users": "[]",
    "rarity": "legendary",
    "power_level": 95,
    "is_awakened": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "type": {
      "id": 1,
      "name": "Paramecia",
      "description": "Superhuman powers"
    }
  }
}
```

### 3. Create New Devil Fruit
**POST** `/api/devil-fruits`

Creates a new devil fruit. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Body (JSON):
```json
{
  "name": "Gomu Gomu no Mi",
  "type_id": 1,
  "description": "Rubber fruit",
  "abilities": "Stretching abilities",
  "current_user": "Monkey D. Luffy",
  "previous_users": "[]",
  "rarity": "legendary",
  "power_level": 95,
  "is_awakened": true
}
```

#### Required Fields:
- `name`: Devil fruit name (max 100 characters)
- `type_id`: Devil fruit type ID (must exist)

#### Optional Fields:
- `description`: Devil fruit description
- `abilities`: Special abilities
- `current_user`: Current devil fruit user
- `previous_users`: Previous users (JSON string)
- `rarity`: Rarity (common, rare, legendary, mythical) - default: common
- `power_level`: Power level (1-100)
- `is_awakened`: If awakened (boolean) - default: false

#### Example Response:
```json
{
  "success": true,
  "message": "Devil fruit created successfully",
  "data": {
    "id": 1,
    "name": "Gomu Gomu no Mi",
    "type_id": 1,
    "description": "Rubber fruit",
    "abilities": "Stretching abilities",
    "current_user": "Monkey D. Luffy",
    "rarity": "legendary",
    "power_level": 95,
    "is_awakened": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "type": {
      "id": 1,
      "name": "Paramecia",
      "description": "Superhuman powers"
    }
  }
}
```

### 4. Update Devil Fruit
**PUT** `/api/devil-fruits/:id`

Updates an existing devil fruit. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Devil fruit ID to update

#### Body (JSON):
```json
{
  "name": "Updated Name",
  "power_level": 80,
  "is_awakened": true
}
```

All fields are optional. Only provided fields will be updated.

#### Example Response:
```json
{
  "success": true,
  "message": "Devil fruit updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Name",
    "type_id": 1,
    "power_level": 80,
    "is_awakened": true,
    "type": {
      "id": 1,
      "name": "Paramecia"
    }
  }
}
```

### 5. Delete Devil Fruit
**DELETE** `/api/devil-fruits/:id`

Deletes a devil fruit. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Devil fruit ID to delete

#### Example Response:
```json
{
  "success": true,
  "message": "Devil fruit \"Gomu Gomu no Mi\" deleted successfully"
}
```

### 6. Get Devil Fruits by Type
**GET** `/api/devil-fruits/type/:typeId`

Gets all devil fruits of a specific type.

#### Parameters:
- `typeId`: Devil fruit type ID

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (id, name, rarity, power_level, created_at)
- `sortOrder` (optional): Sort order (ASC, DESC)

#### Example Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10
  },
  "data": [
    {
      "id": 1,
      "name": "Gomu Gomu no Mi",
      "type_id": 1,
      "rarity": "legendary",
      "type": {
        "id": 1,
        "name": "Paramecia"
      }
    }
  ]
}
```

## Error Codes

### 400 Bad Request
- Invalid validation parameters
- Missing required fields
- Values out of range

### 401 Unauthorized
- Missing or invalid authentication token

### 404 Not Found
- Devil fruit not found
- Devil fruit type not found

### 409 Conflict
- Devil fruit name already exists
- Devil fruit type has associated devil fruits

### 500 Internal Server Error
- Internal server error

## Relationships

### Devil Fruit ↔ Devil Fruit Type
- A Devil Fruit belongs to a Devil Fruit Type
- A Devil Fruit Type can have many Devil Fruits
- Relationship: `belongsTo` / `hasMany`

## Validations

### Devil Fruit Fields:
- `name`: Required, unique, max 100 characters
- `type_id`: Required, must exist in devil_fruit_types
- `description`: Optional, free text
- `abilities`: Optional, free text
- `current_user`: Optional, max 100 characters
- `previous_users`: Optional, valid JSON string
- `rarity`: Enum (common, rare, legendary, mythical)
- `power_level`: Integer between 1 and 100
- `is_awakened`: Boolean

### Available Filters:
- Search by name (case-insensitive)
- Filter by devil fruit type
- Filter by rarity
- Sort by multiple fields
- Pagination

## Rate Limiting

- **GET endpoints**: 100 requests per 15 minutes
- **POST/PUT/DELETE endpoints**: 50 requests per 15 minutes (requires authentication)