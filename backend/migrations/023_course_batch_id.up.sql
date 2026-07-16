-- Convert courses.batch_group (VARCHAR) to batch_id (UUID FK → lesson_batches)
ALTER TABLE courses ADD COLUMN batch_id UUID;
UPDATE courses SET batch_id = batch_group::uuid
WHERE batch_group IS NOT NULL AND batch_group != '';
ALTER TABLE courses ADD CONSTRAINT fk_courses_batch FOREIGN KEY (batch_id) REFERENCES lesson_batches(id) ON DELETE SET NULL;
CREATE INDEX idx_courses_batch_id ON courses(batch_id);
ALTER TABLE courses DROP COLUMN batch_group;
