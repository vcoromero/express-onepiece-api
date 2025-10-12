# One Piece API - Database Documentation

## 📊 Database Structure

This database is designed following **Third Normal Form (3NF)** principles with proper indexing and optimization for a One Piece themed API.

## 🗂️ Tables Overview

### Catalog Tables (9 tables)
These are independent reference tables:

1. **races** - Character races (Human, Fishman, Mink, Giant, etc.)
2. **character_types** - Character roles (Pirate, Marine, Captain, Yonko, etc.)
3. **devil_fruit_types** - Fruit categories (Paramecia, Zoan, Logia)
4. **organization_types** - Organization categories (Pirate Crew, Marine Division, etc.)
5. **haki_types** - Types of Haki (Observation, Armament, Conqueror)
6. **ships** - Ships used by crews
7. **characters** - Main characters table
8. **devil_fruits** - Devil fruits catalog
9. **organizations** - Pirate crews, Marines, Revolutionary Army, etc.

### Relationship Tables (4 tables)
Many-to-many relationships:

10. **character_devil_fruits** - Links characters with their devil fruits
11. **character_organizations** - Links characters with organizations (membership)
12. **character_haki** - Links characters with their Haki abilities
13. **character_character_types** - Links characters with their types/roles

## 🔑 Key Relationships

```
characters (1) ───── (N) character_devil_fruits (N) ───── (1) devil_fruits
characters (1) ───── (N) character_organizations (N) ───── (1) organizations
characters (1) ───── (N) character_haki (N) ───── (1) haki_types
characters (1) ───── (N) character_character_types (N) ───── (1) character_types

characters (N) ───── (1) races
devil_fruits (N) ───── (1) devil_fruit_types
organizations (N) ───── (1) organization_types
organizations (N) ───── (1) ships (optional)
organizations (N) ───── (1) characters (leader, optional)
```

## 🚀 Installation

### Option 1: Direct MySQL Import
```bash
mysql -u root -p < database/schema.sql
```

### Option 2: Using MySQL Command Line
```bash
mysql -u root -p
source /path/to/database/schema.sql
```

### Option 3: Using Docker
```bash
docker exec -i mysql-container mysql -uroot -ppassword < database/schema.sql
```

## 📋 Sample Data Included

The script includes real data from One Piece:

### Characters (21 characters)
- **Straw Hat Pirates**: Luffy, Zoro, Nami, Usopp, Sanji, Chopper, Robin, Franky, Brook, Jinbe
- **Current Yonko**: Luffy, Shanks, Blackbeard, Buggy
- **Other Major Characters**: Ace, Sabo, Law, Kid, Kaido (former Yonko), Big Mom (former Yonko), Roger, Whitebeard (deceased former Yonko)

### Devil Fruits (16 fruits)
- Gomu Gomu no Mi (Luffy's fruit - actually Hito Hito no Mi, Model: Nika)
- Mera Mera no Mi (Ace/Sabo's fire fruit)
- Ope Ope no Mi (Law's operation fruit)
- Gura Gura no Mi (Whitebeard/Blackbeard's quake fruit)
- Bara Bara no Mi (Buggy's chop-chop fruit)
- And more...

### Organizations (10 organizations)
- Straw Hat Pirates (Yonko Crew)
- Heart Pirates
- Kid Pirates
- Red Hair Pirates (Yonko Crew)
- Blackbeard Pirates (Yonko Crew)
- Buggy Pirates (Yonko Crew / Cross Guild)
- Whitebeard Pirates (Disbanded)
- Roger Pirates (Disbanded)
- Revolutionary Army
- Marines

## 📊 Database Views

### v_characters_complete
Complete character profile with all relationships in one query:
```sql
SELECT * FROM v_characters_complete WHERE name LIKE '%Luffy%';
```

### v_organization_members
List all members of organizations:
```sql
SELECT * FROM v_organization_members WHERE organization_name = 'Straw Hat Pirates';
```

### v_devil_fruit_users
Shows devil fruits and their users:
```sql
SELECT * FROM v_devil_fruit_users WHERE fruit_type = 'Logia';
```

### v_current_yonko
Shows the current Four Emperors:
```sql
SELECT * FROM v_current_yonko;
```

### v_haki_masters
Lists all characters with Haki abilities sorted by mastery level:
```sql
SELECT * FROM v_haki_masters WHERE haki_type = 'Conqueror Haki';
```

## ⚡ Optimization Features

### Indexes
- Primary keys on all tables (auto-indexed)
- Foreign key indexes for relationships
- Composite indexes for common queries
- Full-text indexes for search functionality

### No Stored Procedures or Triggers
**Design Decision**: Business logic is handled in the application layer (Express controllers/services) for better:
- **Testability**: Easier to write unit tests
- **Debugging**: Better error tracking and logging
- **Maintainability**: Version control with Git
- **Security**: Authentication/authorization before operations
- **Portability**: Not tied to MySQL-specific features

## 📈 Common Queries

### Get all Straw Hat Pirates members
```sql
SELECT c.name, c.alias, c.bounty, co.role
FROM characters c
JOIN character_organizations co ON c.id = co.character_id
JOIN organizations o ON co.organization_id = o.id
WHERE o.name = 'Straw Hat Pirates' AND co.is_current = TRUE
ORDER BY c.bounty DESC;
```

### Get all Logia devil fruit users
```sql
SELECT c.name, df.name AS fruit_name, df.abilities
FROM characters c
JOIN character_devil_fruits cdf ON c.id = cdf.character_id
JOIN devil_fruits df ON cdf.devil_fruit_id = df.id
JOIN devil_fruit_types dft ON df.type_id = dft.id
WHERE dft.name = 'Logia' AND cdf.is_current = TRUE;
```

### Get all characters with Conqueror's Haki
```sql
SELECT c.name, c.alias, ch.mastery_level, ch.awakened
FROM characters c
JOIN character_haki ch ON c.id = ch.character_id
JOIN haki_types ht ON ch.haki_type_id = ht.id
WHERE ht.name = "Conqueror Haki"
ORDER BY ch.mastery_level DESC;
```

### Get top 10 highest bounties
```sql
SELECT name, alias, bounty, status
FROM characters
WHERE status = 'alive'
ORDER BY bounty DESC
LIMIT 10;
```

### Get all current Yonko (Four Emperors)
```sql
-- Using the dedicated view (RECOMMENDED)
SELECT * FROM v_current_yonko;

-- Or using a custom query
SELECT c.name, c.alias, c.bounty, o.name AS crew
FROM characters c
JOIN character_character_types cct ON c.id = cct.character_id
JOIN character_types ct ON cct.character_type_id = ct.id
LEFT JOIN character_organizations co ON c.id = co.character_id AND co.is_current = TRUE
LEFT JOIN organizations o ON co.organization_id = o.id
WHERE ct.name = 'Yonko' AND cct.is_current = TRUE AND c.status = 'alive'
ORDER BY c.bounty DESC;

-- Result: Luffy, Shanks, Blackbeard, Buggy
```

## 🔒 Data Integrity Features

### Constraints
- **PRIMARY KEY**: Unique identifier for each record
- **FOREIGN KEY**: Maintains referential integrity
- **UNIQUE**: Prevents duplicate entries (e.g., devil fruit names)
- **NOT NULL**: Ensures required fields are populated
- **ENUM**: Restricts values to predefined options
- **ON DELETE CASCADE**: Auto-deletes related records
- **ON DELETE SET NULL**: Sets reference to NULL when parent deleted
- **ON DELETE RESTRICT**: Prevents deletion if references exist

### Character Status
- `alive`: Character is currently alive
- `deceased`: Character has died
- `unknown`: Status is unclear

### Organization Status
- `active`: Organization is currently operating
- `disbanded`: Organization has split up
- `destroyed`: Organization was destroyed

### Ship Status
- `active`: Ship is currently in use
- `destroyed`: Ship has been destroyed
- `retired`: Ship is no longer in active use

### Haki Mastery Levels
- `basic`: Just learned/awakened
- `intermediate`: Competent user
- `advanced`: Master-level usage with advanced techniques
- `master`: Peak mastery (Roger, Shanks level)

## 🎯 Database Design Principles Applied

1. **Normalization (3NF)**
   - No repeating groups
   - All non-key attributes depend on primary key
   - No transitive dependencies

2. **Performance Optimization**
   - Strategic indexing on frequently queried columns
   - Denormalization where appropriate (total_bounty in organizations)
   - Views for complex queries

3. **Data Integrity**
   - Foreign key constraints
   - Triggers for automatic updates
   - Enums for controlled values

4. **Scalability**
   - INT UNSIGNED for IDs (4 billion+ records possible)
   - BIGINT for bounties (large numbers)
   - TEXT for descriptions (unlimited length)

5. **Flexibility**
   - Many-to-many relationships for complex associations
   - Nullable foreign keys for optional relationships
   - JSON fields for arrays of data

## 📝 Notes

- All timestamps are automatically managed (created_at, updated_at)
- Character encoding is UTF8MB4 (supports emojis and special characters)
- Collation is utf8mb4_unicode_ci (case-insensitive, accent-sensitive)
- Engine is InnoDB (supports transactions and foreign keys)
- **No stored procedures or triggers**: All business logic is handled in the application layer (Express.js)
- **Current Yonko (as of latest data)**: Monkey D. Luffy, Shanks, Marshall D. Teach (Blackbeard), Buggy

## 🔄 Future Enhancements (Version 2)

Planned features for next version:
- Story arcs and saga tables
- Locations and islands
- Abilities and techniques (beyond Devil Fruits and Haki)
- Character relationships (family, rivals, allies)
- Battles and events
- Treasure and items
- Bounty history tracking

## 📞 Support

For issues or questions about the database structure, please refer to the main project README or create an issue in the repository.

