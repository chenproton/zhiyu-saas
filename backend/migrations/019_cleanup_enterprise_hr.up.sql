-- 清理已废弃的 enterprise_hr 身份类型与角色
-- enterprise_hr 已合并为 enterprise_mentor

-- 1. 将引用 enterprise_hr 的用户迁到 enterprise_mentor
UPDATE users
SET identity_type_id = '41111111-1111-1111-1111-111111111116'
WHERE identity_type_id = '41111111-1111-1111-1111-111111111115';

-- 2. 删除 enterprise_hr 角色
DELETE FROM roles WHERE id = '61111111-1111-1111-1111-111111111115';

-- 3. 删除 enterprise_hr 身份类型（外键 ON DELETE SET NULL，安全）
DELETE FROM identity_types WHERE id = '41111111-1111-1111-1111-111111111115';
