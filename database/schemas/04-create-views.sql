-- ============================================
-- ONE PIECE API - USEFUL VIEWS
-- ============================================
-- Author: Database Expert
-- Description: Create useful views for common queries
-- ============================================

USE onepiece_db;

-- ============================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Complete Character Information
CREATE OR REPLACE VIEW v_characters_complete AS
SELECT 
    c.id,
    c.name,
    c.alias,
    c.age,
    c.birthday,
    c.height,
    c.bounty,
    r.name AS race,
    c.origin,
    c.status,
    c.description,
    c.image_url,
    c.debut,
    GROUP_CONCAT(DISTINCT df.name SEPARATOR ', ') AS devil_fruits,
    GROUP_CONCAT(DISTINCT o.name SEPARATOR ', ') AS organizations,
    GROUP_CONCAT(DISTINCT ht.name SEPARATOR ', ') AS haki_types,
    GROUP_CONCAT(DISTINCT ct.name SEPARATOR ', ') AS character_types
FROM characters c
LEFT JOIN races r ON c.race_id = r.id
LEFT JOIN character_devil_fruits cdf ON c.id = cdf.character_id AND cdf.is_current = TRUE
LEFT JOIN devil_fruits df ON cdf.devil_fruit_id = df.id
LEFT JOIN character_organizations co ON c.id = co.character_id AND co.is_current = TRUE
LEFT JOIN organizations o ON co.organization_id = o.id
LEFT JOIN character_haki ch ON c.id = ch.character_id
LEFT JOIN haki_types ht ON ch.haki_type_id = ht.id
LEFT JOIN character_character_types cct ON c.id = cct.character_id AND cct.is_current = TRUE
LEFT JOIN character_types ct ON cct.character_type_id = ct.id
GROUP BY c.id;

-- View: Organization Members
CREATE OR REPLACE VIEW v_organization_members AS
SELECT 
    o.id AS organization_id,
    o.name AS organization_name,
    ot.name AS organization_type,
    c.id AS character_id,
    c.name AS character_name,
    c.bounty AS character_bounty,
    co.role,
    co.joined_date,
    co.is_current
FROM organizations o
JOIN organization_types ot ON o.organization_type_id = ot.id
LEFT JOIN character_organizations co ON o.id = co.organization_id
LEFT JOIN characters c ON co.character_id = c.id
ORDER BY o.name, co.is_current DESC, c.bounty DESC;

-- View: Devil Fruit Users
CREATE OR REPLACE VIEW v_devil_fruit_users AS
SELECT 
    df.id AS fruit_id,
    df.name AS fruit_name,
    df.japanese_name,
    dft.name AS fruit_type,
    c.id AS user_id,
    c.name AS user_name,
    c.bounty AS user_bounty,
    cdf.acquired_date,
    cdf.is_current
FROM devil_fruits df
JOIN devil_fruit_types dft ON df.type_id = dft.id
LEFT JOIN character_devil_fruits cdf ON df.id = cdf.devil_fruit_id
LEFT JOIN characters c ON cdf.character_id = c.id
ORDER BY df.name, cdf.is_current DESC;

-- View: Current Yonko (Four Emperors)
CREATE OR REPLACE VIEW v_current_yonko AS
SELECT 
    c.id,
    c.name,
    c.alias,
    c.bounty,
    o.name AS crew_name,
    c.description
FROM characters c
JOIN character_character_types cct ON c.id = cct.character_id
JOIN character_types ct ON cct.character_type_id = ct.id
LEFT JOIN character_organizations co ON c.id = co.character_id AND co.is_current = TRUE
LEFT JOIN organizations o ON co.organization_id = o.id
WHERE ct.name = 'Yonko' AND cct.is_current = TRUE AND c.status = 'alive'
ORDER BY c.bounty DESC;

-- View: Haki Masters
CREATE OR REPLACE VIEW v_haki_masters AS
SELECT 
    c.id AS character_id,
    c.name AS character_name,
    c.alias,
    ht.name AS haki_type,
    ch.mastery_level,
    ch.awakened
FROM characters c
JOIN character_haki ch ON c.id = ch.character_id
JOIN haki_types ht ON ch.haki_type_id = ht.id
WHERE c.status = 'alive'
ORDER BY 
    FIELD(ch.mastery_level, 'master', 'advanced', 'intermediate', 'basic'),
    ch.awakened DESC,
    c.name;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Views created successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Total views created: 5' AS info;
SELECT 'Views available for common queries' AS status;
SELECT '============================================' AS '';
SELECT 'Current Yonko (Four Emperors):' AS info;
SELECT '  1. Monkey D. Luffy (Straw Hat Pirates)' AS yonko;
SELECT '  2. Shanks (Red Hair Pirates)' AS yonko;
SELECT '  3. Marshall D. Teach (Blackbeard Pirates)' AS yonko;
SELECT '  4. Buggy (Buggy Pirates / Cross Guild)' AS yonko;
SELECT '============================================' AS '';
SELECT 'Database is ready for use!' AS status;
SELECT 'No stored procedures or triggers - Logic in application layer' AS note;
SELECT '============================================' AS '';
