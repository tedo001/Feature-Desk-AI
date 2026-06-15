-- ================================================================
-- DATABASE REPAIR SCRIPT (Fixes Grading "No questions found" error)
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- 1. Fix: Add 'answers' column to quiz_results
-- This is necessary because simple quizzes store answers as a JSON blob in this column.
-- The 400 error in the console confirms this column is missing.
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '[]'::jsonb;

-- 2. Fix: Ensure quiz_title column exists
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS quiz_title VARCHAR(255);

-- 3. Fix: Ensure student_answers table exists (for detailed exams)
CREATE TABLE IF NOT EXISTS student_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID, -- Can link to exam_submissions.id or quiz_results.id
    question_id UUID,
    student_answer TEXT,
    is_correct BOOLEAN,
    marks_awarded DECIMAL(5,2) DEFAULT 0,
    ai_feedback TEXT,
    ai_confidence DECIMAL(3,2),
    time_spent INTEGER,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add Index for performance
CREATE INDEX IF NOT EXISTS idx_student_answers_submission ON student_answers(submission_id);

-- 5. Fix: Ensure exam_submissions table exists
CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    assessment_id UUID,
    total_score DECIMAL(5,2) DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    grade VARCHAR(5),
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
