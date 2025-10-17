-- ============================================
-- ONE PIECE API - DATABASE CREATION
-- ============================================
-- Author: Database Expert
-- Description: Create database and basic tables
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS onepiece_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE onepiece_db;

-- ============================================
-- DROP TABLES (in correct order to respect FK)
-- ============================================
DROP TABLE IF EXISTS character_character_types;
DROP TABLE IF EXISTS character_haki;
DROP TABLE IF EXISTS character_organizations;
DROP TABLE IF EXISTS character_devil_fruits;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS devil_fruits;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS ships;
DROP TABLE IF EXISTS haki_types;
DROP TABLE IF EXISTS organization_types;
DROP TABLE IF EXISTS devil_fruit_types;
DROP TABLE IF EXISTS character_types;
DROP TABLE IF EXISTS races;

-- ============================================
-- CATALOG TABLES (Independent tables)
-- ============================================

-- Races Table
CREATE TABLE races (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Catalog of races in One Piece universe';

-- Character Types Table
CREATE TABLE character_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types/roles of characters (Pirate, Marine, Captain, etc.)';

-- Devil Fruit Types Table
CREATE TABLE devil_fruit_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types of Devil Fruits (Paramecia, Zoan, Logia)';

-- Organization Types Table
CREATE TABLE organization_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types of organizations (Pirate Crew, Marine, Revolutionary Army, etc.)';

-- Haki Types Table
CREATE TABLE haki_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Types of Haki (Observation, Armament, Conqueror)';

-- Ships Table
CREATE TABLE ships (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'destroyed', 'retired') DEFAULT 'active',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ships used by crews and organizations';

-- ============================================
-- MAIN TABLES (With foreign keys)
-- ============================================

-- Characters Table
CREATE TABLE characters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    alias VARCHAR(100),
    age INT UNSIGNED,
    birthday VARCHAR(20),
    height VARCHAR(20),
    bounty BIGINT UNSIGNED DEFAULT 0 COMMENT 'Bounty in Berries',
    race_id INT UNSIGNED NOT NULL,
    origin VARCHAR(100),
    status ENUM('alive', 'deceased', 'unknown') DEFAULT 'alive',
    description TEXT,
    image_url VARCHAR(255),
    debut VARCHAR(100) COMMENT 'First appearance (chapter/episode)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_alias (alias),
    INDEX idx_bounty (bounty),
    INDEX idx_status (status),
    INDEX idx_race (race_id),
    FULLTEXT idx_fulltext_search (name, alias, origin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Main characters table with personal information';

-- Devil Fruits Table
CREATE TABLE devil_fruits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    japanese_name VARCHAR(100),
    type_id INT UNSIGNED NOT NULL,
    description TEXT,
    abilities TEXT,
    weaknesses TEXT,
    awakening_description TEXT,
    current_user_id INT UNSIGNED,
    previous_users JSON COMMENT 'Array of previous user IDs',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_type (type_id),
    INDEX idx_current_user (current_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Devil Fruits catalog with abilities and users';

-- Organizations Table
CREATE TABLE organizations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    organization_type_id INT UNSIGNED NOT NULL,
    leader_id INT UNSIGNED,
    ship_id INT UNSIGNED,
    flag_description TEXT,
    jolly_roger_url VARCHAR(255),
    base_location VARCHAR(100),
    total_bounty BIGINT UNSIGNED DEFAULT 0 COMMENT 'Total bounty of all members',
    status ENUM('active', 'disbanded', 'destroyed') DEFAULT 'active',
    description TEXT,
    founded_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_type (organization_type_id),
    INDEX idx_leader (leader_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Organizations including pirate crews, marines, revolutionary army';

-- ============================================
-- RELATIONSHIP TABLES (Many to Many)
-- ============================================

-- Character Devil Fruits Relationship
CREATE TABLE character_devil_fruits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    devil_fruit_id INT UNSIGNED NOT NULL,
    acquired_date VARCHAR(50),
    is_current BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_character_fruit (character_id, devil_fruit_id),
    INDEX idx_character (character_id),
    INDEX idx_fruit (devil_fruit_id),
    INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relationship between characters and devil fruits';

-- Character Organizations Relationship (Membership)
CREATE TABLE character_organizations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    organization_id INT UNSIGNED NOT NULL,
    role VARCHAR(100) COMMENT 'Role in organization (Captain, First Mate, etc.)',
    joined_date VARCHAR(50),
    left_date VARCHAR(50),
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_character_organization (character_id, organization_id),
    INDEX idx_character (character_id),
    INDEX idx_organization (organization_id),
    INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Membership relationship between characters and organizations';

-- Character Haki Relationship
CREATE TABLE character_haki (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    haki_type_id INT UNSIGNED NOT NULL,
    mastery_level ENUM('basic', 'intermediate', 'advanced', 'master') DEFAULT 'basic',
    awakened BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_character_haki (character_id, haki_type_id),
    INDEX idx_character (character_id),
    INDEX idx_haki_type (haki_type_id),
    INDEX idx_mastery (mastery_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relationship between characters and their Haki abilities';

-- Character Character Types Relationship
CREATE TABLE character_character_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    character_id INT UNSIGNED NOT NULL,
    character_type_id INT UNSIGNED NOT NULL,
    acquired_date VARCHAR(50),
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_character_type (character_id, character_type_id),
    INDEX idx_character (character_id),
    INDEX idx_type (character_type_id),
    INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relationship between characters and their types/roles';

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Database and tables created successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Total tables created: 13' AS info;
SELECT 'Ready for relationships and data insertion' AS status;
SELECT '============================================' AS '';
