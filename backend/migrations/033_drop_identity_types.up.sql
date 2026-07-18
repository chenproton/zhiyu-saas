-- 033: 移除身份类型体系，统一使用角色（roles/user_roles）管理用户身份
-- 决策：现有数据不做迁移（系统未上线），直接删除身份类型表与关联字段。

-- 用户扩展字段的适用范围改为按角色 code 存储
ALTER TABLE user_extension_fields DROP COLUMN IF EXISTS applicable_identity_type_ids;
ALTER TABLE user_extension_fields ADD COLUMN IF NOT EXISTS applicable_role_codes TEXT[] NOT NULL DEFAULT '{}';

-- 删除用户身份类型外键与字段
ALTER TABLE users DROP COLUMN IF EXISTS identity_type_id;

-- 删除身份类型表
DROP TABLE IF EXISTS identity_types;
