-- Phase 3.4: zhiyu-lesson schema

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(16) NOT NULL,
    category VARCHAR(32) NOT NULL,
    major VARCHAR(128),
    teacher_id UUID,
    industry VARCHAR(128),
    version VARCHAR(32),
    online_hours NUMERIC(5,1),
    offline_hours NUMERIC(5,1),
    online_weight NUMERIC(5,2),
    offline_weight NUMERIC(5,2),
    semester VARCHAR(32),
    class_name VARCHAR(128),
    status VARCHAR(16) NOT NULL,
    cover_color VARCHAR(16),
    cover_image TEXT,
    course_tag VARCHAR(64),
    creator_id UUID NOT NULL,
    co_creator_ids UUID[] NOT NULL DEFAULT '{}',
    batch_group VARCHAR(128),
    node_count INT NOT NULL DEFAULT 0,
    resource_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    study_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_type ON courses(type);

CREATE TABLE knowledge_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    code VARCHAR(64),
    description TEXT,
    linked BOOLEAN NOT NULL DEFAULT FALSE,
    granular_lesson_ids UUID[] NOT NULL DEFAULT '{}',
    creator_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_points_creator ON knowledge_points(creator_id);

CREATE TABLE system_course_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES system_course_nodes(id) ON DELETE SET NULL,
    name VARCHAR(256) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    ref_type VARCHAR(16) NOT NULL DEFAULT 'normal',
    source_id UUID,
    source_name VARCHAR(256),
    teaching_goals TEXT,
    duration INT,
    knowledge_point_ids UUID[] NOT NULL DEFAULT '{}',
    resource_ids UUID[] NOT NULL DEFAULT '{}',
    status VARCHAR(16) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_course_nodes_course ON system_course_nodes(course_id);
CREATE INDEX idx_system_course_nodes_parent ON system_course_nodes(parent_id);

CREATE TABLE node_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    type VARCHAR(16) NOT NULL,
    time_limit INT
);

CREATE INDEX idx_node_quizzes_node ON node_quizzes(node_id);

CREATE TABLE node_quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES node_quizzes(id) ON DELETE CASCADE,
    type VARCHAR(16) NOT NULL,
    question TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_node_quiz_questions_quiz ON node_quiz_questions(quiz_id);

CREATE TABLE node_homeworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    title VARCHAR(256) NOT NULL,
    requirement TEXT,
    need_attachment BOOLEAN NOT NULL DEFAULT FALSE,
    deadline TIMESTAMPTZ
);

CREATE INDEX idx_node_homeworks_node ON node_homeworks(node_id);

CREATE TABLE hybrid_node_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    module_key VARCHAR(32) NOT NULL,
    mode VARCHAR(8) NOT NULL DEFAULT 'online',
    data JSONB NOT NULL DEFAULT '{}',
    UNIQUE(node_id, module_key)
);

CREATE INDEX idx_hybrid_node_modules_node ON hybrid_node_modules(node_id);

CREATE TABLE node_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES system_course_nodes(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    type VARCHAR(32) NOT NULL,
    url TEXT NOT NULL,
    size INT
);

CREATE INDEX idx_node_resources_node ON node_resources(node_id);

CREATE TABLE course_knowledge_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    knowledge_point_id UUID NOT NULL REFERENCES knowledge_points(id) ON DELETE CASCADE,
    bind_type VARCHAR(16) NOT NULL,
    source_id UUID,
    UNIQUE(course_id, knowledge_point_id, bind_type, source_id)
);

CREATE INDEX idx_course_knowledge_bindings_course ON course_knowledge_bindings(course_id);
