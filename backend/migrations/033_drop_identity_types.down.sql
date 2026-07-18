-- 回滚：恢复身份类型表结构与关联字段（仅恢复 schema，数据不可恢复）

CREATE TABLE IF NOT EXISTS identity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    user_count INT NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_identity_types_tenant_code ON identity_types(tenant_id, code);

ALTER TABLE identity_types ADD CONSTRAINT fk_identity_types_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_type_id UUID;
ALTER TABLE users ADD CONSTRAINT fk_users_identity_type FOREIGN KEY (identity_type_id) REFERENCES identity_types(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_identity_type ON users(identity_type_id);

ALTER TABLE user_extension_fields DROP COLUMN IF EXISTS applicable_role_codes;
ALTER TABLE user_extension_fields ADD COLUMN IF NOT EXISTS applicable_identity_type_ids UUID[] NOT NULL DEFAULT '{}';
