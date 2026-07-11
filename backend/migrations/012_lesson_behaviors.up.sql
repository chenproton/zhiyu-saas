-- Phase 3.4 extension: lesson behavior collection (attendance, quizzes, interactions)

CREATE TABLE lesson_behavior_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    attendance VARCHAR(16) NOT NULL DEFAULT 'present',
    quiz_score NUMERIC(5,2),
    interaction_count INT NOT NULL DEFAULT 0,
    praise_count INT NOT NULL DEFAULT 0,
    rush_correct_count INT NOT NULL DEFAULT 0,
    rush_avg_time_sec INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(course_id, student_user_id, record_date)
);

CREATE INDEX idx_lbr_course_date ON lesson_behavior_records(course_id, record_date);
CREATE INDEX idx_lbr_student ON lesson_behavior_records(student_user_id);
