-- ============================================
-- ONE PIECE API - SEED CHARACTERS
-- ============================================
-- Author: Database Expert
-- Description: Insert characters data only
-- ============================================

-- Insert Characters
INSERT INTO characters (name, alias, age, birthday, height, bounty, race_id, origin, status, description, debut) VALUES
-- Straw Hat Pirates
('Monkey D. Luffy', 'Straw Hat Luffy', 19, 'May 5', '174 cm', 3000000000, 1, 'East Blue - Foosha Village', 'alive', 'Captain of the Straw Hat Pirates, one of the Four Emperors, dreams of becoming Pirate King', 'Chapter 1'),
('Roronoa Zoro', 'Pirate Hunter Zoro', 21, 'November 11', '181 cm', 1111000000, 1, 'East Blue - Shimotsuki Village', 'alive', 'Swordsman of the Straw Hats, aims to become the greatest swordsman', 'Chapter 3'),
('Nami', 'Cat Burglar Nami', 20, 'July 3', '170 cm', 366000000, 1, 'East Blue - Cocoyasi Village', 'alive', 'Navigator of the Straw Hats, dreams of mapping the world', 'Chapter 8'),
('Usopp', 'God Usopp', 19, 'April 1', '176 cm', 500000000, 1, 'East Blue - Syrup Village', 'alive', 'Sniper of the Straw Hats, dreams of becoming a brave warrior of the sea', 'Chapter 23'),
('Sanji', 'Black Leg Sanji', 21, 'March 2', '180 cm', 1032000000, 1, 'North Blue - Germa Kingdom', 'alive', 'Cook of the Straw Hats, seeks the All Blue', 'Chapter 43'),
('Tony Tony Chopper', 'Cotton Candy Lover Chopper', 17, 'December 24', '90 cm', 1000, 6, 'Drum Island', 'alive', 'Doctor of the Straw Hats, reindeer who ate Hito Hito no Mi', 'Chapter 134'),
('Nico Robin', 'Devil Child Robin', 30, 'February 6', '188 cm', 930000000, 1, 'West Blue - Ohara', 'alive', 'Archaeologist of the Straw Hats, seeks the true history', 'Chapter 114'),
('Franky', 'Cyborg Franky', 36, 'March 9', '240 cm', 394000000, 9, 'South Blue - Water 7', 'alive', 'Shipwright of the Straw Hats, built Thousand Sunny', 'Chapter 329'),
('Brook', 'Soul King Brook', 90, 'April 3', '277 cm', 383000000, 10, 'West Blue', 'alive', 'Musician of the Straw Hats, skeleton brought back by Yomi Yomi no Mi', 'Chapter 442'),
('Jinbe', 'Knight of the Sea Jinbe', 46, 'April 2', '301 cm', 1100000000, 2, 'Fish-Man Island', 'alive', 'Helmsman of the Straw Hats, former Shichibukai and whale shark fishman', 'Chapter 528'),

-- Other Major Characters
('Portgas D. Ace', 'Fire Fist Ace', 20, 'January 1', '185 cm', 550000000, 1, 'South Blue - Baterilla', 'deceased', 'Former 2nd Division Commander of Whitebeard Pirates, Luffy\'s brother', 'Chapter 154'),
('Sabo', 'The Flame Emperor', 22, 'March 20', '187 cm', 602000000, 1, 'East Blue - Goa Kingdom', 'alive', 'Chief of Staff of Revolutionary Army, Luffy\'s brother', 'Chapter 583'),
('Trafalgar D. Water Law', 'Surgeon of Death', 26, 'October 6', '191 cm', 3000000000, 1, 'North Blue - Flevance', 'alive', 'Captain of Heart Pirates, member of Worst Generation', 'Chapter 498'),
('Eustass Kid', 'Captain Kid', 23, 'January 10', '205 cm', 3000000000, 1, 'South Blue', 'alive', 'Captain of Kid Pirates, member of Worst Generation', 'Chapter 498'),
('Shanks', 'Red Hair Shanks', 39, 'March 9', '199 cm', 4048900000, 1, 'West Blue', 'alive', 'Captain of Red Hair Pirates, one of the Four Emperors', 'Chapter 1'),
('Marshall D. Teach', 'Blackbeard', 40, 'August 3', '344 cm', 3996000000, 1, 'Unknown', 'alive', 'Captain of Blackbeard Pirates, one of the Four Emperors', 'Chapter 234'),
('Kaido', 'Kaido of the Beasts', 59, 'May 1', '710 cm', 4611100000, 1, 'Unknown', 'alive', 'Former Emperor, known as strongest creature in the world, defeated in Wano', 'Chapter 795'),
('Charlotte Linlin', 'Big Mom', 68, 'February 15', '880 cm', 4388000000, 1, 'Unknown', 'alive', 'Former Emperor, captain of Big Mom Pirates, defeated in Wano', 'Chapter 651'),
('Gol D. Roger', 'Gold Roger, Pirate King', 53, 'December 31', '274 cm', 5564800000, 1, 'East Blue - Loguetown', 'deceased', 'Former Pirate King, started the Great Pirate Era', 'Chapter 1'),
('Edward Newgate', 'Whitebeard', 72, 'April 6', '666 cm', 5046000000, 1, 'Sphinx', 'deceased', 'Former Emperor, known as strongest man in the world, died at Marineford', 'Chapter 234'),
('Buggy', 'Buggy the Clown', 39, 'August 8', '192 cm', 3189000000, 1, 'Unknown', 'alive', 'Captain of Buggy Pirates, one of the Four Emperors, founder of Cross Guild', 'Chapter 9'),
('X Drake', 'Red Flag X Drake', 33, 'October 11', '233 cm', 222000000, 1, 'North Blue', 'alive', 'Former Marine Rear Admiral turned pirate, captain of Drake Pirates', 'Chapter 498');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Characters seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Characters: 22' AS info;
SELECT 'Ready for devil fruits insertion' AS status;
SELECT '============================================' AS '';
