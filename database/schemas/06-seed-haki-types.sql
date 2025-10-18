-- ============================================
-- ONE PIECE API - SEED HAKI TYPES
-- ============================================
-- Author: Database Expert
-- Description: Insert haki types data only
-- ============================================

-- Insert Haki Types
INSERT INTO haki_types (name, description, color) VALUES
('Observation Haki', 'Allows user to sense presence and emotions of others, predict movements', 'Red'),
('Armament Haki', 'Allows user to use spiritual armor for offense and defense, can touch Logia users', 'Black'),
('Conqueror Haki', 'Rare Haki that allows user to exert willpower over others, knock out weak-willed', 'Dark Red/Black');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Haki types seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Haki Types: 3' AS info;
SELECT 'Ready for ships insertion' AS status;
SELECT '============================================' AS '';
