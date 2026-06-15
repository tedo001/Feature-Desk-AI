-- =====================================================================
-- FIX: Create student_notifications table
-- Run this in Supabase Dashboard > SQL Editor
-- This fixes the 409 Conflict error when sending grade notifications
-- =====================================================================

-- 1. Create the student_notifications table
CREATE TABLE IF NOT EXISTS student_notifications (
    id TEXT PRIMARY KEY,                    -- String ID like 'notif_1234_abc'
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'grade_report',
    read BOOLEAN DEFAULT FALSE,
    urgent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Add indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_student_notifications_student
    ON student_notifications(student_id);

CREATE INDEX IF NOT EXISTS idx_student_notifications_read
    ON student_notifications(student_id, read);

CREATE INDEX IF NOT EXISTS idx_student_notifications_created
    ON student_notifications(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE student_notifications ENABLE ROW LEVEL SECURITY;

-- 4. Allow all operations (demo mode)
--    NOTE: CREATE POLICY does NOT support IF NOT EXISTS in PostgreSQL
--    So we drop first, then recreate safely
DROP POLICY IF EXISTS "Allow all for student_notifications" ON student_notifications;
CREATE POLICY "Allow all for student_notifications"
    ON student_notifications FOR ALL USING (true);

-- 5. Add feedback columns to exam_submissions if they don't exist
ALTER TABLE exam_submissions
    ADD COLUMN IF NOT EXISTS feedback TEXT;

ALTER TABLE exam_submissions
    ADD COLUMN IF NOT EXISTS question_feedback JSONB DEFAULT '[]';

-- 6. Add ai_feedback column to student_answers if it doesn't exist
ALTER TABLE student_answers
    ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

-- =====================================================================
-- VERIFY: Check tables exist
-- =====================================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
      'student_notifications',
      'exam_submissions',
      'student_answers'
  );
