-- Phase 1: 数据库 & 用户体系重构 - 回滚

-- 删除 users 表外键
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_tenant;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_identity_type;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_org_node;
ALTER TABLE users DROP CONSTRAINT IF EXISTS fk_users_major;

-- 删除其他表外键
ALTER TABLE org_types DROP CONSTRAINT IF EXISTS fk_org_types_tenant;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS fk_organizations_tenant;
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS fk_organizations_type;
ALTER TABLE identity_types DROP CONSTRAINT IF EXISTS fk_identity_types_tenant;
ALTER TABLE majors DROP CONSTRAINT IF EXISTS fk_majors_tenant;
ALTER TABLE industries DROP CONSTRAINT IF EXISTS fk_industries_tenant;
ALTER TABLE resource_codes DROP CONSTRAINT IF EXISTS fk_resource_codes_tenant;
ALTER TABLE subscription_packages DROP CONSTRAINT IF EXISTS fk_subscription_packages_tenant;
ALTER TABLE user_extension_fields DROP CONSTRAINT IF EXISTS fk_user_extension_fields_tenant;
ALTER TABLE user_relations DROP CONSTRAINT IF EXISTS fk_user_relations_tenant;
ALTER TABLE graduates DROP CONSTRAINT IF EXISTS fk_graduates_tenant;
ALTER TABLE staff_titles DROP CONSTRAINT IF EXISTS fk_staff_titles_tenant;
ALTER TABLE roles DROP CONSTRAINT IF EXISTS fk_roles_tenant;
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS fk_user_roles_user;
ALTER TABLE login_logs DROP CONSTRAINT IF EXISTS fk_login_logs_tenant;
ALTER TABLE operation_logs DROP CONSTRAINT IF EXISTS fk_operation_logs_tenant;
ALTER TABLE workflows DROP CONSTRAINT IF EXISTS fk_workflows_tenant;
ALTER TABLE approval_records DROP CONSTRAINT IF EXISTS fk_approval_records_submitter;

-- 删除新表
DROP TABLE IF EXISTS approval_records;
DROP TABLE IF EXISTS workflows;
DROP TABLE IF EXISTS platform_links;
DROP TABLE IF EXISTS app_modules;
DROP TABLE IF EXISTS operation_logs;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS staff_titles;
DROP TABLE IF EXISTS graduates;
DROP TABLE IF EXISTS user_relations;
DROP TABLE IF EXISTS user_extension_fields;
DROP TABLE IF EXISTS subscription_packages;
DROP TABLE IF EXISTS resource_codes;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS majors;
DROP TABLE IF EXISTS identity_types;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS org_types;
DROP TABLE IF EXISTS tenants;

-- 恢复旧 users 表结构
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) REFERENCES institutions(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 移除 institutions.tenant_id
ALTER TABLE institutions DROP COLUMN IF EXISTS tenant_id;
