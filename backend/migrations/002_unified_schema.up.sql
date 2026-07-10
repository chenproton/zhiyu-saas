-- Phase 1: 数据库 & 用户体系重构
-- 目标：创建统一的用户/租户/组织/权限体系，并改造现有 users/institutions 表以兼容新架构

-- ==================== 扩展：工作流 & 审批（共享模块） ====================
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    name VARCHAR(128) NOT NULL,
    scene VARCHAR(64),
    description TEXT,
    steps JSONB NOT NULL DEFAULT '[]',
    usage_count INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approval_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    current_step_idx INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    submitter_id UUID NOT NULL,
    history JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_records_target ON approval_records(target_type, target_id);
CREATE INDEX idx_approval_records_submitter ON approval_records(submitter_id);
CREATE INDEX idx_approval_records_status ON approval_records(status);

-- ==================== 1.1 基础架构表 ====================

-- tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    logo_url TEXT,
    domain VARCHAR(256),
    enterprise_code VARCHAR(64),
    contact VARCHAR(128),
    phone VARCHAR(32),
    address TEXT,
    description TEXT,
    admin_ids UUID[] NOT NULL DEFAULT '{}',
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- org_types
CREATE TABLE org_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(64) NOT NULL,
    category VARCHAR(16) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- organizations (tree)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(128) NOT NULL,
    type_id UUID NOT NULL,
    parent_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    sort_order INT NOT NULL DEFAULT 0,
    member_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX idx_organizations_parent ON organizations(parent_id);

-- identity_types
CREATE TABLE identity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    user_count INT NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_identity_types_tenant_code ON identity_types(tenant_id, code);

-- majors
CREATE TABLE majors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    org_node_id UUID,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    alias VARCHAR(128),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_majors_tenant ON majors(tenant_id);

-- industries (two-level)
CREATE TABLE industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    parent_id UUID REFERENCES industries(id) ON DELETE SET NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_industries_tenant ON industries(tenant_id);
CREATE INDEX idx_industries_parent ON industries(parent_id);

-- resource_codes
CREATE TABLE resource_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    type VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_resource_codes_tenant_code ON resource_codes(tenant_id, code);

-- subscription_packages
CREATE TABLE subscription_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(128) NOT NULL,
    valid_until DATE,
    modules JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_packages_tenant ON subscription_packages(tenant_id);

-- user_extension_fields
CREATE TABLE user_extension_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    field_key VARCHAR(64) NOT NULL,
    field_name VARCHAR(64) NOT NULL,
    field_type VARCHAR(16) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    applicable_identity_type_ids UUID[] NOT NULL DEFAULT '{}',
    slot_number INT NOT NULL CHECK (slot_number BETWEEN 1 AND 20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_extension_fields_tenant_key ON user_extension_fields(tenant_id, field_key);

-- user_relations
CREATE TABLE user_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    initiator_id UUID NOT NULL,
    initiator_org_node_id UUID,
    target_id UUID NOT NULL,
    target_org_node_id UUID,
    relation_type VARCHAR(16) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_relations_initiator ON user_relations(initiator_id);
CREATE INDEX idx_user_relations_target ON user_relations(target_id);

-- graduates
CREATE TABLE graduates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    name VARCHAR(64) NOT NULL,
    student_no VARCHAR(64),
    id_card VARCHAR(32),
    enroll_year INT,
    graduate_year INT,
    major_name VARCHAR(128),
    class_name VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graduates_user ON graduates(user_id);

-- staff_titles
CREATE TABLE staff_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    user_count INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== 1.2 用户权限表 ====================

-- roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    user_count INT NOT NULL DEFAULT 0,
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_roles_tenant_code ON roles(tenant_id, code);

-- user_roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- login_logs
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    user_name VARCHAR(64),
    ip VARCHAR(45),
    location VARCHAR(128),
    device VARCHAR(256),
    status VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_login_logs_user ON login_logs(user_id);
CREATE INDEX idx_login_logs_tenant_created ON login_logs(tenant_id, created_at);

-- operation_logs
CREATE TABLE operation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID,
    user_name VARCHAR(64),
    module VARCHAR(64),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64),
    target_id UUID,
    detail TEXT,
    ip VARCHAR(45),
    status VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_tenant_created ON operation_logs(tenant_id, created_at);

-- ==================== 1.3 平台配置表 ====================

-- app_modules
CREATE TABLE app_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(64) NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    href TEXT,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_app_modules_platform ON app_modules(platform);

-- platform_links
CREATE TABLE platform_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(64) UNIQUE NOT NULL,
    url TEXT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- ==================== 1.4 改造现有 institutions 表 ====================
ALTER TABLE institutions ADD COLUMN IF NOT EXISTS tenant_id UUID;
CREATE INDEX idx_institutions_tenant ON institutions(tenant_id);

-- ==================== 1.5 重建 users 表为统一用户体系 ====================
-- 由于主键类型需要由 VARCHAR 改为 UUID，且现有 users 表未被其他表外键引用，
-- 采用重建方式完成迁移，保留原有商城 role 字段作为过渡兼容。
ALTER TABLE users RENAME TO users_old;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    institution_id VARCHAR(50) REFERENCES institutions(id) ON DELETE SET NULL,
    identity_type_id UUID,
    org_node_id UUID,
    major_id UUID,
    role user_role NOT NULL DEFAULT 'operator',
    login_name VARCHAR(64) UNIQUE,
    username VARCHAR(100), -- 保留原字段作为登录名/学号/工号的冗余
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(32),
    avatar_url TEXT,
    student_no VARCHAR(64),
    work_id VARCHAR(64),
    id_card VARCHAR(32),
    title_ids UUID[] NOT NULL DEFAULT '{}',
    oauth JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_identity_type ON users(identity_type_id);
CREATE INDEX idx_users_org_node ON users(org_node_id);
CREATE INDEX idx_users_major ON users(major_id);

DROP TABLE users_old;

-- ==================== 1.6 外键约束（避免循环依赖，放在最后） ====================
ALTER TABLE org_types ADD CONSTRAINT fk_org_types_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE organizations ADD CONSTRAINT fk_organizations_type FOREIGN KEY (type_id) REFERENCES org_types(id) ON DELETE RESTRICT;
ALTER TABLE identity_types ADD CONSTRAINT fk_identity_types_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE majors ADD CONSTRAINT fk_majors_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE industries ADD CONSTRAINT fk_industries_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE resource_codes ADD CONSTRAINT fk_resource_codes_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE subscription_packages ADD CONSTRAINT fk_subscription_packages_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE user_extension_fields ADD CONSTRAINT fk_user_extension_fields_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE user_relations ADD CONSTRAINT fk_user_relations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE graduates ADD CONSTRAINT fk_graduates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE staff_titles ADD CONSTRAINT fk_staff_titles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE roles ADD CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE login_logs ADD CONSTRAINT fk_login_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE operation_logs ADD CONSTRAINT fk_operation_logs_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE workflows ADD CONSTRAINT fk_workflows_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE approval_records ADD CONSTRAINT fk_approval_records_submitter FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_identity_type FOREIGN KEY (identity_type_id) REFERENCES identity_types(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_org_node FOREIGN KEY (org_node_id) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;
