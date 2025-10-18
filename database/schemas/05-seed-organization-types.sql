-- ============================================
-- ONE PIECE API - SEED ORGANIZATION TYPES
-- ============================================
-- Author: Database Expert
-- Description: Insert organization types data only
-- ============================================

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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Organization types seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Organization Types: 8' AS info;
SELECT 'Ready for haki types insertion' AS status;
SELECT '============================================' AS '';
