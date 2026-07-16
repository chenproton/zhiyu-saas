-- ============================================================
-- 026_view_logs_and_cleanup
-- view_count 静态存储 → 访问日志实时统计
-- ============================================================

-- PART 1: 建统一的访问日志表
CREATE TABLE view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(32) NOT NULL,
    target_id UUID NOT NULL,
    user_id UUID,
    tenant_id UUID,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_view_logs_target ON view_logs(target_type, target_id);
CREATE INDEX idx_view_logs_viewed ON view_logs(viewed_at DESC);

-- PART 2: 历史数据迁移（跳过—旧 ID 为 VARCHAR 与 UUID 不兼容，由 027 之后重建）

-- PART 3: 删除静态 view_count 列
ALTER TABLE resources DROP COLUMN view_count;
ALTER TABLE scenarios DROP COLUMN view_count;
ALTER TABLE courses DROP COLUMN view_count;
