-- 回滚：移除业务模块表的 tenant_id 列

DROP INDEX IF EXISTS idx_scenarios_tenant;
DROP INDEX IF EXISTS idx_scenario_tasks_tenant;
DROP INDEX IF EXISTS idx_scene_batches_tenant;
DROP INDEX IF EXISTS idx_batches_tenant;
DROP INDEX IF EXISTS idx_lesson_batches_tenant;
DROP INDEX IF EXISTS idx_evaluation_batches_tenant;

ALTER TABLE scenarios DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE scenario_tasks DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE scene_batches DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE batches DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE lesson_batches DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE evaluation_batches DROP COLUMN IF EXISTS tenant_id;
