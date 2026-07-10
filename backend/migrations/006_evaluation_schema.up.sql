-- Phase 3.5: zhiyu-evaluation schema

CREATE TABLE question_banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    cover_url TEXT,
    status VARCHAR(16) NOT NULL,
    question_count INT NOT NULL DEFAULT 0,
    creator_id UUID NOT NULL,
    collaborator_ids UUID[] NOT NULL DEFAULT '{}',
    collaborator_dept_ids UUID[] NOT NULL DEFAULT '{}',
    batch_id UUID,
    version VARCHAR(32),
    owner_type VARCHAR(16) NOT NULL,
    is_draft_pool BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_banks_creator ON question_banks(creator_id);
CREATE INDEX idx_question_banks_status ON question_banks(status);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    answer TEXT NOT NULL,
    analysis TEXT,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    difficulty VARCHAR(8),
    knowledge_point_ids UUID[] NOT NULL DEFAULT '{}',
    creator_id UUID,
    source VARCHAR(64),
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_bank ON questions(bank_id);

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    status VARCHAR(16) NOT NULL,
    total_score NUMERIC(7,2) NOT NULL DEFAULT 0,
    duration INT NOT NULL,
    cover_url TEXT,
    creator_id UUID,
    collaborator_ids UUID[] NOT NULL DEFAULT '{}',
    collaborator_dept_ids UUID[] NOT NULL DEFAULT '{}',
    batch_id UUID,
    version VARCHAR(32),
    owner_type VARCHAR(16) NOT NULL DEFAULT 'mine',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exams_status ON exams(status);

CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    type VARCHAR(16) NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    answer TEXT NOT NULL,
    analysis TEXT,
    score NUMERIC(5,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);

CREATE TABLE exam_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration INT,
    target_type VARCHAR(16),
    target_ids UUID[] NOT NULL DEFAULT '{}',
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    creator_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exam_usages_exam ON exam_usages(exam_id);

CREATE TABLE evaluation_method_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE evaluation_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES evaluation_method_categories(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sub_category_name VARCHAR(128),
    description TEXT,
    doc_link TEXT
);

CREATE INDEX idx_evaluation_methods_category ON evaluation_methods(category_id);

CREATE TABLE scene_evaluation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    scene_id UUID,
    method_key VARCHAR(32) NOT NULL,
    evaluatee_id UUID NOT NULL REFERENCES users(id),
    evaluator_id UUID NOT NULL REFERENCES users(id),
    evaluator_type VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    total_score NUMERIC(7,2),
    max_score NUMERIC(7,2) NOT NULL DEFAULT 100,
    eval_point_scores JSONB DEFAULT '{}',
    objective_answers JSONB DEFAULT '{}',
    subjective_content JSONB DEFAULT '{}',
    drawn_questions JSONB DEFAULT '{}',
    comment TEXT,
    graded_at TIMESTAMPTZ,
    graded_by UUID REFERENCES users(id),
    UNIQUE(task_id, evaluatee_id, method_key)
);

CREATE INDEX idx_scene_evaluation_results_task ON scene_evaluation_results(task_id);
CREATE INDEX idx_scene_evaluation_results_evaluatee ON scene_evaluation_results(evaluatee_id);

CREATE TABLE job_ability_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    class_name VARCHAR(128),
    major VARCHAR(128),
    total_ability_points INT NOT NULL DEFAULT 0,
    achieved_ability_points INT NOT NULL DEFAULT 0,
    achievement_rate NUMERIC(5,2),
    grade VARCHAR(4),
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_ability_results_user ON job_ability_results(user_id);

CREATE TABLE certification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL,
    status VARCHAR(16) NOT NULL,
    rule_source VARCHAR(16) NOT NULL DEFAULT 'custom',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_certification_rules_position ON certification_rules(career_position_id);

CREATE TABLE certification_ability_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES certification_rules(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_certification_ability_items_rule ON certification_ability_items(rule_id);

CREATE TABLE certification_ability_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES certification_ability_items(id) ON DELETE CASCADE,
    ability_point_id UUID NOT NULL,
    mapping_type VARCHAR(16) NOT NULL DEFAULT 'inherit',
    custom_level_mapping JSONB DEFAULT '[]',
    required_level VARCHAR(4) NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_certification_ability_points_item ON certification_ability_points(item_id);

CREATE TABLE certification_related_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cert_point_id UUID NOT NULL REFERENCES certification_ability_points(id) ON DELETE CASCADE,
    task_id UUID NOT NULL,
    max_score NUMERIC(7,2) NOT NULL DEFAULT 100,
    weight NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_certification_related_tasks_cert_point ON certification_related_tasks(cert_point_id);

CREATE TABLE student_ability_portraits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    career_position_id UUID NOT NULL,
    overall_grade VARCHAR(4),
    domain_scores JSONB DEFAULT '[]',
    class_rank INT,
    class_total INT,
    major_rank INT,
    major_total INT,
    completed_courses INT NOT NULL DEFAULT 0,
    completed_scenes INT NOT NULL DEFAULT 0,
    total_credits NUMERIC(6,1) NOT NULL DEFAULT 0,
    course_records JSONB DEFAULT '[]',
    graduation_qualified BOOLEAN NOT NULL DEFAULT FALSE,
    attendance_rate NUMERIC(5,2),
    diploma_badge VARCHAR(64),
    dual_badge VARCHAR(64),
    archive_count INT NOT NULL DEFAULT 0,
    recommend_positions JSONB DEFAULT '[]',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_ability_portraits_user ON student_ability_portraits(user_id);

CREATE TABLE student_ability_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    material_type VARCHAR(16) NOT NULL,
    material_name VARCHAR(256) NOT NULL,
    issuing_org VARCHAR(256),
    obtain_date DATE,
    level VARCHAR(32),
    audit_status VARCHAR(16) NOT NULL DEFAULT 'pending',
    audit_remark TEXT,
    converted_credit NUMERIC(5,1) NOT NULL DEFAULT 0,
    direction VARCHAR(16) NOT NULL DEFAULT 'positive',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_ability_archives_user ON student_ability_archives(user_id);

CREATE TABLE graduation_project_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    career_position_id UUID NOT NULL,
    college VARCHAR(128),
    source VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    capacity INT NOT NULL DEFAULT 0,
    applied_count INT NOT NULL DEFAULT 0,
    advisor_id UUID,
    enterprise_mentor_id UUID,
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduation_project_topics_position ON graduation_project_topics(career_position_id);

CREATE TABLE graduation_project_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES graduation_project_topics(id),
    user_id UUID NOT NULL REFERENCES users(id),
    phase VARCHAR(16) NOT NULL,
    doc_status VARCHAR(16) NOT NULL,
    doc_count INT NOT NULL DEFAULT 0,
    has_rectification BOOLEAN NOT NULL DEFAULT FALSE,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduation_project_archives_topic ON graduation_project_archives(topic_id);

CREATE TABLE graduation_project_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES graduation_project_topics(id),
    user_id UUID NOT NULL REFERENCES users(id),
    advisor_score NUMERIC(5,2),
    enterprise_score NUMERIC(5,2),
    defense_score NUMERIC(5,2),
    comprehensive_grade VARCHAR(4),
    is_excellent BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduation_project_evaluations_topic ON graduation_project_evaluations(topic_id);

CREATE TABLE graduation_query_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    class_name VARCHAR(128),
    major_name VARCHAR(128),
    credit_completed NUMERIC(6,1) NOT NULL DEFAULT 0,
    credit_required NUMERIC(6,1) NOT NULL DEFAULT 0,
    scene_passed INT NOT NULL DEFAULT 0,
    scene_required INT NOT NULL DEFAULT 0,
    project_grade VARCHAR(4),
    graduation_status VARCHAR(16) NOT NULL,
    ability_cert_status VARCHAR(16) NOT NULL,
    rectification_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduation_query_results_user ON graduation_query_results(user_id);

CREATE TABLE micro_cert_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    cert_type_id UUID NOT NULL,
    cert_type_name VARCHAR(128),
    content TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cert_issuance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES micro_cert_templates(id),
    user_id UUID NOT NULL REFERENCES users(id),
    cert_number VARCHAR(128) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expire_date DATE,
    status VARCHAR(16) NOT NULL DEFAULT 'issued',
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT
);

CREATE INDEX idx_cert_issuance_records_user ON cert_issuance_records(user_id);

CREATE TABLE credit_conversion_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_type VARCHAR(16) NOT NULL,
    level VARCHAR(32) NOT NULL,
    credit NUMERIC(5,1) NOT NULL
);

CREATE TABLE appeal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(16) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appeal_records_user ON appeal_records(user_id);
