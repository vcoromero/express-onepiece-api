-- ============================================
-- ONE PIECE API - SEED CHARACTER TYPES
-- ============================================
-- Author: Database Expert
-- Description: Insert character types data only
-- ============================================

-- Insert Character Types
INSERT INTO character_types (name, description) VALUES
('Pirate', 'Someone who sails under a pirate flag'),
('Captain', 'Leader of a pirate crew or ship'),
('Marine', 'Member of the World Government military'),
('Admiral', 'Highest rank in Marine forces'),
('Vice Admiral', 'Second highest Marine rank'),
('Yonko', 'One of the Four Emperors ruling the New World'),
('Shichibukai', 'Seven Warlords of the Sea (former system)'),
('Supernova', 'Rookie pirate with bounty over 100 million'),
('Revolutionary', 'Member of Revolutionary Army'),
('Bounty Hunter', 'One who hunts pirates for their bounties'),
('Scientist', 'Expert in various scientific fields'),
('Doctor', 'Medical professional'),
('Navigator', 'Expert in navigation and weather'),
('Swordsman', 'Master of sword techniques'),
('Sniper', 'Expert marksman'),
('Cook', 'Professional chef'),
('Archaeologist', 'Expert in ancient history'),
('Shipwright', 'Ship builder and carpenter'),
('Musician', 'Professional music performer'),
('Helmsman', 'Expert ship pilot'),
('Civilian', 'Regular citizen not affiliated with pirates or marines');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Character types seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Character Types: 21' AS info;
SELECT 'Ready for devil fruit types insertion' AS status;
SELECT '============================================' AS '';
