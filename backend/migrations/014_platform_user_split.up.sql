-- 双平台用户体系隔离：在 users 表增加 platform 字段，按平台拆分登录

-- 1. 新增 platform 字段，默认 saas 以兼容现有商城用户
ALTER TABLE users ADD COLUMN platform VARCHAR(16) NOT NULL DEFAULT 'saas';

-- 2. 移除旧唯一约束，改为联合唯一
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_login_name_key;
ALTER TABLE users ADD CONSTRAINT users_platform_username UNIQUE (platform, username);
ALTER TABLE users ADD CONSTRAINT users_platform_login_name UNIQUE (platform, login_name);

-- 3. 按既有角色/身份分配默认 platform
-- portal 侧：教师、学生（role='school' 且 identity_type 为 teacher/student）
UPDATE users
SET platform = 'portal'
WHERE role = 'school'
  AND identity_type_id IN (
    SELECT id FROM identity_types WHERE code IN ('teacher', 'student')
  );

-- 4. 创建索引
CREATE INDEX idx_users_platform ON users(platform);
CREATE INDEX idx_users_platform_username ON users(platform, username);
