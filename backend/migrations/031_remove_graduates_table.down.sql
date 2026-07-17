CREATE TABLE graduates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    name VARCHAR(64) NOT NULL,
    student_no VARCHAR(64),
    id_card VARCHAR(32),
    enroll_year INT,
    graduate_year INT,
    major_id UUID,
    major_name VARCHAR(128),
    class_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduates_user ON graduates(user_id);

ALTER TABLE graduates ADD CONSTRAINT fk_graduates_tenant
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

INSERT INTO graduates (id, tenant_id, user_id, name, student_no, id_card, enroll_year, graduate_year, major_id, class_name, created_at)
SELECT gen_random_uuid(), u.tenant_id, u.id, u.name, u.student_no, u.id_card, NULL, u.graduate_year, u.major_id, NULL, NOW()
FROM users u
WHERE u.status = 'graduated' AND u.tenant_id IS NOT NULL;

UPDATE users u SET
    status = 'active',
    graduate_year = NULL
FROM graduates g
WHERE g.user_id = u.id;

ALTER TABLE users DROP COLUMN IF EXISTS graduate_year;
