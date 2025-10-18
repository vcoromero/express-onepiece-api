-- ============================================
-- ONE PIECE API - SEED CHARACTER CHARACTER TYPES
-- ============================================
-- Author: Database Expert
-- Description: Insert character character type relationships only
-- ============================================

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
SELECT 'Character Character Types seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Types: 35' AS info;
SELECT 'Ready for character organizations insertion' AS status;
SELECT '============================================' AS '';
