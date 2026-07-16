-- ============================================================
-- 024_fix_missing_fks (幂等版)
-- ============================================================

-- PART 1: scenarios.industry_id VARCHAR → UUID FK
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS industry_id_new UUID;
UPDATE scenarios s SET industry_id_new = (SELECT i.id FROM industries i WHERE i.name = s.industry_id OR i.id::text = s.industry_id LIMIT 1)
WHERE s.industry_id IS NOT NULL AND s.industry_id != '';
ALTER TABLE scenarios DROP COLUMN IF EXISTS industry_id;
ALTER TABLE scenarios RENAME COLUMN industry_id_new TO industry_id;

-- PART 2: FK 约束（仅列存在时添加）
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scenarios' AND column_name='industry_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_scenarios_industry') THEN ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scenarios' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_scenarios_creator') THEN ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='knowledge_points' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_knowledge_points_creator') THEN ALTER TABLE knowledge_points ADD CONSTRAINT fk_knowledge_points_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_banks' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_question_banks_creator') THEN ALTER TABLE question_banks ADD CONSTRAINT fk_question_banks_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_exams_creator') THEN ALTER TABLE exams ADD CONSTRAINT fk_exams_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_usages' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_exam_usages_creator') THEN ALTER TABLE exam_usages ADD CONSTRAINT fk_exam_usages_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_courses_creator') THEN ALTER TABLE courses ADD CONSTRAINT fk_courses_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='career_positions' AND column_name='creator_id') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_career_positions_creator') THEN ALTER TABLE career_positions ADD CONSTRAINT fk_career_positions_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL; END IF; END $$;

-- PART 3: tenant_id FK（仅列存在时添加）
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_majors_tenant') THEN ALTER TABLE majors ADD CONSTRAINT fk_majors_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_industries_tenant_fk') THEN ALTER TABLE industries ADD CONSTRAINT fk_industries_tenant_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_courses_tenant') THEN ALTER TABLE courses ADD CONSTRAINT fk_courses_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_exams_tenant') THEN ALTER TABLE exams ADD CONSTRAINT fk_exams_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_question_banks_tenant') THEN ALTER TABLE question_banks ADD CONSTRAINT fk_question_banks_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_questions_tenant') THEN ALTER TABLE questions ADD CONSTRAINT fk_questions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_knowledge_points_tenant') THEN ALTER TABLE knowledge_points ADD CONSTRAINT fk_knowledge_points_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_ability_points_tenant') THEN ALTER TABLE ability_points ADD CONSTRAINT fk_ability_points_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_scenarios_tenant') THEN ALTER TABLE scenarios ADD CONSTRAINT fk_scenarios_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_career_positions_tenant') THEN ALTER TABLE career_positions ADD CONSTRAINT fk_career_positions_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE; END IF; END $$;

-- PART 4: career_positions.major_ids → 中间表
CREATE TABLE IF NOT EXISTS career_position_majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    major_id UUID NOT NULL REFERENCES majors(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(career_position_id, major_id)
);
INSERT INTO career_position_majors (career_position_id, major_id)
SELECT cp.id, unnest(cp.major_ids) FROM career_positions cp
WHERE cp.major_ids IS NOT NULL AND array_length(cp.major_ids, 1) > 0
ON CONFLICT (career_position_id, major_id) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_career_position_majors_position ON career_position_majors(career_position_id);
CREATE INDEX IF NOT EXISTS idx_career_position_majors_major ON career_position_majors(major_id);
