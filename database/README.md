# Database - One Piece API

## 📊 Structure

This database follows **Third Normal Form (3NF)** principles with proper indexing and optimization.

## 🗂️ Tables

### Catalog Tables (9 independent tables)
1. **races** - Character races (Human, Fishman, Mink, Giant, etc.)
2. **character_types** - Roles (Pirate, Marine, Captain, Yonko, etc.)
3. **devil_fruit_types** - Fruit categories (Paramecia, Zoan, Logia)
4. **organization_types** - Organization categories
5. **haki_types** - Haki types (Observation, Armament, Conqueror)
6. **ships** - Ships
7. **characters** - Main characters
8. **devil_fruits** - Devil fruits catalog
9. **organizations** - Crews, Marines, etc.

### Relationship Tables (4 many-to-many tables)
10. **character_devil_fruits** - Characters ↔ Devil fruits
11. **character_organizations** - Characters ↔ Organizations
12. **character_haki** - Characters ↔ Haki
13. **character_character_types** - Characters ↔ Types/Roles

## 🔑 Key Relationships

```
characters ─── character_devil_fruits ─── devil_fruits
characters ─── character_organizations ─── organizations
characters ─── character_haki ─── haki_types
characters ─── character_character_types ─── character_types

characters ─── races
devil_fruits ─── devil_fruit_types
organizations ─── organization_types
organizations ─── ships (optional)
organizations ─── characters (leader, optional)
```

## 🚀 Installation

### Option 1: Direct Import
```bash
mysql -u root -p < database/schema.sql
```

### Option 2: MySQL CLI
```bash
mysql -u root -p
source /path/to/database/schema.sql
```

### Option 3: Docker
```bash
docker exec -i mysql-container mysql -uroot -ppassword < database/schema.sql
```

## 📋 Sample Data Included

The script includes real One Piece data:

**Characters (21):** Luffy, Zoro, Nami, Usopp, Sanji, Chopper, Robin, Franky, Brook, Jinbe, Shanks, Blackbeard, Buggy, Ace, Sabo, Law, Kid, Kaido, Big Mom, Roger, Whitebeard

**Devil Fruits (16):** Gomu Gomu no Mi, Mera Mera no Mi, Ope Ope no Mi, Gura Gura no Mi, Bara Bara no Mi, and more...

**Organizations (10):** Straw Hat Pirates, Heart Pirates, Kid Pirates, Shanks Pirates, Blackbeard Pirates, Revolutionary Army, Marines, etc.

## 📊 Useful Views

### v_characters_complete
Complete character profile with all relationships:
```sql
SELECT * FROM v_characters_complete WHERE name LIKE '%Luffy%';
```

### v_organization_members
Organization members listing:
```sql
SELECT * FROM v_organization_members WHERE organization_name = 'Straw Hat Pirates';
```

### v_devil_fruit_users
Devil fruits and their users:
```sql
SELECT * FROM v_devil_fruit_users WHERE fruit_type = 'Logia';
```

### v_current_yonko
Current Four Emperors:
```sql
SELECT * FROM v_current_yonko;
-- Result: Luffy, Shanks, Blackbeard, Buggy
```

### v_haki_masters
Characters with Haki sorted by mastery:
```sql
SELECT * FROM v_haki_masters WHERE haki_type = 'Conqueror Haki';
```

## ⚡ Optimization

### Features
- **Indexes** on primary keys, foreign keys and frequently searched fields
- **No stored procedures or triggers** - Business logic is in the application layer (Express) for better:
  - Testability
  - Debugging
  - Maintainability
  - Version control
  - Portability

### Common Queries

**Straw Hat Pirates members:**
```sql
SELECT c.name, c.alias, c.bounty, co.role
FROM characters c
JOIN character_organizations co ON c.id = co.character_id
JOIN organizations o ON co.organization_id = o.id
WHERE o.name = 'Straw Hat Pirates' AND co.is_current = TRUE
ORDER BY c.bounty DESC;
```

**Logia devil fruit users:**
```sql
SELECT c.name, df.name AS fruit_name, df.abilities
FROM characters c
JOIN character_devil_fruits cdf ON c.id = cdf.character_id
JOIN devil_fruits df ON cdf.devil_fruit_id = df.id
JOIN devil_fruit_types dft ON df.type_id = dft.id
WHERE dft.name = 'Logia' AND cdf.is_current = TRUE;
```

**Top 10 highest bounties:**
```sql
SELECT name, alias, bounty, status
FROM characters
WHERE status = 'alive'
ORDER BY bounty DESC
LIMIT 10;
```

## 🔒 Data Integrity

### Constraints
- **PRIMARY KEY:** Unique identifier
- **FOREIGN KEY:** Referential integrity
- **UNIQUE:** Prevents duplicates
- **NOT NULL:** Required fields
- **ENUM:** Predefined values
- **ON DELETE CASCADE/SET NULL/RESTRICT:** Deletion handling

### Status Values
- **Character status:** `alive`, `deceased`, `unknown`
- **Organization status:** `active`, `disbanded`, `destroyed`
- **Ship status:** `active`, `destroyed`, `retired`
- **Haki mastery:** `basic`, `intermediate`, `advanced`, `master`

## 🎯 Design Principles

1. **Normalization (3NF)** - No transitive dependencies
2. **Performance** - Strategic indexing and views for complex queries
3. **Integrity** - Constraints and foreign keys
4. **Scalability** - INT UNSIGNED (4B+ records), BIGINT for bounties
5. **Flexibility** - Many-to-many relationships for complex associations

## 📝 Notes

- Automatic timestamps (created_at, updated_at)
- UTF8MB4 encoding (supports emojis)
- utf8mb4_unicode_ci collation (case-insensitive)
- InnoDB engine (transactions and foreign keys)
- **Current Yonko:** Monkey D. Luffy, Shanks, Marshall D. Teach (Blackbeard), Buggy

## 🔄 Future Enhancements (v2)

- Story arcs and sagas
- Locations and islands
- Abilities and techniques
- Character relationships (family, rivals, allies)
- Battles and events
- Treasures and items
- Bounty history tracking