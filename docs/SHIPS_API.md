# Ships API Documentation

This documentation describes the available endpoints for ship management in the One Piece API.

## Available Endpoints

### 1. Get All Ships
**GET** `/api/ships`

Gets a paginated list of all ships with optional filters.

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term to filter by name
- `status` (optional): Filter by status (active, destroyed, retired)

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
      "name": "Thousand Sunny",
      "ship_type": "Caravel",
      "status": "active",
      "organization_id": 1,
      "description": "The ship of the Straw Hat Pirates",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "organization": {
        "id": 1,
        "name": "Straw Hat Pirates"
      }
    }
  ]
}
```

### 2. Get Ship by ID
**GET** `/api/ships/:id`

Gets a specific ship by ID with organization details.

#### Parameters:
- `id`: Ship ID

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Thousand Sunny",
    "ship_type": "Caravel",
    "status": "active",
    "organization_id": 1,
    "description": "The ship of the Straw Hat Pirates",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "organization": {
      "id": 1,
      "name": "Straw Hat Pirates",
      "status": "active"
    }
  }
}
```

### 3. Get Ships by Status
**GET** `/api/ships/status/:status`

Gets all ships with a specific status.

#### Parameters:
- `status`: Ship status (active, destroyed, retired)

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

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
      "name": "Thousand Sunny",
      "status": "active",
      "organization": {
        "id": 1,
        "name": "Straw Hat Pirates"
      }
    }
  ]
}
```

### 4. Create New Ship
**POST** `/api/ships`

Creates a new ship. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Body (JSON):
```json
{
  "name": "Thousand Sunny",
  "ship_type": "Caravel",
  "status": "active",
  "organization_id": 1,
  "description": "The ship of the Straw Hat Pirates"
}
```

#### Required Fields:
- `name`: Ship name (max 100 characters)
- `ship_type`: Type of ship (max 50 characters)
- `status`: Ship status (active, destroyed, retired)

#### Optional Fields:
- `organization_id`: Organization ID (must exist)
- `description`: Ship description

### 5. Update Ship
**PUT** `/api/ships/:id`

Updates an existing ship. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Ship ID to update

#### Body (JSON):
```json
{
  "name": "Updated Ship Name",
  "status": "retired"
}
```

All fields are optional. Only provided fields will be updated.

### 6. Delete Ship
**DELETE** `/api/ships/:id`

Deletes a ship. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Ship ID to delete

#### Example Response:
```json
{
  "success": true,
  "message": "Ship \"Thousand Sunny\" deleted successfully"
}
```

## Error Codes

### 400 Bad Request
- Invalid validation parameters
- Missing required fields
- Invalid status value

### 401 Unauthorized
- Missing or invalid authentication token

### 404 Not Found
- Ship not found
- Organization not found

### 409 Conflict
- Ship name already exists

### 500 Internal Server Error
- Internal server error

## Relationships

### Ship Relationships:
- **Ship ↔ Organization** (belongsTo)

## Validations

### Ship Fields:
- `name`: Required, unique, max 100 characters
- `ship_type`: Required, max 50 characters
- `status`: Required, enum (active, destroyed, retired)
- `organization_id`: Optional, must exist in organizations table
- `description`: Optional, free text

### Available Filters:
- Search by name (case-insensitive)
- Filter by status
- Sort by multiple fields
- Pagination

## Rate Limiting

- **GET endpoints**: 100 requests per 15 minutes
- **POST/PUT/DELETE endpoints**: 50 requests per 15 minutes (requires authentication)
