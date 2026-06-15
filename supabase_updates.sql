-- Add feedback column to exam_submissions if missing (for general teacher feedback)
ALTER TABLE exam_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Add feedback columns to student_answers (for per-question feedback and images)
ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS feedback_text TEXT;
ALTER TABLE student_answers ADD COLUMN IF NOT EXISTS feedback_image_url TEXT;

-- Ensure assessment_questions has image_url (for the question itself)
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'student_answers';
