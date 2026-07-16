-- ============================================================
-- 024_fix_missing_fks
-- 修复遗漏 FK：scenarios.industry_id、creator_id、tenant_id
-- ============================================================

-- PART 1: scenarios.industry_id VARCHAR → UUID FK（022 遗漏）
ALTER TABLE scenarios ADD COLUMN industry_id_new UUID;
UPDATE scenarios s SET industry_id_new = (
    SELECT i.id FROM industries i
    WHERE i.name = s.industry_id OR i.id::text = s.industry_id
    LIMIT 1
) WHERE s.industry_id IS NOT NULL AND s.industry_id != '';
ALTER TABLE scenarios DROP COLUMN industry_id;
ALTER TABLE scenarios RENAME COLUMN industry_id_new TO industry_id;
ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL;

-- PART 2: creator_id 统一加 FK → users
ALTER TABLE scenarios          ADD CONSTRAINT fk_scenarios_creator          FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE knowledge_points   ADD CONSTRAINT fk_knowledge_points_creator   FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE question_banks     ADD CONSTRAINT fk_question_banks_creator     FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE exams              ADD CONSTRAINT fk_exams_creator              FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE exam_usages        ADD CONSTRAINT fk_exam_usages_creator        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE courses            ADD CONSTRAINT fk_courses_creator            FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE career_positions   ADD CONSTRAINT fk_career_positions_creator   FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;

-- PART 3: 核心实体 tenant_id 加 FK → tenants
ALTER TABLE majors            ADD CONSTRAINT fk_majors_tenant            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE industries         ADD CONSTRAINT fk_industries_tenant_fk      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE scenarios          ADD CONSTRAINT fk_scenarios_tenant          FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE courses            ADD CONSTRAINT fk_courses_tenant            FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE career_positions   ADD CONSTRAINT fk_career_positions_tenant   FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE exams              ADD CONSTRAINT fk_exams_tenant              FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE question_banks     ADD CONSTRAINT fk_question_banks_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE questions          ADD CONSTRAINT fk_questions_tenant          FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE knowledge_points   ADD CONSTRAINT fk_knowledge_points_tenant   FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE ability_points     ADD CONSTRAINT fk_ability_points_tenant     FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- PART 4: career_positions.major_ids UUID[] → 中间表
CREATE TABLE career_position_majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    major_id UUID NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(career_position_id, major_id)
);

-- 迁移现有数据
INSERT INTO career_position_majors (career_position_id, major_id)
SELECT cp.id AS career_position_id, unnest(cp.major_ids) AS major_id
FROM career_positions cp
WHERE cp.major_ids IS NOT NULL AND array_length(cp.major_ids, 1) > 0
ON CONFLICT (career_position_id, major_id) DO NOTHING;

CREATE INDEX idx_career_position_majors_position ON career_position_majors(career_position_id);
CREATE INDEX idx_career_position_majors_major ON career_position_majors(major_id);

-- 新数据通过中间表维护后执行以下两步切换
-- ALTER TABLE career_positions DROP COLUMN major_ids;
-- 同时更新 position_handler.go 使用中间表读写
