-- ============================================================
-- 025_cleanup_arrays_and_constraints (幂等版)
-- ============================================================

-- PART 1: 删除已有中间表的冗余 UUID[] 数组
ALTER TABLE scenario_tasks DROP COLUMN IF EXISTS knowledge_point_ids;
ALTER TABLE scenario_tasks DROP COLUMN IF EXISTS ability_point_ids;

-- PART 2: career_positions.major_ids → career_position_majors（已有中间表）
ALTER TABLE career_positions DROP COLUMN IF EXISTS major_ids;

-- PART 3: 为剩余的 UUID[] 数组建中间表
CREATE TABLE IF NOT EXISTS node_knowledge_point_bindings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE, knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(node_id, knowledge_point_id));
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_course_nodes' AND column_name='knowledge_point_ids') THEN INSERT INTO node_knowledge_point_bindings (node_id, knowledge_point_id) SELECT id, unnest(knowledge_point_ids) FROM system_course_nodes WHERE knowledge_point_ids IS NOT NULL AND array_length(knowledge_point_ids, 1) > 0 ON CONFLICT DO NOTHING; END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_nkpb_node ON node_knowledge_point_bindings(node_id);
ALTER TABLE system_course_nodes DROP COLUMN IF EXISTS knowledge_point_ids;

CREATE TABLE IF NOT EXISTS node_resource_bindings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE, resource_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(node_id, resource_id));
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='system_course_nodes' AND column_name='resource_ids') THEN INSERT INTO node_resource_bindings (node_id, resource_id) SELECT id, unnest(resource_ids) FROM system_course_nodes WHERE resource_ids IS NOT NULL AND array_length(resource_ids, 1) > 0 ON CONFLICT DO NOTHING; END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_nrb_node ON node_resource_bindings(node_id);
ALTER TABLE system_course_nodes DROP COLUMN IF EXISTS resource_ids;

CREATE TABLE IF NOT EXISTS question_bank_knowledge_points (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), question_bank_id UUID NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE, knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(question_bank_id, knowledge_point_id));
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_banks' AND column_name='knowledge_point_ids') THEN INSERT INTO question_bank_knowledge_points (question_bank_id, knowledge_point_id) SELECT id, unnest(knowledge_point_ids) FROM question_banks WHERE knowledge_point_ids IS NOT NULL AND array_length(knowledge_point_ids, 1) > 0 ON CONFLICT DO NOTHING; END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_qbkp_bank ON question_bank_knowledge_points(question_bank_id);
ALTER TABLE question_banks DROP COLUMN IF EXISTS knowledge_point_ids;

CREATE TABLE IF NOT EXISTS evaluation_method_targets (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), evaluation_method_id UUID NOT NULL REFERENCES evaluation_methods(id) ON DELETE CASCADE, target_id UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(evaluation_method_id, target_id));
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evaluation_methods' AND column_name='target_ids') THEN INSERT INTO evaluation_method_targets (evaluation_method_id, target_id) SELECT id, unnest(target_ids) FROM evaluation_methods WHERE target_ids IS NOT NULL AND array_length(target_ids, 1) > 0 ON CONFLICT DO NOTHING; END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_emt_method ON evaluation_method_targets(evaluation_method_id);
ALTER TABLE evaluation_methods DROP COLUMN IF EXISTS target_ids;

-- PART 4: 移除 scenario_handler 存储的冗余 industry_name
ALTER TABLE scenarios DROP COLUMN IF EXISTS industry_name;

-- PART 5: 补充 UNIQUE 约束
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uq_certification_rules_position') THEN ALTER TABLE certification_rules ADD CONSTRAINT uq_certification_rules_position UNIQUE(career_position_id); END IF; END $$;

-- PART 6: 补充缺失的 updated_at
ALTER TABLE certification_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE student_ability_portraits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
