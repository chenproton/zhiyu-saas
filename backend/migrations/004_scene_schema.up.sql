-- Phase 3.3: zhiyu-scene schema

CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    code VARCHAR(64) NOT NULL,
    cover_image TEXT,
    career_position_id UUID,
    industry_id VARCHAR(64),
    industry_name VARCHAR(128),
    profession_id UUID,
    profession_name VARCHAR(128),
    batch_id UUID,
    difficulty SMALLINT CHECK(difficulty BETWEEN 1 AND 5),
    version VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL,
    background TEXT,
    delivery_goal TEXT,
    creator_id UUID NOT NULL,
    co_builder_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    publish_time TIMESTAMPTZ,
    view_count INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_scenarios_batch ON scenarios(batch_id);
CREATE INDEX idx_scenarios_status ON scenarios(status);

CREATE TABLE scenario_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    code VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    description TEXT,
    detailed_description TEXT,
    estimated_hours NUMERIC(5,1) NOT NULL DEFAULT 0,
    task_type VARCHAR(16) NOT NULL,
    difficulty SMALLINT CHECK(difficulty BETWEEN 1 AND 5),
    background TEXT,
    dependency_ids UUID[] NOT NULL DEFAULT '{}',
    is_referenced BOOLEAN NOT NULL DEFAULT FALSE,
    source_scenario_id UUID
);

CREATE INDEX idx_scenario_tasks_scenario ON scenario_tasks(scenario_id);

CREATE TABLE task_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    evaluation_points JSONB DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_task_deliverables_task ON task_deliverables(task_id);

CREATE TABLE task_evaluation_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    method_key VARCHAR(32) NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 0,
    eval_objects JSONB DEFAULT '{}',
    eval_subjects JSONB DEFAULT '[]',
    eval_resources JSONB DEFAULT '{}',
    UNIQUE(task_id, method_key)
);

CREATE INDEX idx_task_evaluation_configs_task ON task_evaluation_configs(task_id);

CREATE TABLE task_eval_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES task_evaluation_configs(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    weight NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_score NUMERIC(7,2) NOT NULL DEFAULT 100,
    scoring_method VARCHAR(16) NOT NULL DEFAULT 'score',
    grade_mapping JSONB DEFAULT '{}',
    sub_type VARCHAR(32),
    knowledge_point_ids UUID[] NOT NULL DEFAULT '{}',
    ability_point_ids UUID[] NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_task_eval_points_config ON task_eval_points(config_id);

CREATE TABLE task_review_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES task_evaluation_configs(id) ON DELETE CASCADE,
    label VARCHAR(64) NOT NULL,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    subject_type VARCHAR(32),
    weight NUMERIC(5,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_task_review_steps_config ON task_review_steps(config_id);

CREATE TABLE task_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL,
    url TEXT,
    description TEXT,
    thumbnail TEXT,
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_resource_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES task_resources(id) ON DELETE CASCADE,
    UNIQUE(task_id, resource_id)
);

CREATE INDEX idx_task_resource_bindings_task ON task_resource_bindings(task_id);

CREATE TABLE task_knowledge_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    knowledge_point_id UUID NOT NULL,
    UNIQUE(task_id, knowledge_point_id)
);

CREATE INDEX idx_task_knowledge_bindings_task ON task_knowledge_bindings(task_id);

CREATE TABLE task_ability_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    ability_point_id UUID NOT NULL,
    UNIQUE(task_id, ability_point_id)
);

CREATE INDEX idx_task_ability_bindings_task ON task_ability_bindings(task_id);

CREATE TABLE scenario_weight_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    weight NUMERIC(5,2) NOT NULL,
    UNIQUE(scenario_id, task_id)
);

CREATE INDEX idx_scenario_weight_configs_scenario ON scenario_weight_configs(scenario_id);

CREATE TABLE scenario_grade_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    task_id UUID REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    level VARCHAR(4) NOT NULL,
    min_score NUMERIC(7,2) NOT NULL,
    max_score NUMERIC(7,2) NOT NULL,
    description TEXT,
    color VARCHAR(16)
);

CREATE INDEX idx_scenario_grade_mappings_scenario ON scenario_grade_mappings(scenario_id);

CREATE TABLE scene_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    snapshot_data JSONB NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scene_archives_scenario ON scene_archives(scenario_id);
