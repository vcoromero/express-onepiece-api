-- ============================================
-- ONE PIECE API - SEED CHARACTER HAKI
-- ============================================
-- Author: Database Expert
-- Description: Insert character haki relationships only
-- ============================================

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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Character Haki seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Haki: 25' AS info;
SELECT 'Ready for character devil fruits insertion' AS status;
SELECT '============================================' AS '';
