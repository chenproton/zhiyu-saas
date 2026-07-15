-- 为没有套餐的现有租户创建默认套餐
INSERT INTO subscription_packages (tenant_id, name, valid_until, modules, status)
SELECT
    t.id,
    '默认全功能套餐',
    NULL,
    '{
        "system": true,
        "alliance": true,
        "career": true,
        "course": true,
        "scene": true,
        "ability": true,
        "affairs": true,
        "ai": true,
        "resource": true,
        "opc": true,
        "decision": true,
        "research": true
    }'::jsonb,
    'active'
FROM tenants t
LEFT JOIN subscription_packages sp ON t.id = sp.tenant_id
WHERE sp.id IS NULL;
