-- Phase 3.3 extension: scene batch management
CREATE TABLE scene_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64),
    org_node_id UUID,
    major VARCHAR(128),
    workflow_id UUID,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    scenario_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scene_batches_org_node ON scene_batches(org_node_id);
CREATE INDEX idx_scene_batches_status ON scene_batches(status);
