ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch_id UUID;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_courses_batch') THEN ALTER TABLE courses ADD CONSTRAINT fk_courses_batch FOREIGN KEY (batch_id) REFERENCES lesson_batches(id) ON DELETE SET NULL; END IF; END $$;
CREATE INDEX IF NOT EXISTS idx_courses_batch_id ON courses(batch_id);
ALTER TABLE courses DROP COLUMN IF EXISTS batch_group;
