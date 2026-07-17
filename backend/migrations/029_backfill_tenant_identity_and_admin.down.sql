-- 回滚：删除本次迁移新增的管理员用户和身份类型
-- 注意：只回滚通过 up.sql 创建的记录，不删除已有的种子数据

DELETE FROM users WHERE login_name LIKE 'admin-%' AND tenant_id IN (
    SELECT id FROM tenants WHERE id NOT IN (
        SELECT DISTINCT tenant_id FROM identity_types WHERE created_at < NOW() - INTERVAL '1 second'
    )
);

DELETE FROM identity_types WHERE tenant_id IN (
    SELECT id FROM tenants WHERE id IN (
        SELECT tenant_id FROM identity_types GROUP BY tenant_id HAVING COUNT(*) <= 5
    )
) AND code IN ('platform_admin', 'school_admin', 'teacher', 'student', 'enterprise_mentor');
