-- ============================================================
-- 022_unify_major_industry_refs
-- 将全系统 major / industry 的 VARCHAR 字段统一为 UUID FK
-- ============================================================

-- ============================================================
-- PART 1: 专业 major → major_id
-- ============================================================

-- 1. career_positions (job 模块，已有 industry_id UUID)
-- major_ids UUID[] 数组保留，无法加 FK，但格式本身已是 UUID

-- 2. batches（job 批次）
ALTER TABLE batches ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE batches ADD CONSTRAINT fk_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 3. position_recommendations（岗位推荐）
ALTER TABLE position_recommendations ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE position_recommendations t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE position_recommendations ADD CONSTRAINT fk_position_recommendations_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 4. courses（课程）
ALTER TABLE courses ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE courses t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE courses ADD CONSTRAINT fk_courses_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 5. lesson_batches（课程批次）
ALTER TABLE lesson_batches ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE lesson_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE lesson_batches ADD CONSTRAINT fk_lesson_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 6. scene_batches（场景批次）
ALTER TABLE scene_batches ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE scene_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE scene_batches ADD CONSTRAINT fk_scene_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 7. evaluation_batches（评测批次）
ALTER TABLE evaluation_batches ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE evaluation_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE evaluation_batches ADD CONSTRAINT fk_evaluation_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 8. exam_usages（考试安排）
ALTER TABLE exam_usages ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE exam_usages t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE exam_usages ADD CONSTRAINT fk_exam_usages_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 9. exam_results（考试成绩）
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE exam_results t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE exam_results ADD CONSTRAINT fk_exam_results_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 10. job_ability_results（岗位能力结果）
ALTER TABLE job_ability_results ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE job_ability_results t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE job_ability_results ADD CONSTRAINT fk_job_ability_results_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- 11. certification_grade_leaderboard（认证排行榜）
ALTER TABLE certification_grade_leaderboard ADD COLUMN IF NOT EXISTS major_id UUID;
UPDATE certification_grade_leaderboard t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1)
WHERE t.major IS NOT NULL AND t.major != '';
ALTER TABLE certification_grade_leaderboard ADD CONSTRAINT fk_certification_grade_leaderboard_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL;

-- ============================================================
-- PART 2: 课程表也把 industry VARCHAR 改为 industry_id UUID
-- ============================================================

ALTER TABLE courses ADD COLUMN IF NOT EXISTS industry_id UUID;
UPDATE courses t SET industry_id = (SELECT id FROM industries i WHERE i.name = t.industry LIMIT 1)
WHERE t.industry IS NOT NULL AND t.industry != '';
ALTER TABLE courses ADD CONSTRAINT fk_courses_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL;

-- ============================================================
-- PART 3: 删除旧 VARCHAR 列
-- ============================================================

ALTER TABLE batches DROP COLUMN IF EXISTS major;
ALTER TABLE position_recommendations DROP COLUMN IF EXISTS major;
ALTER TABLE courses DROP COLUMN IF EXISTS major;
ALTER TABLE courses DROP COLUMN IF EXISTS industry;
ALTER TABLE lesson_batches DROP COLUMN IF EXISTS major;
ALTER TABLE scene_batches DROP COLUMN IF EXISTS major;
ALTER TABLE evaluation_batches DROP COLUMN IF EXISTS major;
ALTER TABLE exam_usages DROP COLUMN IF EXISTS major;
ALTER TABLE exam_results DROP COLUMN IF EXISTS major;
ALTER TABLE job_ability_results DROP COLUMN IF EXISTS major;
ALTER TABLE certification_grade_leaderboard DROP COLUMN IF EXISTS major;
