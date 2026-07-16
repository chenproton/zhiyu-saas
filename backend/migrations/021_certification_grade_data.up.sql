CREATE TABLE IF NOT EXISTS certification_grade_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL,
    grade_year INT NOT NULL,
    total_ability_points INT NOT NULL DEFAULT 0,
    avg_achievement_rate NUMERIC(5,2),
    last_updated TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(position_id, grade_year)
);

CREATE TABLE IF NOT EXISTS certification_competency_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_data_id UUID NOT NULL REFERENCES certification_grade_data(id) ON DELETE CASCADE,
    duty_name VARCHAR(256) NOT NULL,
    item_name VARCHAR(256) NOT NULL,
    target_level INT NOT NULL,
    current_level INT NOT NULL DEFAULT 1,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certification_grade_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_data_id UUID NOT NULL REFERENCES certification_grade_data(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    class_name VARCHAR(128),
    major VARCHAR(128),
    achievement_rate NUMERIC(5,2),
    grade_label VARCHAR(4),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_grade_data_position ON certification_grade_data(position_id);
CREATE INDEX IF NOT EXISTS idx_cert_grade_competencies_grade ON certification_competency_requirements(grade_data_id);
CREATE INDEX IF NOT EXISTS idx_cert_grade_leaderboard_grade ON certification_grade_leaderboard(grade_data_id);
