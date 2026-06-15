-- =====================================================
-- SUPABASE DATABASE SCHEMA UPDATE FOR ASSESSMENTS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add new columns to assessments table
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(20) DEFAULT 'unit_test',
ADD COLUMN IF NOT EXISTS exam_password VARCHAR(10),
ADD COLUMN IF NOT EXISTS passing_marks INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS negative_marking BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- 2. Add constraint for exam_type values
ALTER TABLE assessments 
ADD CONSTRAINT check_exam_type 
CHECK (exam_type IN ('annual', 'mid_term', 'unit_test', 'weekly', 'practice', 'quiz'));

-- 3. Create index for faster student queries
CREATE INDEX IF NOT EXISTS idx_assessments_class_active 
ON assessments(class_id, is_active);

CREATE INDEX IF NOT EXISTS idx_assessments_exam_type 
ON assessments(exam_type);

-- 4. Add comment for documentation
COMMENT ON COLUMN assessments.exam_type IS 'Type of assessment: annual, mid_term, unit_test, weekly, practice, quiz';
COMMENT ON COLUMN assessments.exam_password IS '4-digit password code for formal exams (annual, mid_term)';
COMMENT ON COLUMN assessments.passing_marks IS 'Passing percentage for the assessment';
COMMENT ON COLUMN assessments.negative_marking IS 'Whether negative marking is enabled';
COMMENT ON COLUMN assessments.shuffle_questions IS 'Whether to shuffle questions for students';
COMMENT ON COLUMN assessments.instructions IS 'Exam instructions shown to students';

-- =====================================================
-- SAMPLE DATA: Update existing assessments
-- =====================================================

-- Update any existing assessments without exam_type to be unit_test
UPDATE assessments 
SET exam_type = 'unit_test' 
WHERE exam_type IS NULL;

-- =====================================================
-- VIEW: Student Exams (Annual/Mid-Term with password)
-- =====================================================
CREATE OR REPLACE VIEW student_exams AS
SELECT * FROM assessments 
WHERE is_active = TRUE 
AND exam_type IN ('annual', 'mid_term');

-- =====================================================
-- VIEW: Student Tests (Unit Tests/Quizzes - no password)
-- =====================================================
CREATE OR REPLACE VIEW student_tests AS
SELECT * FROM assessments 
WHERE is_active = TRUE 
AND exam_type IN ('unit_test', 'weekly', 'practice', 'quiz');

-- =====================================================
-- RLS POLICIES (if not already set up)
-- =====================================================

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Teachers can view/edit their own assessments
CREATE POLICY "Teachers can manage own assessments" ON assessments
FOR ALL USING (auth.uid()::text = created_by OR created_by IS NULL);

-- Students can view active assessments for their class
CREATE POLICY "Students can view active assessments" ON assessments
FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- Get all exams for Class 7 requiring password
-- SELECT * FROM assessments 
-- WHERE class_id = 7 
-- AND is_active = TRUE 
-- AND exam_type IN ('annual', 'mid_term');

-- Get all tests for Class 7 (no password)
-- SELECT * FROM assessments 
-- WHERE class_id = 7 
-- AND is_active = TRUE 
-- AND exam_type IN ('unit_test', 'weekly', 'practice', 'quiz');
