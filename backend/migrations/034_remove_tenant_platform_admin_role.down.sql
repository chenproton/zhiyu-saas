-- 回滚：为所有普通租户重新创建 platform_admin 角色（绑定关系不可恢复）

INSERT INTO roles (id, tenant_id, code, name, description, permissions, user_count, status, created_at)
SELECT gen_random_uuid(), t.id, 'platform_admin', '平台管理员', '', '{"admin": true}'::jsonb, 0, 'active', NOW()
FROM tenants t
WHERE t.id <> '11111111-1111-1111-1111-111111111111'
  AND NOT EXISTS (
    SELECT 1 FROM roles r WHERE r.tenant_id = t.id AND r.code = 'platform_admin'
  );
