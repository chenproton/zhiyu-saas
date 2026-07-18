-- 034: platform_admin 为跨租户运营角色，仅保留在运营方租户，清除普通租户中的 platform_admin 角色
-- （user_roles 通过外键级联删除绑定）

DELETE FROM roles
WHERE code = 'platform_admin'
  AND tenant_id <> '11111111-1111-1111-1111-111111111111';
