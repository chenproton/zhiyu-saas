-- ============================================================
-- 025_cleanup_arrays_and_constraints
-- 最佳实践：消除 UUID[] 数组、补 UNIQUE、加 updated_at
-- ============================================================

-- ============================================================
-- PART 1: 删除已有中间表的冗余 UUID[] 数组
-- ============================================================
ALTER TABLE scenario_tasks DROP COLUMN IF EXISTS knowledge_point_ids;
ALTER TABLE scenario_tasks DROP COLUMN IF EXISTS ability_point_ids;

-- ============================================================
-- PART 2: career_positions.major_ids → career_position_majors（已有中间表）
-- ============================================================
ALTER TABLE career_positions DROP COLUMN major_ids;

-- ============================================================
-- PART 3: 为剩余的 UUID[] 数组建中间表
-- ============================================================

-- 3a. 课程节点 ↔ 知识点
CREATE TABLE node_knowledge_point_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(node_id, knowledge_point_id)
);
INSERT INTO node_knowledge_point_bindings (node_id, knowledge_point_id)
SELECT id AS node_id, unnest(knowledge_point_ids) AS knowledge_point_id
FROM system_course_nodes WHERE knowledge_point_ids IS NOT NULL AND array_length(knowledge_point_ids, 1) > 0
ON CONFLICT (node_id, knowledge_point_id) DO NOTHING;
CREATE INDEX idx_nkpb_node ON node_knowledge_point_bindings(node_id);
ALTER TABLE system_course_nodes DROP COLUMN knowledge_point_ids;

-- 3b. 课程节点 ↔ 资源
CREATE TABLE node_resource_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(node_id, resource_id)
);
INSERT INTO node_resource_bindings (node_id, resource_id)
SELECT id AS node_id, unnest(resource_ids) AS resource_id
FROM system_course_nodes WHERE resource_ids IS NOT NULL AND array_length(resource_ids, 1) > 0
ON CONFLICT (node_id, resource_id) DO NOTHING;
CREATE INDEX idx_nrb_node ON node_resource_bindings(node_id);
ALTER TABLE system_course_nodes DROP COLUMN resource_ids;

-- 3c. 题库 ↔ 知识点
CREATE TABLE question_bank_knowledge_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_bank_id UUID NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
    knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(question_bank_id, knowledge_point_id)
);
INSERT INTO question_bank_knowledge_points (question_bank_id, knowledge_point_id)
SELECT id AS question_bank_id, unnest(knowledge_point_ids) AS knowledge_point_id
FROM question_banks WHERE knowledge_point_ids IS NOT NULL AND array_length(knowledge_point_ids, 1) > 0
ON CONFLICT (question_bank_id, knowledge_point_id) DO NOTHING;
CREATE INDEX idx_qbkp_bank ON question_bank_knowledge_points(question_bank_id);
ALTER TABLE question_banks DROP COLUMN knowledge_point_ids;

-- 3d. 测评方式 ↔ 目标
CREATE TABLE evaluation_method_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_method_id UUID NOT NULL REFERENCES evaluation_methods(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(evaluation_method_id, target_id)
);
INSERT INTO evaluation_method_targets (evaluation_method_id, target_id)
SELECT id AS evaluation_method_id, unnest(target_ids) AS target_id
FROM evaluation_methods WHERE target_ids IS NOT NULL AND array_length(target_ids, 1) > 0
ON CONFLICT (evaluation_method_id, target_id) DO NOTHING;
CREATE INDEX idx_emt_method ON evaluation_method_targets(evaluation_method_id);
ALTER TABLE evaluation_methods DROP COLUMN target_ids;

-- ============================================================
-- PART 4: 移除 scenario_handler 存储的冗余 industry_name
-- ============================================================
ALTER TABLE scenarios DROP COLUMN IF EXISTS industry_name;

-- ============================================================
-- PART 5: 补充 UNIQUE 约束
-- ============================================================
ALTER TABLE certification_rules ADD CONSTRAINT uq_certification_rules_position UNIQUE(career_position_id);

-- ============================================================
-- PART 6: 补充缺失的 updated_at
-- ============================================================
ALTER TABLE certification_rules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE student_ability_portraits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
