-- Phase 3.5 extension: evaluation batch management
CREATE TABLE evaluation_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64),
    org_node_id UUID,
    major VARCHAR(128),
    workflow_id UUID,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evaluation_batches_org_node ON evaluation_batches(org_node_id);
CREATE INDEX idx_evaluation_batches_status ON evaluation_batches(status);
