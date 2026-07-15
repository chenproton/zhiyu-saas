-- 为业务模块表补充租户隔离字段，并回填已有数据

ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE scenario_tasks ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE scene_batches ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE lesson_batches ADD COLUMN IF NOT EXISTS tenant_id UUID;
ALTER TABLE evaluation_batches ADD COLUMN IF NOT EXISTS tenant_id UUID;

CREATE INDEX IF NOT EXISTS idx_scenarios_tenant ON scenarios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scenario_tasks_tenant ON scenario_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_scene_batches_tenant ON scene_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_batches_tenant ON batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lesson_batches_tenant ON lesson_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_batches_tenant ON evaluation_batches(tenant_id);

-- 回填 scenario 的 tenant_id：通过 creator_id 关联到用户所属租户
UPDATE scenarios s
SET tenant_id = u.tenant_id
FROM users u
WHERE s.creator_id = u.id
  AND s.tenant_id IS NULL;

-- 回填 scenario_task 的 tenant_id：通过 scenario_id 继承
UPDATE scenario_tasks t
SET tenant_id = s.tenant_id
FROM scenarios s
WHERE t.scenario_id = s.id
  AND t.tenant_id IS NULL;

-- 回填 batches：当前所有批次均属于默认租户
UPDATE scene_batches SET tenant_id = '11111111-1111-1111-1111-111111111111' WHERE tenant_id IS NULL;
UPDATE batches SET tenant_id = '11111111-1111-1111-1111-111111111111' WHERE tenant_id IS NULL;
UPDATE lesson_batches SET tenant_id = '11111111-1111-1111-1111-111111111111' WHERE tenant_id IS NULL;
UPDATE evaluation_batches SET tenant_id = '11111111-1111-1111-1111-111111111111' WHERE tenant_id IS NULL;
