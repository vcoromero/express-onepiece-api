# Characters API Documentation

This documentation describes the available endpoints for character management in the One Piece API.

## Available Endpoints

### 1. Get All Characters
**GET** `/api/characters`

Gets a paginated list of all characters with optional filters.

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term to filter by name
- `race_id` (optional): Race ID to filter by
- `character_type_id` (optional): Character type ID to filter by
- `sortBy` (optional): Sort field (id, name, bounty, created_at)
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
      "name": "Monkey D. Luffy",
      "bounty": 3000000000,
      "race_id": 1,
      "character_type_id": 1,
      "devil_fruits": [],
      "haki_types": [],
      "organizations": [],
      "race": {
        "id": 1,
        "name": "Human"
      },
      "character_type": {
        "id": 1,
        "name": "Pirate"
      }
    }
  ]
}
```

### 2. Search Characters
**GET** `/api/characters/search`

Advanced search for characters with multiple criteria.

#### Query Parameters:
- `q` (required): Search query
- `race_id` (optional): Filter by race
- `character_type_id` (optional): Filter by character type
- `min_bounty` (optional): Minimum bounty
- `max_bounty` (optional): Maximum bounty

### 3. Get Character by ID
**GET** `/api/characters/:id`

Gets a specific character by ID with all relationships.

#### Parameters:
- `id`: Character ID

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Monkey D. Luffy",
    "bounty": 3000000000,
    "race_id": 1,
    "character_type_id": 1,
    "devil_fruits": [
      {
        "id": 1,
        "name": "Gomu Gomu no Mi",
        "type": "Paramecia"
      }
    ],
    "haki_types": [
      {
        "id": 1,
        "name": "Observation Haki"
      }
    ],
    "organizations": [
      {
        "id": 1,
        "name": "Straw Hat Pirates"
      }
    ],
    "race": {
      "id": 1,
      "name": "Human"
    },
    "character_type": {
      "id": 1,
      "name": "Pirate"
    }
  }
}
```

### 4. Create New Character
**POST** `/api/characters`

Creates a new character. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Body (JSON):
```json
{
  "name": "Monkey D. Luffy",
  "bounty": 3000000000,
  "race_id": 1,
  "character_type_id": 1,
  "description": "Captain of the Straw Hat Pirates"
}
```

#### Required Fields:
- `name`: Character name (max 100 characters)
- `race_id`: Race ID (must exist)
- `character_type_id`: Character type ID (must exist)

#### Optional Fields:
- `bounty`: Character bounty (integer)
- `description`: Character description
- `devil_fruit_ids`: Array of devil fruit IDs
- `haki_type_ids`: Array of haki type IDs
- `organization_ids`: Array of organization IDs

### 5. Update Character
**PUT** `/api/characters/:id`

Updates an existing character. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Character ID to update

#### Body (JSON):
```json
{
  "name": "Updated Name",
  "bounty": 4000000000
}
```

All fields are optional. Only provided fields will be updated.

### 6. Delete Character
**DELETE** `/api/characters/:id`

Deletes a character. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Character ID to delete

#### Example Response:
```json
{
  "success": true,
  "message": "Character \"Monkey D. Luffy\" deleted successfully"
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
- Character not found
- Race not found
- Character type not found

### 409 Conflict
- Character name already exists

### 500 Internal Server Error
- Internal server error

## Relationships

### Character Relationships:
- **Character ↔ Devil Fruit** (many-to-many)
- **Character ↔ Haki Types** (many-to-many)
- **Character ↔ Organizations** (many-to-many)
- **Character ↔ Character Types** (many-to-many)
- **Character ↔ Race** (belongsTo)

## Validations

### Character Fields:
- `name`: Required, unique, max 100 characters
- `race_id`: Required, must exist in races table
- `character_type_id`: Required, must exist in character_types table
- `bounty`: Optional, integer >= 0
- `description`: Optional, free text

### Available Filters:
- Search by name (case-insensitive)
- Filter by race
- Filter by character type
- Sort by multiple fields
- Pagination

## Rate Limiting

- **GET endpoints**: 100 requests per 15 minutes
- **POST/PUT/DELETE endpoints**: 50 requests per 15 minutes (requires authentication)
