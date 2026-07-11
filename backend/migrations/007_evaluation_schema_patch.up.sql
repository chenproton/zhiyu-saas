-- Patch: add missing collaborator_dept_ids columns to evaluation tables
ALTER TABLE question_banks ADD COLUMN IF NOT EXISTS collaborator_dept_ids UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS collaborator_dept_ids UUID[] NOT NULL DEFAULT '{}';
