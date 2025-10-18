-- ============================================
-- ONE PIECE API - SEED DEVIL FRUITS
-- ============================================
-- Author: Database Expert
-- Description: Insert devil fruits data only
-- ============================================

-- Insert Devil Fruits
INSERT INTO devil_fruits (name, japanese_name, type_id, description, abilities, current_user_id) VALUES
('Gomu Gomu no Mi', 'ゴムゴムの実', 1, 'Rubber-Rubber Fruit, actually the Hito Hito no Mi, Model: Nika', 'Grants user rubber body, immunity to electricity, awakens as Sun God Nika', 1),
('Hana Hana no Mi', '花花の実', 1, 'Flower-Flower Fruit', 'Allows user to sprout body parts anywhere', 7),
('Yomi Yomi no Mi', 'ヨミヨミの実', 1, 'Revive-Revive Fruit', 'Grants user a second life, soul can leave body', 9),
('Ope Ope no Mi', 'オペオペの実', 1, 'Op-Op Fruit', 'Allows user to create a spherical territory and manipulate everything inside', 13),
('Mera Mera no Mi', 'メラメラの実', 3, 'Flame-Flame Fruit', 'Allows user to create, control, and become fire', 12),
('Gura Gura no Mi', 'グラグラの実', 1, 'Tremor-Tremor Fruit', 'Allows user to create quakes and shockwaves', 16),
('Yami Yami no Mi', 'ヤミヤミの実', 3, 'Dark-Dark Fruit', 'Allows user to create, control, and become darkness, nullify devil fruits', 16),
('Uo Uo no Mi, Model: Seiryu', '魚魚の実 モデル：青龍', 2, 'Fish-Fish Fruit, Model: Azure Dragon', 'Allows user to transform into an Azure Dragon', 17),
('Soru Soru no Mi', 'ソルソルの実', 1, 'Soul-Soul Fruit', 'Allows user to manipulate souls and give life to objects', 18),
('Hito Hito no Mi', 'ヒトヒトの実', 2, 'Human-Human Fruit', 'Allows animal to gain human intelligence and form', 6),
('Bara Bara no Mi', 'バラバラの実', 1, 'Chop-Chop Fruit', 'Allows user to split body into pieces and control them independently', 21),
('Magu Magu no Mi', 'マグマグの実', 3, 'Magma-Magma Fruit', 'Allows user to create, control, and become magma', NULL),
('Pika Pika no Mi', 'ピカピカの実', 3, 'Glint-Glint Fruit', 'Allows user to create, control, and become light', NULL),
('Hie Hie no Mi', 'ヒエヒエの実', 3, 'Ice-Ice Fruit', 'Allows user to create, control, and become ice', NULL),
('Goro Goro no Mi', 'ゴロゴロの実', 3, 'Rumble-Rumble Fruit', 'Allows user to create, control, and become electricity', NULL),
('Mochi Mochi no Mi', 'モチモチの実', 1, 'Mochi-Mochi Fruit', 'Allows user to create, control, and become mochi', NULL);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT '============================================' AS '';
SELECT 'Devil fruits seeded successfully!' AS message;
SELECT '============================================' AS '';
SELECT 'Devil Fruits: 16' AS info;
SELECT 'Ready for organizations insertion' AS status;
SELECT '============================================' AS '';
