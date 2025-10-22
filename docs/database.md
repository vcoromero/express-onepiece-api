# 🗄️ Database Schema

## Overview

The One Piece API uses a MySQL database with a well-structured schema that follows Third Normal Form (3NF) principles. The database is designed to handle complex relationships between One Piece universe entities.

## Database Structure

### Core Tables

#### Characters
- **Primary Key**: `id`
- **Fields**: `name`, `alias`, `bounty`, `status`, `race_id`
- **Relationships**: Many-to-many with organizations, devil fruits, haki types

#### Organizations
- **Primary Key**: `id`
- **Fields**: `name`, `type_id`, `status`, `leader_id`
- **Relationships**: One-to-many with ships, many-to-many with characters

#### Ships
- **Primary Key**: `id`
- **Fields**: `name`, `organization_id`, `status`
- **Relationships**: Belongs to organization

#### Devil Fruits
- **Primary Key**: `id`
- **Fields**: `name`, `type_id`, `abilities`, `rarity`
- **Relationships**: Many-to-many with characters

### Reference Tables

#### Races
- Human, Fishman, Mink, Giant, etc.

#### Character Types
- Pirate, Marine, Captain, Yonko, etc.

#### Organization Types
- Pirate Crew, Marine, Revolutionary Army, etc.

#### Haki Types
- Observation Haki, Armament Haki, Conqueror's Haki

#### Devil Fruit Types
- Paramecia, Zoan, Logia

### Relationship Tables

#### Character-Organization
- Links characters to organizations with roles
- Fields: `character_id`, `organization_id`, `role`, `is_current`

#### Character-Devil Fruit
- Links characters to devil fruits
- Fields: `character_id`, `devil_fruit_id`, `is_current`

#### Character-Haki
- Links characters to haki types with mastery level
- Fields: `character_id`, `haki_type_id`, `mastery_level`

## Database Views

### v_characters_complete
Complete character profiles with all relationships:
```sql
SELECT * FROM v_characters_complete WHERE name LIKE '%Luffy%';
```

### v_organization_members
Organization members with roles:
```sql
SELECT * FROM v_organization_members WHERE organization_name = 'Straw Hat Pirates';
```

### v_devil_fruit_users
Devil fruits and their users:
```sql
SELECT * FROM v_devil_fruit_users WHERE fruit_type = 'Logia';
```

## Setup Instructions

### 1. Create Database
```bash
mysql -u root -p -e "CREATE DATABASE onepiece_db;"
```

### 2. Execute Schema Files
```bash
# Execute files in order
for file in database/schemas/*.sql; do
  echo "Executing $file..."
  mysql -u root -p onepiece_db < "$file"
done
```

### 3. Verify Setup
```bash
mysql -u root -p -e "USE onepiece_db; SHOW TABLES;"
```

## Sample Data

The database includes comprehensive One Piece data:

- **21 Characters**: Luffy, Zoro, Nami, Sanji, etc.
- **16 Devil Fruits**: Gomu Gomu no Mi, Mera Mera no Mi, etc.
- **10 Organizations**: Straw Hat Pirates, Heart Pirates, etc.
- **Complex Relationships**: Character-organization, character-devil fruit, etc.

## Performance Optimization

### Indexes
- Primary keys on all tables
- Foreign key indexes
- Search indexes on frequently queried fields

### Query Optimization
- Strategic use of views for complex queries
- Proper JOIN optimization
- Pagination support for large datasets

## Environment Configuration

### Local Development
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=onepiece_db
DB_PORT=3306
```

### AWS Production
- **RDS MySQL**: Managed database service
- **Connection Pooling**: Optimized for Lambda
- **Backup**: Automated daily backups
- **Monitoring**: CloudWatch integration

## Troubleshooting

### Connection Issues
```bash
# Test MySQL connection
mysql -u root -p -h localhost

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Schema Issues
```bash
# Re-execute schema files
for file in database/schemas/*.sql; do
  mysql -u root -p onepiece_db < "$file"
done
```

### Performance Issues
```sql
-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'onepiece_db'
ORDER BY (data_length + index_length) DESC;
```
