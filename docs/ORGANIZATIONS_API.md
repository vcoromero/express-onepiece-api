# Organizations API Documentation

This documentation describes the available endpoints for organization management in the One Piece API.

## Available Endpoints

### 1. Get All Organizations
**GET** `/api/organizations`

Gets a paginated list of all organizations with optional filters.

#### Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search term to filter by name
- `status` (optional): Filter by status (active, disbanded, destroyed)
- `organizationTypeId` (optional): Filter by organization type ID
- `sortBy` (optional): Sort field (name, totalBounty, status, createdAt)
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
      "name": "Straw Hat Pirates",
      "organizationTypeId": 1,
      "leaderId": 1,
      "shipId": 1,
      "flagDescription": "Jolly Roger with straw hat",
      "jollyRogerUrl": "https://example.com/flag.png",
      "baseLocation": "Grand Line",
      "totalBounty": 5000000000,
      "status": "active",
      "description": "The main crew of Monkey D. Luffy",
      "foundedDate": "1997-07-22",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "organizationType": {
        "id": 1,
        "name": "Pirate Crew"
      },
      "leader": {
        "id": 1,
        "name": "Monkey D. Luffy"
      },
      "ship": {
        "id": 1,
        "name": "Thousand Sunny"
      }
    }
  ]
}
```

### 2. Get Organization by ID
**GET** `/api/organizations/:id`

Gets a specific organization by ID with full details and relationships.

#### Parameters:
- `id`: Organization ID

#### Example Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Straw Hat Pirates",
    "organizationTypeId": 1,
    "leaderId": 1,
    "shipId": 1,
    "flagDescription": "Jolly Roger with straw hat",
    "jollyRogerUrl": "https://example.com/flag.png",
    "baseLocation": "Grand Line",
    "totalBounty": 5000000000,
    "status": "active",
    "description": "The main crew of Monkey D. Luffy",
    "foundedDate": "1997-07-22",
    "organizationType": {
      "id": 1,
      "name": "Pirate Crew"
    },
    "leader": {
      "id": 1,
      "name": "Monkey D. Luffy",
      "bounty": 3000000000
    },
    "ship": {
      "id": 1,
      "name": "Thousand Sunny",
      "status": "active"
    }
  }
}
```

### 3. Get Organizations by Type
**GET** `/api/organizations/type/:organizationTypeId`

Gets all organizations of a specific type.

#### Parameters:
- `organizationTypeId`: Organization type ID

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
      "name": "Straw Hat Pirates",
      "status": "active",
      "organizationType": {
        "id": 1,
        "name": "Pirate Crew"
      }
    }
  ]
}
```

### 4. Get Organization Members
**GET** `/api/organizations/:id/members`

Gets all members of a specific organization.

#### Parameters:
- `id`: Organization ID

#### Example Response:
```json
{
  "success": true,
  "data": {
    "organization": {
      "id": 1,
      "name": "Straw Hat Pirates"
    },
    "members": [
      {
        "id": 1,
        "name": "Monkey D. Luffy",
        "bounty": 3000000000,
        "character_type": {
          "id": 1,
          "name": "Pirate"
        }
      }
    ],
    "totalMembers": 1
  }
}
```

### 5. Create New Organization
**POST** `/api/organizations`

Creates a new organization. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Body (JSON):
```json
{
  "name": "Straw Hat Pirates",
  "organizationTypeId": 1,
  "leaderId": 1,
  "shipId": 1,
  "flagDescription": "Jolly Roger with straw hat",
  "jollyRogerUrl": "https://example.com/flag.png",
  "baseLocation": "Grand Line",
  "totalBounty": 5000000000,
  "status": "active",
  "description": "The main crew of Monkey D. Luffy",
  "foundedDate": "1997-07-22"
}
```

#### Required Fields:
- `name`: Organization name (max 100 characters)
- `organizationTypeId`: Organization type ID (must exist)

#### Optional Fields:
- `leaderId`: Leader character ID (must exist)
- `shipId`: Ship ID (must exist)
- `flagDescription`: Flag description
- `jollyRogerUrl`: Jolly Roger image URL
- `baseLocation`: Base location
- `totalBounty`: Total bounty in Berries (default: 0)
- `status`: Organization status (default: active)
- `description`: Organization description
- `foundedDate`: Founded date

### 6. Update Organization
**PUT** `/api/organizations/:id`

Updates an existing organization. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Organization ID to update

#### Body (JSON):
```json
{
  "name": "Updated Organization Name",
  "totalBounty": 6000000000,
  "status": "active"
}
```

All fields are optional. Only provided fields will be updated.

### 7. Delete Organization
**DELETE** `/api/organizations/:id`

Deletes an organization. Requires authentication.

#### Headers:
- `Authorization: Bearer <token>`

#### Parameters:
- `id`: Organization ID to delete

#### Example Response:
```json
{
  "success": true,
  "message": "Organization \"Straw Hat Pirates\" deleted successfully"
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
- Organization not found
- Organization type not found
- Leader character not found
- Ship not found

### 409 Conflict
- Organization name already exists
- Cannot delete organization with active members

### 500 Internal Server Error
- Internal server error

## Relationships

### Organization Relationships:
- **Organization ↔ Organization Type** (belongsTo)
- **Organization ↔ Character** (leader relationship)
- **Organization ↔ Ship** (belongsTo)
- **Organization ↔ Character** (members - many-to-many)

## Validations

### Organization Fields:
- `name`: Required, unique, max 100 characters
- `organizationTypeId`: Required, must exist in organization_types table
- `leaderId`: Optional, must exist in characters table
- `shipId`: Optional, must exist in ships table
- `flagDescription`: Optional, max 500 characters
- `jollyRogerUrl`: Optional, valid URL
- `baseLocation`: Optional, max 100 characters
- `totalBounty`: Optional, integer >= 0
- `status`: Required, enum (active, disbanded, destroyed)
- `description`: Optional, free text
- `foundedDate`: Optional, valid date

### Available Filters:
- Search by name (case-insensitive)
- Filter by status
- Filter by organization type
- Sort by multiple fields
- Pagination

## Rate Limiting

- **GET endpoints**: 100 requests per 15 minutes
- **POST/PUT/DELETE endpoints**: 50 requests per 15 minutes (requires authentication)
