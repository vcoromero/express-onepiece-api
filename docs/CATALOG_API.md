# Catalog API Documentation

This documentation describes the available endpoints for catalog data management (types, races, etc.) in the One Piece API.

## Available Endpoints

### Devil Fruit Types

#### Get All Devil Fruit Types
**GET** `/api/fruit-types`

Gets all devil fruit types.

#### Get Devil Fruit Type by ID
**GET** `/api/fruit-types/:id`

Gets a specific devil fruit type by ID.

#### Create Devil Fruit Type
**POST** `/api/fruit-types`

Creates a new devil fruit type. Requires authentication.

#### Update Devil Fruit Type
**PUT** `/api/fruit-types/:id`

Updates an existing devil fruit type. Requires authentication.

#### Delete Devil Fruit Type
**DELETE** `/api/fruit-types/:id`

Deletes a devil fruit type. Requires authentication.

### Haki Types

#### Get All Haki Types
**GET** `/api/haki-types`

Gets all haki types.

#### Get Haki Type by ID
**GET** `/api/haki-types/:id`

Gets a specific haki type by ID.

#### Update Haki Type
**PUT** `/api/haki-types/:id`

Updates an existing haki type. Requires authentication.

### Races

#### Get All Races
**GET** `/api/races`

Gets all races.

#### Get Race by ID
**GET** `/api/races/:id`

Gets a specific race by ID.

#### Update Race
**PUT** `/api/races/:id`

Updates an existing race. Requires authentication.

### Character Types

#### Get All Character Types
**GET** `/api/character-types`

Gets all character types.

#### Get Character Type by ID
**GET** `/api/character-types/:id`

Gets a specific character type by ID.

#### Update Character Type
**PUT** `/api/character-types/:id`

Updates an existing character type. Requires authentication.

### Organization Types

#### Get All Organization Types
**GET** `/api/organization-types`

Gets all organization types.

#### Get Organization Type by ID
**GET** `/api/organization-types/:id`

Gets a specific organization type by ID.

#### Update Organization Type
**PUT** `/api/organization-types/:id`

Updates an existing organization type. Requires authentication.

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Paramecia",
    "description": "Superhuman powers",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Response
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "name": "Paramecia",
      "description": "Superhuman powers"
    },
    {
      "id": 2,
      "name": "Zoan",
      "description": "Animal transformation"
    },
    {
      "id": 3,
      "name": "Logia",
      "description": "Elemental powers"
    }
  ]
}
```

## Error Codes

### 400 Bad Request
- Invalid validation parameters
- Missing required fields

### 401 Unauthorized
- Missing or invalid authentication token

### 404 Not Found
- Resource not found

### 409 Conflict
- Name already exists
- Cannot delete type with associated records

### 500 Internal Server Error
- Internal server error

## Validations

### Common Fields:
- `name`: Required, unique, max 100 characters
- `description`: Optional, free text

### Specific Validations:
- **Devil Fruit Types**: Cannot be deleted if has associated devil fruits
- **Character Types**: Cannot be deleted if has associated characters
- **Organization Types**: Cannot be deleted if has associated organizations
- **Races**: Cannot be deleted if has associated characters
- **Haki Types**: Cannot be deleted if has associated characters

## Rate Limiting

- **GET endpoints**: 100 requests per 15 minutes
- **POST/PUT/DELETE endpoints**: 50 requests per 15 minutes (requires authentication)

## Relationships

### Catalog Relationships:
- **Devil Fruit Type ↔ Devil Fruits** (hasMany)
- **Character Type ↔ Characters** (hasMany)
- **Organization Type ↔ Organizations** (hasMany)
- **Race ↔ Characters** (hasMany)
- **Haki Type ↔ Characters** (many-to-many)
