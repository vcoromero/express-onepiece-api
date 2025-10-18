-- ============================================
-- ONE PIECE API - SEED SHIPS
-- ============================================
-- Author: Database Expert
-- Description: Insert ships data only
-- ============================================

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
SELECT 'Ships seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Ships: 10' AS info;
SELECT 'Ready for characters insertion' AS status;
SELECT '============================================' AS '';
