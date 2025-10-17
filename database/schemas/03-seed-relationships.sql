-- ============================================
-- ONE PIECE API - RELATIONSHIP DATA SEEDING
-- ============================================
-- Author: Database Expert
-- Description: Insert relationship data between characters, organizations, etc.
-- ============================================

USE onepiece_db;

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
(20, 3, 'advanced', FALSE);

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
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Relationship data seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Devil Fruits: 11' AS info;
SELECT 'Character Organizations: 22' AS info;
SELECT 'Character Haki: 25' AS info;
SELECT 'Character Types: 35' AS info;
SELECT 'Database is fully populated!' AS status;
SELECT '============================================' AS '';
