-- ============================================
-- ONE PIECE API - SEED RACES
-- ============================================
-- Author: Database Expert
-- Description: Insert races data only
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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Races seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Races: 12' AS info;
SELECT 'Ready for character types insertion' AS status;
SELECT '============================================' AS '';
