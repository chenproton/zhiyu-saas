-- Convert courses.batch_group (VARCHAR) to batch_id (UUID FK → lesson_batches)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch_id UUID;
-- batch_group contains descriptive text, cannot cast to UUID; set to NULL
ALTER TABLE courses ADD CONSTRAINT IF NOT EXISTS fk_courses_batch FOREIGN KEY (batch_id) REFERENCES lesson_batches(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_courses_batch_id ON courses(batch_id);
ALTER TABLE courses DROP COLUMN IF EXISTS batch_group;
