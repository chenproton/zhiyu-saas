-- 回滚：恢复 login_name 全局唯一（双平台拆分前）

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_platform_login_name;
ALTER TABLE users ADD CONSTRAINT users_login_name_key UNIQUE (login_name);
