-- ============================================
-- ONE PIECE API - DATABASE SCHEMA
-- ============================================
-- Author: Database Expert
-- Description: Complete database schema for One Piece API
-- Features: Characters, Devil Fruits, Organizations, Ships, Haki, Races
-- Normalization: 3NF
-- Note: No stored procedures or triggers - Business logic handled in application layer
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
    
    CONSTRAINT fk_character_race FOREIGN KEY (race_id) 
        REFERENCES races(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_devil_fruit_type FOREIGN KEY (type_id) 
        REFERENCES devil_fruit_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_devil_fruit_current_user FOREIGN KEY (current_user_id) 
        REFERENCES characters(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_organization_type FOREIGN KEY (organization_type_id) 
        REFERENCES organization_types(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_organization_leader FOREIGN KEY (leader_id) 
        REFERENCES characters(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_organization_ship FOREIGN KEY (ship_id) 
        REFERENCES ships(id) ON DELETE SET NULL ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_char_df_character FOREIGN KEY (character_id) 
        REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_char_df_fruit FOREIGN KEY (devil_fruit_id) 
        REFERENCES devil_fruits(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_char_org_character FOREIGN KEY (character_id) 
        REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_char_org_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_char_haki_character FOREIGN KEY (character_id) 
        REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_char_haki_type FOREIGN KEY (haki_type_id) 
        REFERENCES haki_types(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
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
    
    CONSTRAINT fk_char_type_character FOREIGN KEY (character_id) 
        REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_char_type_type FOREIGN KEY (character_type_id) 
        REFERENCES character_types(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY uk_character_type (character_id, character_type_id),
    INDEX idx_character (character_id),
    INDEX idx_type (character_type_id),
    INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relationship between characters and their types/roles';

-- ============================================
-- SEED DATA - CATALOG TABLES
-- ============================================

-- Insert Races
INSERT INTO races (name, description) VALUES
('Human', 'Regular humans, the most common race in One Piece'),
('Fishman', 'Fish-human hybrids with superior strength underwater'),
('Mink', 'Animal-human hybrids from Zou with electro abilities'),
('Giant', 'Enormous humanoids with incredible strength'),
('Dwarf', 'Tiny people with superhuman speed from Tontatta Kingdom'),
('Long-Arm Tribe', 'Humans with extra-long arms with additional joints'),
('Long-Leg Tribe', 'Humans with extremely long legs'),
('Three-Eye Tribe', 'Humans with a third eye capable of hearing Voice of All Things'),
('Cyborg', 'Humans modified with mechanical parts'),
('Skeleton', 'Undead brought back by Devil Fruit power'),
('Lunarian', 'Ancient race with wings and ability to create fire'),
('Demon', 'Otherworldly beings with supernatural powers');

-- Insert Character Types
INSERT INTO character_types (name, description) VALUES
('Pirate', 'Someone who sails under a pirate flag'),
('Captain', 'Leader of a pirate crew or ship'),
('Marine', 'Member of the World Government military'),
('Admiral', 'Highest rank in Marine forces'),
('Vice Admiral', 'Second highest Marine rank'),
('Yonko', 'One of the Four Emperors ruling the New World'),
('Shichibukai', 'Seven Warlords of the Sea (former system)'),
('Supernova', 'Rookie pirate with bounty over 100 million'),
('Revolutionary', 'Member of Revolutionary Army'),
('Bounty Hunter', 'One who hunts pirates for their bounties'),
('Scientist', 'Expert in various scientific fields'),
('Doctor', 'Medical professional'),
('Navigator', 'Expert in navigation and weather'),
('Swordsman', 'Master of sword techniques'),
('Sniper', 'Expert marksman'),
('Cook', 'Professional chef'),
('Archaeologist', 'Expert in ancient history'),
('Shipwright', 'Ship builder and carpenter'),
('Musician', 'Professional music performer'),
('Helmsman', 'Expert ship pilot'),
('Civilian', 'Regular citizen not affiliated with pirates or marines');

-- Insert Devil Fruit Types
INSERT INTO devil_fruit_types (name, description) VALUES
('Paramecia', 'Grants superhuman abilities, most common type'),
('Zoan', 'Allows transformation into animals or hybrid forms'),
('Logia', 'Grants power to transform into natural elements');

-- Insert Organization Types
INSERT INTO organization_types (name, description) VALUES
('Pirate Crew', 'Group of pirates sailing together under one flag'),
('Marine Division', 'Military unit of World Government Marines'),
('Revolutionary Army', 'Organization opposing the World Government'),
('Cipher Pol', 'Secret intelligence agency of World Government'),
('Yonko Crew', 'Crew led by one of the Four Emperors'),
('Grand Fleet', 'Alliance of multiple pirate crews'),
('Kingdom', 'Sovereign nation or territory'),
('Criminal Organization', 'Underground criminal syndicate');

-- Insert Haki Types
INSERT INTO haki_types (name, description, color) VALUES
('Observation Haki', 'Allows user to sense presence and emotions of others, predict movements', 'Red'),
('Armament Haki', 'Allows user to use spiritual armor for offense and defense, can touch Logia users', 'Black'),
('Conqueror Haki', 'Rare Haki that allows user to exert willpower over others, knock out weak-willed', 'Dark Red/Black');

-- Insert Ships
INSERT INTO ships (name, description, status) VALUES
('Thousand Sunny', 'The second ship of the Straw Hat Pirates, built by Franky using Adam Wood', 'active'),
('Going Merry', 'The first ship of the Straw Hat Pirates, a caravel gifted by Kaya', 'destroyed'),
('Moby Dick', 'Flagship of the Whitebeard Pirates, a massive whale-shaped vessel', 'destroyed'),
('Oro Jackson', 'Ship of the Roger Pirates, built by Tom', 'retired'),
('Red Force', 'Flagship of the Red Hair Pirates', 'active'),
('Queen Mama Chanter', 'Main ship of the Big Mom Pirates', 'active'),
('Numancia Flamingo', 'Former ship of the Donquixote Pirates', 'retired'),
('Polar Tang', 'Submarine of the Heart Pirates', 'active'),
('Victoria Punk', 'Ship of the Kid Pirates', 'active'),
('Perfumer', 'Ship of the Drake Pirates', 'active');

-- ============================================
-- SEED DATA - MAIN TABLES
-- ============================================

-- Insert Characters
INSERT INTO characters (name, alias, age, birthday, height, bounty, race_id, origin, status, description, debut) VALUES
-- Straw Hat Pirates
('Monkey D. Luffy', 'Straw Hat Luffy', 19, 'May 5', '174 cm', 3000000000, 1, 'East Blue - Foosha Village', 'alive', 'Captain of the Straw Hat Pirates, one of the Four Emperors, dreams of becoming Pirate King', 'Chapter 1'),
('Roronoa Zoro', 'Pirate Hunter Zoro', 21, 'November 11', '181 cm', 1111000000, 1, 'East Blue - Shimotsuki Village', 'alive', 'Swordsman of the Straw Hats, aims to become the greatest swordsman', 'Chapter 3'),
('Nami', 'Cat Burglar Nami', 20, 'July 3', '170 cm', 366000000, 1, 'East Blue - Cocoyasi Village', 'alive', 'Navigator of the Straw Hats, dreams of mapping the world', 'Chapter 8'),
('Usopp', 'God Usopp', 19, 'April 1', '176 cm', 500000000, 1, 'East Blue - Syrup Village', 'alive', 'Sniper of the Straw Hats, dreams of becoming a brave warrior of the sea', 'Chapter 23'),
('Sanji', 'Black Leg Sanji', 21, 'March 2', '180 cm', 1032000000, 1, 'North Blue - Germa Kingdom', 'alive', 'Cook of the Straw Hats, seeks the All Blue', 'Chapter 43'),
('Tony Tony Chopper', 'Cotton Candy Lover Chopper', 17, 'December 24', '90 cm', 1000, 6, 'Drum Island', 'alive', 'Doctor of the Straw Hats, reindeer who ate Hito Hito no Mi', 'Chapter 134'),
('Nico Robin', 'Devil Child Robin', 30, 'February 6', '188 cm', 930000000, 1, 'West Blue - Ohara', 'alive', 'Archaeologist of the Straw Hats, seeks the true history', 'Chapter 114'),
('Franky', 'Cyborg Franky', 36, 'March 9', '240 cm', 394000000, 9, 'South Blue - Water 7', 'alive', 'Shipwright of the Straw Hats, built Thousand Sunny', 'Chapter 329'),
('Brook', 'Soul King Brook', 90, 'April 3', '277 cm', 383000000, 10, 'West Blue', 'alive', 'Musician of the Straw Hats, skeleton brought back by Yomi Yomi no Mi', 'Chapter 442'),
('Jinbe', 'Knight of the Sea Jinbe', 46, 'April 2', '301 cm', 1100000000, 2, 'Fish-Man Island', 'alive', 'Helmsman of the Straw Hats, former Shichibukai and whale shark fishman', 'Chapter 528'),

-- Other Major Characters
('Portgas D. Ace', 'Fire Fist Ace', 20, 'January 1', '185 cm', 550000000, 1, 'South Blue - Baterilla', 'deceased', 'Former 2nd Division Commander of Whitebeard Pirates, Luffy\'s brother', 'Chapter 154'),
('Sabo', 'The Flame Emperor', 22, 'March 20', '187 cm', 602000000, 1, 'East Blue - Goa Kingdom', 'alive', 'Chief of Staff of Revolutionary Army, Luffy\'s brother', 'Chapter 583'),
('Trafalgar D. Water Law', 'Surgeon of Death', 26, 'October 6', '191 cm', 3000000000, 1, 'North Blue - Flevance', 'alive', 'Captain of Heart Pirates, member of Worst Generation', 'Chapter 498'),
('Eustass Kid', 'Captain Kid', 23, 'January 10', '205 cm', 3000000000, 1, 'South Blue', 'alive', 'Captain of Kid Pirates, member of Worst Generation', 'Chapter 498'),
('Shanks', 'Red Hair Shanks', 39, 'March 9', '199 cm', 4048900000, 1, 'West Blue', 'alive', 'Captain of Red Hair Pirates, one of the Four Emperors', 'Chapter 1'),
('Marshall D. Teach', 'Blackbeard', 40, 'August 3', '344 cm', 3996000000, 1, 'Unknown', 'alive', 'Captain of Blackbeard Pirates, one of the Four Emperors', 'Chapter 234'),
('Kaido', 'Kaido of the Beasts', 59, 'May 1', '710 cm', 4611100000, 1, 'Unknown', 'alive', 'Former Emperor, known as strongest creature in the world, defeated in Wano', 'Chapter 795'),
('Charlotte Linlin', 'Big Mom', 68, 'February 15', '880 cm', 4388000000, 1, 'Unknown', 'alive', 'Former Emperor, captain of Big Mom Pirates, defeated in Wano', 'Chapter 651'),
('Gol D. Roger', 'Gold Roger, Pirate King', 53, 'December 31', '274 cm', 5564800000, 1, 'East Blue - Loguetown', 'deceased', 'Former Pirate King, started the Great Pirate Era', 'Chapter 1'),
('Edward Newgate', 'Whitebeard', 72, 'April 6', '666 cm', 5046000000, 1, 'Sphinx', 'deceased', 'Former Emperor, known as strongest man in the world, died at Marineford', 'Chapter 234'),
('Buggy', 'Buggy the Clown', 39, 'August 8', '192 cm', 3189000000, 1, 'Unknown', 'alive', 'Captain of Buggy Pirates, one of the Four Emperors, founder of Cross Guild', 'Chapter 9'),
('X Drake', 'Red Flag X Drake', 33, 'October 11', '233 cm', 222000000, 1, 'North Blue', 'alive', 'Former Marine Rear Admiral turned pirate, captain of Drake Pirates', 'Chapter 498');

-- Insert Devil Fruits
INSERT INTO devil_fruits (name, japanese_name, type_id, description, abilities, current_user_id) VALUES
('Gomu Gomu no Mi', 'ゴムゴムの実', 1, 'Rubber-Rubber Fruit, actually the Hito Hito no Mi, Model: Nika', 'Grants user rubber body, immunity to electricity, awakens as Sun God Nika', 1),
('Hana Hana no Mi', '花花の実', 1, 'Flower-Flower Fruit', 'Allows user to sprout body parts anywhere', 7),
('Yomi Yomi no Mi', 'ヨミヨミの実', 1, 'Revive-Revive Fruit', 'Grants user a second life, soul can leave body', 9),
('Ope Ope no Mi', 'オペオペの実', 1, 'Op-Op Fruit', 'Allows user to create a spherical territory and manipulate everything inside', 13),
('Mera Mera no Mi', 'メラメラの実', 3, 'Flame-Flame Fruit', 'Allows user to create, control, and become fire', 12),
('Gura Gura no Mi', 'グラグラの実', 1, 'Tremor-Tremor Fruit', 'Allows user to create quakes and shockwaves', 16),
('Yami Yami no Mi', 'ヤミヤミの実', 3, 'Dark-Dark Fruit', 'Allows user to create, control, and become darkness, nullify devil fruits', 16),
('Uo Uo no Mi, Model: Seiryu', '魚魚の実 モデル：青龍', 2, 'Fish-Fish Fruit, Model: Azure Dragon', 'Allows user to transform into an Azure Dragon', 17),
('Soru Soru no Mi', 'ソルソルの実', 1, 'Soul-Soul Fruit', 'Allows user to manipulate souls and give life to objects', 18),
('Hito Hito no Mi', 'ヒトヒトの実', 2, 'Human-Human Fruit', 'Allows animal to gain human intelligence and form', 6),
('Bara Bara no Mi', 'バラバラの実', 1, 'Chop-Chop Fruit', 'Allows user to split body into pieces and control them independently', 21),
('Magu Magu no Mi', 'マグマグの実', 3, 'Magma-Magma Fruit', 'Allows user to create, control, and become magma', NULL),
('Pika Pika no Mi', 'ピカピカの実', 3, 'Glint-Glint Fruit', 'Allows user to create, control, and become light', NULL),
('Hie Hie no Mi', 'ヒエヒエの実', 3, 'Ice-Ice Fruit', 'Allows user to create, control, and become ice', NULL),
('Goro Goro no Mi', 'ゴロゴロの実', 3, 'Rumble-Rumble Fruit', 'Allows user to create, control, and become electricity', NULL),
('Mochi Mochi no Mi', 'モチモチの実', 1, 'Mochi-Mochi Fruit', 'Allows user to create, control, and become mochi', NULL);

-- Insert Organizations
INSERT INTO organizations (name, organization_type_id, leader_id, ship_id, base_location, total_bounty, status, description) VALUES
('Straw Hat Pirates', 5, 1, 1, 'Thousand Sunny (Mobile)', 8816000000, 'active', 'Yonko crew led by Monkey D. Luffy, aiming for One Piece'),
('Heart Pirates', 1, 13, 8, 'Polar Tang (Mobile)', 3000000000, 'active', 'Pirate crew led by Trafalgar Law, allied with Straw Hats'),
('Kid Pirates', 1, 14, 9, 'Victoria Punk (Mobile)', 3000000000, 'active', 'Pirate crew led by Eustass Kid, member of Worst Generation'),
('Red Hair Pirates', 5, 15, 5, 'Unknown', 4048900000, 'active', 'Yonko crew led by Shanks, one of the Four Emperors'),
('Blackbeard Pirates', 5, 16, NULL, 'Pirate Island - Hachinosu', 3996000000, 'active', 'Yonko crew led by Marshall D. Teach, one of the Four Emperors'),
('Buggy Pirates', 5, 21, NULL, 'Karai Bari Island', 3189000000, 'active', 'Yonko crew led by Buggy, founder of Cross Guild'),
('Whitebeard Pirates', 5, 20, 3, 'Moby Dick', 5046000000, 'disbanded', 'Former Yonko crew led by Edward Newgate, disbanded after Marineford War'),
('Roger Pirates', 1, 19, 4, NULL, 5564800000, 'disbanded', 'Legendary crew led by Gol D. Roger, conquered Grand Line'),
('Revolutionary Army', 3, NULL, NULL, 'Kamabakka Kingdom', 602000000, 'active', 'Organization led by Monkey D. Dragon, opposing World Government'),
('Marines', 2, NULL, NULL, 'Marineford', 0, 'active', 'Military force of the World Government'),
('Big Mom Pirates', 5, 18, 6, 'Whole Cake Island', 4388000000, 'active', 'Former Yonko crew led by Charlotte Linlin, defeated in Wano'),
('Drake Pirates', 1, 22, 10, 'Perfumer (Mobile)', 222000000, 'active', 'Pirate crew led by X Drake, former Marine');

-- ============================================
-- SEED DATA - RELATIONSHIP TABLES
-- ============================================

-- Insert Character Devil Fruits
INSERT INTO character_devil_fruits (character_id, devil_fruit_id, is_current, acquired_date) VALUES
(1, 1, TRUE, 'Age 7'),
(7, 2, TRUE, 'Age 8'),
(9, 3, TRUE, 'Age 38'),
(13, 4, TRUE, 'Age 13'),
(12, 5, TRUE, 'Age 20'),
(6, 10, TRUE, 'Age 15'),
(17, 8, TRUE, 'Unknown'),
(18, 9, TRUE, 'Age 28'),
(21, 11, TRUE, 'Unknown'),
(16, 6, TRUE, 'Marineford War'),
(16, 7, TRUE, 'After Marineford War');

-- Insert Character Organizations (Straw Hat Pirates and others)
INSERT INTO character_organizations (character_id, organization_id, role, is_current, joined_date) VALUES
-- Straw Hat Pirates
(1, 1, 'Captain', TRUE, 'Start of Journey'),
(2, 1, 'Swordsman / First Mate', TRUE, 'East Blue'),
(3, 1, 'Navigator', TRUE, 'East Blue - Arlong Park'),
(4, 1, 'Sniper', TRUE, 'East Blue - Syrup Village'),
(5, 1, 'Cook', TRUE, 'East Blue - Baratie'),
(6, 1, 'Doctor', TRUE, 'Drum Island'),
(7, 1, 'Archaeologist', TRUE, 'Alabasta'),
(8, 1, 'Shipwright', TRUE, 'Water 7'),
(9, 1, 'Musician', TRUE, 'Thriller Bark'),
(10, 1, 'Helmsman', TRUE, 'Whole Cake Island'),
-- Other Organizations
(13, 2, 'Captain', TRUE, 'Formation'),
(14, 3, 'Captain', TRUE, 'Formation'),
(15, 4, 'Captain', TRUE, 'Formation'),
(16, 5, 'Captain / Admiral', TRUE, 'Formation'),
(21, 6, 'Captain', TRUE, 'Formation'),
(11, 7, '2nd Division Commander', FALSE, 'Joined Whitebeard'),
(20, 7, 'Captain', FALSE, 'Founded'),
(19, 8, 'Captain', FALSE, 'Founded'),
(12, 1, 'Temporary Member', FALSE, 'Alabasta Arc'),
(12, 7, '2nd Division Commander', FALSE, 'After leaving Straw Hats'),
-- Big Mom Pirates
(18, 11, 'Captain', TRUE, 'Founded'),
-- Drake Pirates
(22, 12, 'Captain', TRUE, 'Founded');

-- Insert Character Haki
INSERT INTO character_haki (character_id, haki_type_id, mastery_level, awakened) VALUES
-- Luffy
(1, 1, 'advanced', TRUE),
(1, 2, 'advanced', TRUE),
(1, 3, 'advanced', TRUE),
-- Zoro
(2, 1, 'intermediate', FALSE),
(2, 2, 'advanced', FALSE),
(2, 3, 'basic', FALSE),
-- Sanji
(5, 1, 'intermediate', FALSE),
(5, 2, 'intermediate', FALSE),
-- Jinbe
(10, 1, 'advanced', FALSE),
(10, 2, 'advanced', FALSE),
-- Law
(13, 1, 'intermediate', FALSE),
(13, 2, 'advanced', FALSE),
-- Kid
(14, 1, 'basic', FALSE),
(14, 2, 'intermediate', FALSE),
(14, 3, 'basic', FALSE),
-- Shanks
(15, 1, 'master', TRUE),
(15, 2, 'master', TRUE),
(15, 3, 'master', TRUE),
-- Blackbeard
(16, 1, 'advanced', FALSE),
(16, 2, 'advanced', FALSE),
-- Kaido
(17, 1, 'advanced', TRUE),
(17, 2, 'advanced', TRUE),
(17, 3, 'advanced', TRUE),
-- Big Mom
(18, 1, 'advanced', FALSE),
(18, 2, 'advanced', FALSE),
(18, 3, 'advanced', FALSE),
-- Roger
(19, 1, 'master', TRUE),
(19, 2, 'master', TRUE),
(19, 3, 'master', TRUE),
-- Whitebeard
(20, 1, 'advanced', FALSE),
(20, 2, 'advanced', FALSE),
(20, 3, 'advanced', FALSE)
-- Buggy (doesn't have Haki in canon)
-- No entries for Buggy
;

-- Insert Character Character Types
INSERT INTO character_character_types (character_id, character_type_id, is_current) VALUES
-- Luffy (Current Yonko!)
(1, 1, TRUE),  -- Pirate
(1, 2, TRUE),  -- Captain
(1, 8, TRUE),  -- Supernova
(1, 6, TRUE),  -- Yonko (CURRENT!)
-- Zoro
(2, 1, TRUE),  -- Pirate
(2, 14, TRUE), -- Swordsman
(2, 8, TRUE),  -- Supernova
-- Nami
(3, 1, TRUE),  -- Pirate
(3, 13, TRUE), -- Navigator
-- Usopp
(4, 1, TRUE),  -- Pirate
(4, 15, TRUE), -- Sniper
-- Sanji
(5, 1, TRUE),  -- Pirate
(5, 16, TRUE), -- Cook
-- Chopper
(6, 1, TRUE),  -- Pirate
(6, 12, TRUE), -- Doctor
-- Robin
(7, 1, TRUE),  -- Pirate
(7, 17, TRUE), -- Archaeologist
-- Franky
(8, 1, TRUE),  -- Pirate
(8, 18, TRUE), -- Shipwright
-- Brook
(9, 1, TRUE),  -- Pirate
(9, 19, TRUE), -- Musician
-- Jinbe
(10, 1, TRUE),  -- Pirate
(10, 20, TRUE), -- Helmsman
(10, 7, FALSE), -- Former Shichibukai
-- Ace
(11, 1, TRUE),  -- Pirate
-- Sabo
(12, 9, TRUE),  -- Revolutionary
-- Law
(13, 1, TRUE),  -- Pirate
(13, 2, TRUE),  -- Captain
(13, 8, TRUE),  -- Supernova
(13, 12, TRUE), -- Doctor
(13, 7, FALSE), -- Former Shichibukai
-- Kid
(14, 1, TRUE),  -- Pirate
(14, 2, TRUE),  -- Captain
(14, 8, TRUE),  -- Supernova
-- Shanks (Current Yonko)
(15, 1, TRUE),  -- Pirate
(15, 2, TRUE),  -- Captain
(15, 6, TRUE),  -- Yonko (CURRENT!)
-- Blackbeard (Current Yonko)
(16, 1, TRUE),  -- Pirate
(16, 2, TRUE),  -- Captain
(16, 6, TRUE),  -- Yonko (CURRENT!)
(16, 7, FALSE), -- Former Shichibukai
-- Kaido (Former Yonko - defeated)
(17, 1, TRUE),  -- Pirate
(17, 2, TRUE),  -- Captain
(17, 6, FALSE), -- Former Yonko
-- Big Mom (Former Yonko - defeated)
(18, 1, TRUE),  -- Pirate
(18, 2, TRUE),  -- Captain
(18, 6, FALSE), -- Former Yonko
-- Roger (Deceased)
(19, 1, TRUE),  -- Pirate
(19, 2, TRUE),  -- Captain
-- Whitebeard (Deceased, Former Yonko)
(20, 1, TRUE),  -- Pirate
(20, 2, TRUE),  -- Captain
(20, 6, FALSE), -- Former Yonko
-- Buggy (Current Yonko!)
(21, 1, TRUE),  -- Pirate
(21, 2, TRUE),  -- Captain
(21, 6, TRUE),  -- Yonko (CURRENT!)
-- X Drake
(22, 1, TRUE),  -- Pirate
(22, 2, TRUE),  -- Captain
(22, 8, TRUE);  -- Supernova

-- ============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Complete Character Information
CREATE OR REPLACE VIEW v_characters_complete AS
SELECT 
    c.id,
    c.name,
    c.alias,
    c.age,
    c.birthday,
    c.height,
    c.bounty,
    r.name AS race,
    c.origin,
    c.status,
    c.description,
    c.image_url,
    c.debut,
    GROUP_CONCAT(DISTINCT df.name SEPARATOR ', ') AS devil_fruits,
    GROUP_CONCAT(DISTINCT o.name SEPARATOR ', ') AS organizations,
    GROUP_CONCAT(DISTINCT ht.name SEPARATOR ', ') AS haki_types,
    GROUP_CONCAT(DISTINCT ct.name SEPARATOR ', ') AS character_types
FROM characters c
LEFT JOIN races r ON c.race_id = r.id
LEFT JOIN character_devil_fruits cdf ON c.id = cdf.character_id AND cdf.is_current = TRUE
LEFT JOIN devil_fruits df ON cdf.devil_fruit_id = df.id
LEFT JOIN character_organizations co ON c.id = co.character_id AND co.is_current = TRUE
LEFT JOIN organizations o ON co.organization_id = o.id
LEFT JOIN character_haki ch ON c.id = ch.character_id
LEFT JOIN haki_types ht ON ch.haki_type_id = ht.id
LEFT JOIN character_character_types cct ON c.id = cct.character_id AND cct.is_current = TRUE
LEFT JOIN character_types ct ON cct.character_type_id = ct.id
GROUP BY c.id;

-- View: Organization Members
CREATE OR REPLACE VIEW v_organization_members AS
SELECT 
    o.id AS organization_id,
    o.name AS organization_name,
    ot.name AS organization_type,
    c.id AS character_id,
    c.name AS character_name,
    c.bounty AS character_bounty,
    co.role,
    co.joined_date,
    co.is_current
FROM organizations o
JOIN organization_types ot ON o.organization_type_id = ot.id
LEFT JOIN character_organizations co ON o.id = co.organization_id
LEFT JOIN characters c ON co.character_id = c.id
ORDER BY o.name, co.is_current DESC, c.bounty DESC;

-- View: Devil Fruit Users
CREATE OR REPLACE VIEW v_devil_fruit_users AS
SELECT 
    df.id AS fruit_id,
    df.name AS fruit_name,
    df.japanese_name,
    dft.name AS fruit_type,
    c.id AS user_id,
    c.name AS user_name,
    c.bounty AS user_bounty,
    cdf.acquired_date,
    cdf.is_current
FROM devil_fruits df
JOIN devil_fruit_types dft ON df.type_id = dft.id
LEFT JOIN character_devil_fruits cdf ON df.id = cdf.devil_fruit_id
LEFT JOIN characters c ON cdf.character_id = c.id
ORDER BY df.name, cdf.is_current DESC;

-- View: Current Yonko (Four Emperors)
CREATE OR REPLACE VIEW v_current_yonko AS
SELECT 
    c.id,
    c.name,
    c.alias,
    c.bounty,
    o.name AS crew_name,
    c.description
FROM characters c
JOIN character_character_types cct ON c.id = cct.character_id
JOIN character_types ct ON cct.character_type_id = ct.id
LEFT JOIN character_organizations co ON c.id = co.character_id AND co.is_current = TRUE
LEFT JOIN organizations o ON co.organization_id = o.id
WHERE ct.name = 'Yonko' AND cct.is_current = TRUE AND c.status = 'alive'
ORDER BY c.bounty DESC;

-- View: Haki Masters
CREATE OR REPLACE VIEW v_haki_masters AS
SELECT 
    c.id AS character_id,
    c.name AS character_name,
    c.alias,
    ht.name AS haki_type,
    ch.mastery_level,
    ch.awakened
FROM characters c
JOIN character_haki ch ON c.id = ch.character_id
JOIN haki_types ht ON ch.haki_type_id = ht.id
WHERE c.status = 'alive'
ORDER BY 
    FIELD(ch.mastery_level, 'master', 'advanced', 'intermediate', 'basic'),
    ch.awakened DESC,
    c.name;

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Additional indexes for common queries
CREATE INDEX idx_character_bounty_status ON characters(bounty DESC, status);
CREATE INDEX idx_organization_status_type ON organizations(status, organization_type_id);
CREATE INDEX idx_devil_fruit_type_user ON devil_fruits(type_id, current_user_id);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Database schema created successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Total tables created: 13' AS info;
SELECT 'Total views created: 5' AS info;
SELECT 'Sample data with 21 characters inserted' AS info;
SELECT '============================================' AS '';
SELECT 'Current Yonko (Four Emperors):' AS info;
SELECT '  1. Monkey D. Luffy (Straw Hat Pirates)' AS yonko;
SELECT '  2. Shanks (Red Hair Pirates)' AS yonko;
SELECT '  3. Marshall D. Teach (Blackbeard Pirates)' AS yonko;
SELECT '  4. Buggy (Buggy Pirates / Cross Guild)' AS yonko;
SELECT '============================================' AS '';
SELECT 'Database is ready for use!' AS status;
SELECT 'No stored procedures or triggers - Logic in application layer' AS note;
SELECT '============================================' AS '';
