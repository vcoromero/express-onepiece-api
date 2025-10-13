# Devil Fruits API Documentation

Esta documentación describe los endpoints disponibles para la gestión de Devil Fruits en la API de One Piece.

## Endpoints Disponibles

### 1. Obtener todas las Devil Fruits
**GET** `/api/devil-fruits`

Obtiene una lista paginada de todas las devil fruits con filtros opcionales.

#### Parámetros de Query:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Término de búsqueda para filtrar por nombre
- `type_id` (opcional): ID del tipo de devil fruit para filtrar
- `rarity` (opcional): Rarity para filtrar (common, rare, legendary, mythical)
- `sortBy` (opcional): Campo para ordenar (id, name, rarity, power_level, created_at)
- `sortOrder` (opcional): Orden (ASC, DESC)

#### Ejemplo de Respuesta:
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

### 2. Obtener Devil Fruit por ID
**GET** `/api/devil-fruits/:id`

Obtiene una devil fruit específica por su ID.

#### Parámetros:
- `id`: ID de la devil fruit

#### Ejemplo de Respuesta:
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

### 3. Crear Nueva Devil Fruit
**POST** `/api/devil-fruits`

Crea una nueva devil fruit. Requiere autenticación.

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

#### Campos Requeridos:
- `name`: Nombre de la devil fruit (máximo 100 caracteres)
- `type_id`: ID del tipo de devil fruit (debe existir)

#### Campos Opcionales:
- `description`: Descripción de la devil fruit
- `abilities`: Habilidades especiales
- `current_user`: Usuario actual de la devil fruit
- `previous_users`: Usuarios anteriores (JSON string)
- `rarity`: Rarity (common, rare, legendary, mythical) - default: common
- `power_level`: Nivel de poder (1-100)
- `is_awakened`: Si está despertada (boolean) - default: false

#### Ejemplo de Respuesta:
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

### 4. Actualizar Devil Fruit
**PUT** `/api/devil-fruits/:id`

Actualiza una devil fruit existente. Requiere autenticación.

#### Headers:
- `Authorization: Bearer <token>`

#### Parámetros:
- `id`: ID de la devil fruit a actualizar

#### Body (JSON):
```json
{
  "name": "Updated Name",
  "power_level": 80,
  "is_awakened": true
}
```

Todos los campos son opcionales. Solo se actualizarán los campos proporcionados.

#### Ejemplo de Respuesta:
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

### 5. Eliminar Devil Fruit
**DELETE** `/api/devil-fruits/:id`

Elimina una devil fruit. Requiere autenticación.

#### Headers:
- `Authorization: Bearer <token>`

#### Parámetros:
- `id`: ID de la devil fruit a eliminar

#### Ejemplo de Respuesta:
```json
{
  "success": true,
  "message": "Devil fruit \"Gomu Gomu no Mi\" deleted successfully"
}
```

### 6. Obtener Devil Fruits por Tipo
**GET** `/api/devil-fruits/type/:typeId`

Obtiene todas las devil fruits de un tipo específico.

#### Parámetros:
- `typeId`: ID del tipo de devil fruit

#### Parámetros de Query:
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `sortBy` (opcional): Campo para ordenar (id, name, rarity, power_level, created_at)
- `sortOrder` (opcional): Orden (ASC, DESC)

#### Ejemplo de Respuesta:
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

## Códigos de Error

### 400 Bad Request
- Parámetros de validación incorrectos
- Campos requeridos faltantes
- Valores fuera de rango

### 401 Unauthorized
- Token de autenticación faltante o inválido

### 404 Not Found
- Devil fruit no encontrada
- Tipo de devil fruit no encontrado

### 409 Conflict
- Nombre de devil fruit ya existe
- Tipo de devil fruit tiene devil fruits asociadas

### 500 Internal Server Error
- Error interno del servidor

## Relaciones

### Devil Fruit ↔ Devil Fruit Type
- Una Devil Fruit pertenece a un Devil Fruit Type
- Un Devil Fruit Type puede tener muchas Devil Fruits
- Relación: `belongsTo` / `hasMany`

## Validaciones

### Campos de Devil Fruit:
- `name`: Requerido, único, máximo 100 caracteres
- `type_id`: Requerido, debe existir en devil_fruit_types
- `description`: Opcional, texto libre
- `abilities`: Opcional, texto libre
- `current_user`: Opcional, máximo 100 caracteres
- `previous_users`: Opcional, JSON string válido
- `rarity`: Enum (common, rare, legendary, mythical)
- `power_level`: Entero entre 1 y 100
- `is_awakened`: Boolean

### Filtros Disponibles:
- Búsqueda por nombre (case-insensitive)
- Filtro por tipo de devil fruit
- Filtro por rarity
- Ordenamiento por múltiples campos
- Paginación

## Rate Limiting

- **GET endpoints**: 100 requests por 15 minutos
- **POST/PUT/DELETE endpoints**: 50 requests por 15 minutos (requieren autenticación)
