-- Phase 3.5 extension: exam results / student submissions

CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_usage_id UUID NOT NULL REFERENCES exam_usages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(128),
    class_name VARCHAR(128),
    grade VARCHAR(64),
    major VARCHAR(128),
    score NUMERIC(7,2) NOT NULL DEFAULT 0,
    total_score NUMERIC(7,2) NOT NULL DEFAULT 0,
    is_pass BOOLEAN NOT NULL DEFAULT FALSE,
    answers JSONB NOT NULL DEFAULT '{}',
    submit_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_usage_id, user_id)
);

CREATE INDEX idx_exam_results_usage ON exam_results(exam_usage_id);
CREATE INDEX idx_exam_results_user ON exam_results(user_id);
