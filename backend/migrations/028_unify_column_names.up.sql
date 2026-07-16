-- ============================================================
-- 028_unify_column_names
-- 统一含义相同的列名
-- ============================================================

-- cover_url → cover_image（统一为 cover_image）
ALTER TABLE resources RENAME COLUMN cover_url TO cover_image;
ALTER TABLE exams RENAME COLUMN cover_url TO cover_image;
ALTER TABLE question_banks RENAME COLUMN cover_url TO cover_image;
ALTER TABLE micro_cert_templates RENAME COLUMN cover_url TO cover_image;

-- is_visible / is_active → is_enabled
ALTER TABLE position_recommendations RENAME COLUMN is_visible TO is_enabled;
ALTER TABLE credit_conversion_rules RENAME COLUMN is_visible TO is_enabled;
ALTER TABLE student_ability_archives RENAME COLUMN is_visible TO is_enabled;
ALTER TABLE learn_roads RENAME COLUMN is_active TO is_enabled;
ALTER TABLE banner_configs RENAME COLUMN is_active TO is_enabled;
