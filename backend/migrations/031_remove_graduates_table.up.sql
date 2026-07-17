ALTER TABLE users ADD COLUMN IF NOT EXISTS graduate_year INT;

UPDATE users u SET
    status = 'graduated',
    graduate_year = g.graduate_year
FROM graduates g
WHERE g.user_id IS NOT NULL AND g.user_id = u.id;

DROP TABLE IF EXISTS graduates CASCADE;
