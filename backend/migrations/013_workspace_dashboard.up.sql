-- Phase 3.6: portal workspace dashboard data sources

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    type VARCHAR(16) NOT NULL DEFAULT '通知',
    target_roles VARCHAR(16)[] NOT NULL DEFAULT '{}',
    is_new BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_roles ON announcements USING GIN (target_roles);
CREATE INDEX idx_announcements_created ON announcements(created_at DESC);
