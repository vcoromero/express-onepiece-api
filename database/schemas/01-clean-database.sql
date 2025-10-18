-- ============================================
-- ONE PIECE API - CLEAN DATABASE
-- ============================================
-- Author: Database Expert
-- Description: Clean all data from database (in correct order to avoid FK constraints)
-- ============================================

-- Clean relationship tables first (to avoid FK constraint errors)
DELETE FROM character_organizations;
DELETE FROM character_character_types;
DELETE FROM character_devil_fruits;
DELETE FROM character_haki;

-- Clean main tables
DELETE FROM organizations;
DELETE FROM devil_fruits;
DELETE FROM characters;
DELETE FROM ships;

-- Clean catalog tables
DELETE FROM haki_types;
DELETE FROM organization_types;
DELETE FROM devil_fruit_types;
DELETE FROM character_types;
DELETE FROM races;

-- Reset auto-increment counters
ALTER TABLE races AUTO_INCREMENT = 1;
ALTER TABLE character_types AUTO_INCREMENT = 1;
ALTER TABLE devil_fruit_types AUTO_INCREMENT = 1;
ALTER TABLE organization_types AUTO_INCREMENT = 1;
ALTER TABLE haki_types AUTO_INCREMENT = 1;
ALTER TABLE ships AUTO_INCREMENT = 1;
ALTER TABLE characters AUTO_INCREMENT = 1;
ALTER TABLE devil_fruits AUTO_INCREMENT = 1;
ALTER TABLE organizations AUTO_INCREMENT = 1;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Database cleaned successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'All tables have been emptied' AS status;
SELECT 'Ready for fresh data insertion' AS next_step;
SELECT '============================================' AS '';
