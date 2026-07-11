-- Phase 3.4 extension: lesson batch management
CREATE TABLE IF NOT EXISTS lesson_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64),
    org_node_id UUID,
    major VARCHAR(128),
    workflow_id UUID,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    course_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_batches_org_node ON lesson_batches(org_node_id);
CREATE INDEX IF NOT EXISTS idx_lesson_batches_status ON lesson_batches(status);
