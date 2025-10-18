-- ============================================
-- ONE PIECE API - SEED CHARACTER ORGANIZATIONS
-- ============================================
-- Author: Database Expert
-- Description: Insert character organization relationships only
-- ============================================

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

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Character Organizations seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Organizations: 22' AS info;
SELECT 'Database is fully populated!' AS status;
SELECT '============================================' AS '';
