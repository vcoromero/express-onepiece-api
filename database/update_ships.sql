-- Update script to add missing characters and organizations for ships
-- This script adds the missing data to fix ship-organization relationships

USE onepiece_db;

-- Add X Drake character
INSERT INTO characters (name, alias, age, birthday, height, bounty, race_id, origin, status, description, debut) VALUES
('X Drake', 'Red Flag X Drake', 33, 'October 11', '233 cm', 222000000, 1, 'North Blue', 'alive', 'Former Marine Rear Admiral turned pirate, captain of Drake Pirates', 'Chapter 498');

-- Add missing organizations
INSERT INTO organizations (name, organization_type_id, leader_id, ship_id, base_location, total_bounty, status, description) VALUES
('Big Mom Pirates', 5, 18, 6, 'Whole Cake Island', 4388000000, 'active', 'Former Yonko crew led by Charlotte Linlin, defeated in Wano'),
('Drake Pirates', 1, 22, 10, 'Perfumer (Mobile)', 222000000, 'active', 'Pirate crew led by X Drake, former Marine');

-- Add character-organization relationships
INSERT INTO character_organizations (character_id, organization_id, role, is_current, joined_date) VALUES
(18, 11, 'Captain', TRUE, 'Founded'),
(22, 12, 'Captain', TRUE, 'Founded');

-- Add character types for X Drake
INSERT INTO character_character_types (character_id, character_type_id, is_current) VALUES
(22, 1, TRUE),  -- Pirate
(22, 2, TRUE),  -- Captain
(22, 8, TRUE);  -- Supernova
