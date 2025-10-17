-- ============================================
-- ONE PIECE API - FOREIGN KEY RELATIONSHIPS
-- ============================================
-- Author: Database Expert
-- Description: Create foreign key constraints and relationships
-- ============================================

USE onepiece_db;

-- ============================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================

-- Characters Table Foreign Keys
ALTER TABLE characters 
ADD CONSTRAINT fk_character_race 
FOREIGN KEY (race_id) 
REFERENCES races(id) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Devil Fruits Table Foreign Keys
ALTER TABLE devil_fruits 
ADD CONSTRAINT fk_devil_fruit_type 
FOREIGN KEY (type_id) 
REFERENCES devil_fruit_types(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE devil_fruits 
ADD CONSTRAINT fk_devil_fruit_current_user 
FOREIGN KEY (current_user_id) 
REFERENCES characters(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Organizations Table Foreign Keys
ALTER TABLE organizations 
ADD CONSTRAINT fk_organization_type 
FOREIGN KEY (organization_type_id) 
REFERENCES organization_types(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE organizations 
ADD CONSTRAINT fk_organization_leader 
FOREIGN KEY (leader_id) 
REFERENCES characters(id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE organizations 
ADD CONSTRAINT fk_organization_ship 
FOREIGN KEY (ship_id) 
REFERENCES ships(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- RELATIONSHIP TABLE FOREIGN KEYS
-- ============================================

-- Character Devil Fruits Relationship
ALTER TABLE character_devil_fruits 
ADD CONSTRAINT fk_char_df_character 
FOREIGN KEY (character_id) 
REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE character_devil_fruits 
ADD CONSTRAINT fk_char_df_fruit 
FOREIGN KEY (devil_fruit_id) 
REFERENCES devil_fruits(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Character Organizations Relationship
ALTER TABLE character_organizations 
ADD CONSTRAINT fk_char_org_character 
FOREIGN KEY (character_id) 
REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE character_organizations 
ADD CONSTRAINT fk_char_org_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Character Haki Relationship
ALTER TABLE character_haki 
ADD CONSTRAINT fk_char_haki_character 
FOREIGN KEY (character_id) 
REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE character_haki 
ADD CONSTRAINT fk_char_haki_type 
FOREIGN KEY (haki_type_id) 
REFERENCES haki_types(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Character Character Types Relationship
ALTER TABLE character_character_types 
ADD CONSTRAINT fk_char_type_character 
FOREIGN KEY (character_id) 
REFERENCES characters(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE character_character_types 
ADD CONSTRAINT fk_char_type_type 
FOREIGN KEY (character_type_id) 
REFERENCES character_types(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Additional indexes for common queries
CREATE INDEX idx_character_bounty_status ON characters(bounty DESC, status);
CREATE INDEX idx_organization_status_type ON organizations(status, organization_type_id);
CREATE INDEX idx_devil_fruit_type_user ON devil_fruits(type_id, current_user_id);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Foreign key relationships created successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'All constraints and indexes applied' AS info;
SELECT 'Database structure is complete' AS status;
SELECT '============================================' AS '';
