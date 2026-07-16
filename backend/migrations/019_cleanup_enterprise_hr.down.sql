-- 恢复 enterprise_hr 身份类型与角色

-- 1. 恢复 enterprise_hr 身份类型
INSERT INTO identity_types (id, tenant_id, code, name, description, user_count, is_system, created_at)
SELECT '41111111-1111-1111-1111-111111111115', id, 'enterprise_hr', '企业人事', '', 0, true, NOW()
FROM tenants
ON CONFLICT DO NOTHING;

-- 2. 恢复 enterprise_hr 角色
INSERT INTO roles (id, tenant_id, code, name, description, permissions, user_count, status, created_at)
SELECT '61111111-1111-1111-1111-111111111115', id, 'enterprise_hr', '企业人事', '', '{"enterpriseHR": true}', 0, 'active', NOW()
FROM tenants
ON CONFLICT DO NOTHING;
