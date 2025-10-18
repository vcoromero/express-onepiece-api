-- ============================================
-- ONE PIECE API - SEED ORGANIZATIONS
-- ============================================
-- Author: Database Expert
-- Description: Insert organizations data only
-- ============================================

-- Insert Organizations
INSERT INTO organizations (name, organization_type_id, leader_id, ship_id, base_location, total_bounty, status, description) VALUES
('Straw Hat Pirates', 5, 1, 1, 'Thousand Sunny (Mobile)', 8816000000, 'active', 'Yonko crew led by Monkey D. Luffy, aiming for One Piece'),
('Heart Pirates', 1, 13, 8, 'Polar Tang (Mobile)', 3000000000, 'active', 'Pirate crew led by Trafalgar Law, allied with Straw Hats'),
('Kid Pirates', 1, 14, 9, 'Victoria Punk (Mobile)', 3000000000, 'active', 'Pirate crew led by Eustass Kid, member of Worst Generation'),
('Red Hair Pirates', 5, 15, 5, 'Unknown', 4048900000, 'active', 'Yonko crew led by Shanks, one of the Four Emperors'),
('Blackbeard Pirates', 5, 16, NULL, 'Pirate Island - Hachinosu', 3996000000, 'active', 'Yonko crew led by Marshall D. Teach, one of the Four Emperors'),
('Buggy Pirates', 5, 21, NULL, 'Karai Bari Island', 3189000000, 'active', 'Yonko crew led by Buggy, founder of Cross Guild'),
('Whitebeard Pirates', 5, 20, 3, 'Moby Dick', 5046000000, 'disbanded', 'Former Yonko crew led by Edward Newgate, disbanded after Marineford War'),
('Roger Pirates', 1, 19, 4, NULL, 5564800000, 'disbanded', 'Legendary crew led by Gol D. Roger, conquered Grand Line'),
('Revolutionary Army', 3, NULL, NULL, 'Kamabakka Kingdom', 602000000, 'active', 'Organization led by Monkey D. Dragon, opposing World Government'),
('Marines', 2, NULL, NULL, 'Marineford', 0, 'active', 'Military force of the World Government'),
('Big Mom Pirates', 5, 18, 6, 'Whole Cake Island', 4388000000, 'active', 'Former Yonko crew led by Charlotte Linlin, defeated in Wano'),
('Drake Pirates', 1, 22, 10, 'Perfumer (Mobile)', 222000000, 'active', 'Pirate crew led by X Drake, former Marine');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Organizations seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Organizations: 12' AS info;
SELECT 'Ready for relationship data insertion' AS status;
SELECT '============================================' AS '';
