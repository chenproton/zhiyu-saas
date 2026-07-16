-- ============================================================
-- 022_unify_major_industry_refs (幂等版)
-- 将全系统 major / industry 的 VARCHAR 字段统一为 UUID FK
-- ============================================================

-- PART 1: 添加 FK 列（如果不存在）
ALTER TABLE batches ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE position_recommendations ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE lesson_batches ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE scene_batches ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE evaluation_batches ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE exam_usages ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE exam_results ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE job_ability_results ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE certification_grade_leaderboard ADD COLUMN IF NOT EXISTS major_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS industry_id UUID;

-- PART 2: 迁移数据（仅在旧列存在时执行）
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='batches' AND column_name='major') THEN UPDATE batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='position_recommendations' AND column_name='major') THEN UPDATE position_recommendations t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='major') THEN UPDATE courses t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lesson_batches' AND column_name='major') THEN UPDATE lesson_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scene_batches' AND column_name='major') THEN UPDATE scene_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='evaluation_batches' AND column_name='major') THEN UPDATE evaluation_batches t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_usages' AND column_name='major') THEN UPDATE exam_usages t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exam_results' AND column_name='major') THEN UPDATE exam_results t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_ability_results' AND column_name='major') THEN UPDATE job_ability_results t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='certification_grade_leaderboard' AND column_name='major') THEN UPDATE certification_grade_leaderboard t SET major_id = (SELECT id FROM majors m WHERE m.name = t.major LIMIT 1) WHERE t.major IS NOT NULL AND t.major != ''; END IF; END $$;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='industry') THEN UPDATE courses t SET industry_id = (SELECT id FROM industries i WHERE i.name = t.industry LIMIT 1) WHERE t.industry IS NOT NULL AND t.industry != ''; END IF; END $$;

-- PART 3: 添加 FK 约束（用 DO 块跳过已存在的）
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_batches_major') THEN ALTER TABLE batches ADD CONSTRAINT fk_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_position_recommendations_major') THEN ALTER TABLE position_recommendations ADD CONSTRAINT fk_position_recommendations_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_courses_major') THEN ALTER TABLE courses ADD CONSTRAINT fk_courses_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_lesson_batches_major') THEN ALTER TABLE lesson_batches ADD CONSTRAINT fk_lesson_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_scene_batches_major') THEN ALTER TABLE scene_batches ADD CONSTRAINT fk_scene_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_evaluation_batches_major') THEN ALTER TABLE evaluation_batches ADD CONSTRAINT fk_evaluation_batches_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_exam_usages_major') THEN ALTER TABLE exam_usages ADD CONSTRAINT fk_exam_usages_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_exam_results_major') THEN ALTER TABLE exam_results ADD CONSTRAINT fk_exam_results_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_job_ability_results_major') THEN ALTER TABLE job_ability_results ADD CONSTRAINT fk_job_ability_results_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_certification_grade_leaderboard_major') THEN ALTER TABLE certification_grade_leaderboard ADD CONSTRAINT fk_certification_grade_leaderboard_major FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE SET NULL; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_courses_industry') THEN ALTER TABLE courses ADD CONSTRAINT fk_courses_industry FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE SET NULL; END IF; END $$;

-- PART 4: 删除旧 VARCHAR 列
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
