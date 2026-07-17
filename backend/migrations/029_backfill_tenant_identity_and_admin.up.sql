-- 为所有缺少身份类型的租户创建系统身份类型
DO $$
DECLARE
    tenant record;
BEGIN
    FOR tenant IN
        SELECT id FROM tenants
        WHERE id NOT IN (SELECT DISTINCT tenant_id FROM identity_types)
    LOOP
        INSERT INTO identity_types (id, tenant_id, code, name, description, user_count, is_system, created_at)
        VALUES
            (gen_random_uuid(), tenant.id, 'platform_admin', '平台管理员', NULL, 0, true, NOW()),
            (gen_random_uuid(), tenant.id, 'school_admin',   '学校管理员', NULL, 0, true, NOW()),
            (gen_random_uuid(), tenant.id, 'teacher',        '教师',       NULL, 0, true, NOW()),
            (gen_random_uuid(), tenant.id, 'student',        '学生',       NULL, 0, true, NOW()),
            (gen_random_uuid(), tenant.id, 'enterprise_mentor', '企业导师', NULL, 0, true, NOW());
    END LOOP;
END $$;

-- 为已有身份类型但缺少管理员用户的租户创建默认 school_admin 用户
DO $$
DECLARE
    tenant record;
    school_it_id uuid;
    admin_id uuid;
BEGIN
    FOR tenant IN
        SELECT t.id, t.name FROM tenants t
        WHERE (t.admin_ids IS NULL OR array_length(t.admin_ids, 1) IS NULL)
          AND EXISTS (SELECT 1 FROM identity_types WHERE tenant_id = t.id AND code = 'school_admin')
    LOOP
        SELECT id INTO school_it_id FROM identity_types
        WHERE tenant_id = tenant.id AND code = 'school_admin' LIMIT 1;

        admin_id := gen_random_uuid();
        INSERT INTO users (id, tenant_id, institution_id, identity_type_id, org_node_id, major_id,
            role, platform, login_name, username, password_hash, name, email, phone, avatar_url,
            student_no, work_id, id_card, title_ids, oauth, status)
        VALUES (admin_id, tenant.id, NULL, school_it_id, NULL, NULL,
            'school', 'portal',
            'admin-' || tenant.id::text,
            'admin-' || tenant.id::text,
            '$2a$10$cg21n3Zs/C1ZYJ6fQ49MwuwvFsGVweCckG40Z3HWcZ20I1VWSepqC',
            tenant.name || '管理员', NULL, NULL, NULL, NULL, NULL, NULL, '{}'::uuid[], '{}', 'active');

        UPDATE tenants SET admin_ids = ARRAY[admin_id] WHERE id = tenant.id;
    END LOOP;
END $$;

-- 修复已有 admin-* 无主用户：关联到拥有 school_admin 身份类型的第一个租户
DO $$
DECLARE
    target_tenant_id uuid;
BEGIN
    SELECT it.tenant_id INTO target_tenant_id FROM identity_types it
    WHERE it.code = 'school_admin'
    ORDER BY it.created_at ASC
    LIMIT 1;

    IF target_tenant_id IS NOT NULL THEN
        UPDATE users
        SET tenant_id = target_tenant_id,
            identity_type_id = (
                SELECT id FROM identity_types
                WHERE tenant_id = target_tenant_id AND code = 'school_admin' LIMIT 1
            )
        WHERE platform = 'portal'
          AND tenant_id IS NULL
          AND identity_type_id IS NULL;
    END IF;
END $$;
