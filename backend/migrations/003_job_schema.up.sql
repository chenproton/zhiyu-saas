-- Phase 3.2: zhiyu-job schema

CREATE TABLE career_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID,
    name VARCHAR(128) NOT NULL,
    short_name VARCHAR(64),
    industry_id UUID,
    major_ids UUID[] NOT NULL DEFAULT '{}',
    position_type VARCHAR(16) NOT NULL,
    salary_min INT,
    salary_max INT,
    cover_image TEXT,
    description TEXT,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    career_path TEXT,
    version VARCHAR(32) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_by UUID NOT NULL,
    collaborators UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_career_positions_batch ON career_positions(batch_id);
CREATE INDEX idx_career_positions_status ON career_positions(status);

CREATE TABLE position_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    url TEXT,
    description TEXT,
    image_url TEXT
);

CREATE INDEX idx_position_certificates_position ON position_certificates(career_position_id);

CREATE TABLE position_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_position_responsibilities_position ON position_responsibilities(career_position_id);

CREATE TABLE ability_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    category VARCHAR(16) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ability_points_category ON ability_points(category);

CREATE TABLE position_ability_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    responsibility_id UUID NOT NULL REFERENCES position_responsibilities(id) ON DELETE CASCADE,
    ability_point_id UUID NOT NULL REFERENCES ability_points(id) ON DELETE CASCADE,
    source VARCHAR(16) NOT NULL DEFAULT 'custom',
    domain VARCHAR(128),
    required_level VARCHAR(8) NOT NULL,
    rubric_description TEXT,
    attributes TEXT[] NOT NULL DEFAULT '{}',
    weight NUMERIC(5,2) NOT NULL DEFAULT 0,
    UNIQUE(career_position_id, responsibility_id, ability_point_id)
);

CREATE INDEX idx_position_ability_bindings_position ON position_ability_bindings(career_position_id);

CREATE TABLE ability_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    binding_ids UUID[] NOT NULL DEFAULT '{}',
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_ability_domains_position ON ability_domains(career_position_id);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64),
    org_node_id UUID,
    major VARCHAR(128),
    workflow_id UUID,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    position_count INT NOT NULL DEFAULT 0,
    published_count INT NOT NULL DEFAULT 0,
    pending_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batches_org_node ON batches(org_node_id);

CREATE TABLE position_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    major VARCHAR(128) NOT NULL,
    career_position_id UUID NOT NULL REFERENCES career_positions(id) ON DELETE CASCADE,
    position_type VARCHAR(16) NOT NULL,
    reason TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_position_recommendations_major ON position_recommendations(major);

CREATE TABLE banner_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learn_roads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    position_ids UUID[] NOT NULL DEFAULT '{}',
    steps JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
