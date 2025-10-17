-- ============================================
-- ONE PIECE API - CATALOG DATA SEEDING
-- ============================================
-- Author: Database Expert
-- Description: Insert catalog data (races, types, etc.)
-- ============================================

USE onepiece_db;

-- ============================================
-- SEED DATA - CATALOG TABLES
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

-- Insert Devil Fruit Types
INSERT INTO devil_fruit_types (name, description) VALUES
('Paramecia', 'Grants superhuman abilities, most common type'),
('Zoan', 'Allows transformation into animals or hybrid forms'),
('Logia', 'Grants power to transform into natural elements');

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

-- Insert Haki Types
INSERT INTO haki_types (name, description, color) VALUES
('Observation Haki', 'Allows user to sense presence and emotions of others, predict movements', 'Red'),
('Armament Haki', 'Allows user to use spiritual armor for offense and defense, can touch Logia users', 'Black'),
('Conqueror Haki', 'Rare Haki that allows user to exert willpower over others, knock out weak-willed', 'Dark Red/Black');

-- Insert Ships
INSERT INTO ships (name, description, status) VALUES
('Thousand Sunny', 'The second ship of the Straw Hat Pirates, built by Franky using Adam Wood', 'active'),
('Going Merry', 'The first ship of the Straw Hat Pirates, a caravel gifted by Kaya', 'destroyed'),
('Moby Dick', 'Flagship of the Whitebeard Pirates, a massive whale-shaped vessel', 'destroyed'),
('Oro Jackson', 'Ship of the Roger Pirates, built by Tom', 'retired'),
('Red Force', 'Flagship of the Red Hair Pirates', 'active'),
('Queen Mama Chanter', 'Main ship of the Big Mom Pirates', 'active'),
('Numancia Flamingo', 'Former ship of the Donquixote Pirates', 'retired'),
('Polar Tang', 'Submarine of the Heart Pirates', 'active'),
('Victoria Punk', 'Ship of the Kid Pirates', 'active'),
('Perfumer', 'Ship of the Drake Pirates', 'active');

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Catalog data seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Races: 12' AS info;
SELECT 'Character Types: 21' AS info;
SELECT 'Devil Fruit Types: 3' AS info;
SELECT 'Organization Types: 8' AS info;
SELECT 'Haki Types: 3' AS info;
SELECT 'Ships: 10' AS info;
SELECT 'Ready for main data insertion' AS status;
SELECT '============================================' AS '';
