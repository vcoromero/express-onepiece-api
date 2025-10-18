-- ============================================
-- ONE PIECE API - SEED CHARACTER DEVIL FRUITS
-- ============================================
-- Author: Database Expert
-- Description: Insert character devil fruit relationships only
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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Character Devil Fruits seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Devil Fruits: 11' AS info;
SELECT 'Ready for character character types insertion' AS status;
SELECT '============================================' AS '';
