-- ============================================
-- ONE PIECE API - SEED DEVIL FRUIT TYPES
-- ============================================
-- Author: Database Expert
-- Description: Insert devil fruit types data only
-- ============================================

-- Insert Devil Fruit Types
INSERT INTO devil_fruit_types (name, description) VALUES
('Paramecia', 'Grants superhuman abilities, most common type'),
('Zoan', 'Allows transformation into animals or hybrid forms'),
('Logia', 'Grants power to transform into natural elements');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Devil fruit types seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Devil Fruit Types: 3' AS info;
SELECT 'Ready for organization types insertion' AS status;
SELECT '============================================' AS '';
