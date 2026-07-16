ALTER TABLE courses ADD COLUMN batch_group VARCHAR(128);
UPDATE courses SET batch_group = batch_id::text WHERE batch_id IS NOT NULL;
ALTER TABLE courses DROP CONSTRAINT fk_courses_batch;
DROP INDEX IF EXISTS idx_courses_batch_id;
ALTER TABLE courses DROP COLUMN batch_id;
