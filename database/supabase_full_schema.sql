-- =====================================================
-- SUPABASE COMPLETE SCHEMA FOR FEATURE DESK
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ASSESSMENTS TABLE (Core assessment metadata)
-- =====================================================

-- First, ensure the assessments table exists with all required columns
CREATE TABLE IF NOT EXISTS assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    class_id INTEGER NOT NULL,
    total_marks INTEGER DEFAULT 0,
    time_limit INTEGER DEFAULT 3600, -- in seconds
    scheduled_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT, -- Stores JSON config including questions as fallback
    exam_type VARCHAR(20) DEFAULT 'unit_test',
    exam_password VARCHAR(10), -- 4-digit password for formal exams
    passing_marks INTEGER DEFAULT 40,
    negative_marking BOOLEAN DEFAULT FALSE,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    instructions TEXT
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'exam_type') THEN
        ALTER TABLE assessments ADD COLUMN exam_type VARCHAR(20) DEFAULT 'unit_test';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'exam_password') THEN
        ALTER TABLE assessments ADD COLUMN exam_password VARCHAR(10);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'passing_marks') THEN
        ALTER TABLE assessments ADD COLUMN passing_marks INTEGER DEFAULT 40;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'negative_marking') THEN
        ALTER TABLE assessments ADD COLUMN negative_marking BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'shuffle_questions') THEN
        ALTER TABLE assessments ADD COLUMN shuffle_questions BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'instructions') THEN
        ALTER TABLE assessments ADD COLUMN instructions TEXT;
    END IF;
END $$;


-- =====================================================
-- 2. ASSESSMENT QUESTIONS TABLE (Detailed questions)
-- =====================================================

CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'mcq', -- mcq, short_answer, long_answer, true_false
    options JSONB, -- Array of options for MCQ: ["Option A", "Option B", "Option C", "Option D"]
    correct_answer INTEGER, -- Index for MCQ (0-3), or NULL for essay
    correct_text TEXT, -- For short/long answer expected response
    explanation TEXT, -- Explanation of the correct answer
    marks INTEGER DEFAULT 1,
    difficulty VARCHAR(10) DEFAULT 'medium', -- easy, medium, hard
    topic VARCHAR(100), -- Topic/chapter this question belongs to
    image_url TEXT, -- Optional image for the question
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id 
ON assessment_questions(assessment_id);


-- =====================================================
-- 3. STUDENT EXAM SUBMISSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS exam_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken INTEGER, -- in seconds
    total_score DECIMAL(5,2) DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    grade VARCHAR(2), -- A, B, C, D, F
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, submitted, graded, reviewed
    proctoring_violations INTEGER DEFAULT 0,
    ip_address VARCHAR(50),
    browser_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_exam_submissions_student 
ON exam_submissions(student_id);

CREATE INDEX IF NOT EXISTS idx_exam_submissions_assessment 
ON exam_submissions(assessment_id);


-- =====================================================
-- 4. STUDENT ANSWERS TABLE (Individual question answers)
-- =====================================================

CREATE TABLE IF NOT EXISTS student_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
    student_answer TEXT, -- The student's answer (option index for MCQ, text for essays)
    is_correct BOOLEAN,
    marks_awarded DECIMAL(5,2) DEFAULT 0,
    ai_feedback TEXT, -- AI-generated feedback for essay questions
    ai_confidence DECIMAL(3,2), -- AI grading confidence (0.00 to 1.00)
    time_spent INTEGER, -- seconds spent on this question
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_answers_submission 
ON student_answers(submission_id);


-- =====================================================
-- 5. QUIZ RESULTS TABLE (For quick quizzes/practice tests)
-- =====================================================

CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    quiz_title VARCHAR(255),
    subject_code VARCHAR(50),
    class_id INTEGER,
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    time_taken INTEGER, -- in seconds
    answers JSONB, -- Stores all answers as JSON
    weak_topics JSONB, -- Topics where student struggled
    strong_topics JSONB, -- Topics where student excelled
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_quiz_results_student 
ON quiz_results(student_id);


-- =====================================================
-- 6. PROCTORING LOGS TABLE (For exam monitoring)
-- =====================================================

CREATE TABLE IF NOT EXISTS proctoring_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- tab_switch, fullscreen_exit, copy_attempt, etc.
    event_data JSONB,
    severity VARCHAR(10) DEFAULT 'warning', -- info, warning, critical
    screenshot_url TEXT, -- URL to stored screenshot if any
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_proctoring_logs_submission 
ON proctoring_logs(submission_id);


-- =====================================================
-- 7. SAMPLE INSERT: Demo Assessment with Questions
-- =====================================================

-- Insert a sample assessment (you can modify this)
INSERT INTO assessments (
    id,
    title,
    subject_code,
    class_id,
    total_marks,
    time_limit,
    is_active,
    created_by,
    exam_type,
    exam_password,
    passing_marks,
    instructions
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Mathematics Mid-Term Exam',
    'MATH',
    7,
    50,
    3600,
    TRUE,
    '00000000-0000-0000-0000-000000000001', -- Demo teacher ID
    'mid_term',
    '1234', -- Password: students enter 1234 + roll number
    40,
    'Answer all questions. Show your work for partial credit.'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample questions for the demo assessment
INSERT INTO assessment_questions (assessment_id, question_number, question_text, question_type, options, correct_answer, explanation, marks, difficulty) VALUES
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1,
    'What is 25% of 80?',
    'mcq',
    '["15", "20", "25", "30"]',
    1,
    '25% of 80 = (25/100) × 80 = 0.25 × 80 = 20',
    5,
    'easy'
),
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    2,
    'Solve: 2x + 5 = 15',
    'mcq',
    '["x = 3", "x = 5", "x = 7", "x = 10"]',
    1,
    '2x + 5 = 15 → 2x = 10 → x = 5',
    5,
    'easy'
),
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    3,
    'What is the area of a rectangle with length 8cm and width 5cm?',
    'mcq',
    '["13 cm²", "26 cm²", "40 cm²", "80 cm²"]',
    2,
    'Area = length × width = 8 × 5 = 40 cm²',
    5,
    'easy'
),
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    4,
    'Simplify: (3x²)(4x³)',
    'mcq',
    '["7x⁵", "12x⁵", "12x⁶", "7x⁶"]',
    1,
    'Multiply coefficients: 3 × 4 = 12. Add exponents: 2 + 3 = 5. Answer: 12x⁵',
    5,
    'medium'
),
(
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    5,
    'Explain the Pythagorean theorem and give an example of its application.',
    'long_answer',
    NULL,
    NULL,
    'The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse.',
    10,
    'medium'
);


-- =====================================================
-- 8. USEFUL VIEWS
-- =====================================================

-- View: Get assessments with question count
CREATE OR REPLACE VIEW assessments_with_stats AS
SELECT 
    a.*,
    COALESCE(q.question_count, 0) as question_count,
    COALESCE(s.submission_count, 0) as submission_count
FROM assessments a
LEFT JOIN (
    SELECT assessment_id, COUNT(*) as question_count 
    FROM assessment_questions 
    GROUP BY assessment_id
) q ON a.id = q.assessment_id
LEFT JOIN (
    SELECT assessment_id, COUNT(*) as submission_count 
    FROM exam_submissions 
    GROUP BY assessment_id
) s ON a.id = s.assessment_id;

-- View: Student exams (formal exams requiring password)
CREATE OR REPLACE VIEW student_exams AS
SELECT * FROM assessments 
WHERE is_active = TRUE 
AND exam_type IN ('annual', 'mid_term');

-- View: Student tests (quick tests, no password)
CREATE OR REPLACE VIEW student_tests AS
SELECT * FROM assessments 
WHERE is_active = TRUE 
AND exam_type IN ('unit_test', 'weekly', 'practice', 'quiz');


-- =====================================================
-- 9. RLS POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS on tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active assessments
CREATE POLICY "View active assessments" ON assessments
FOR SELECT USING (is_active = TRUE);

-- Policy: Anyone can view questions for active assessments
CREATE POLICY "View questions" ON assessment_questions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM assessments WHERE id = assessment_id AND is_active = TRUE)
);

-- Policy: Anyone can insert submissions
CREATE POLICY "Insert submissions" ON exam_submissions
FOR INSERT WITH CHECK (TRUE);

-- Policy: Anyone can insert answers
CREATE POLICY "Insert answers" ON student_answers
FOR INSERT WITH CHECK (TRUE);

-- Policy: Anyone can insert quiz results
CREATE POLICY "Insert quiz results" ON quiz_results
FOR INSERT WITH CHECK (TRUE);


-- =====================================================
-- 10. FUNCTIONS
-- =====================================================

-- Function: Calculate grade from percentage
CREATE OR REPLACE FUNCTION calculate_grade(percentage DECIMAL)
RETURNS VARCHAR(2) AS $$
BEGIN
    RETURN CASE
        WHEN percentage >= 90 THEN 'A+'
        WHEN percentage >= 80 THEN 'A'
        WHEN percentage >= 70 THEN 'B'
        WHEN percentage >= 60 THEN 'C'
        WHEN percentage >= 50 THEN 'D'
        ELSE 'F'
    END;
END;
$$ LANGUAGE plpgsql;

-- Function: Get assessment questions in order
CREATE OR REPLACE FUNCTION get_assessment_questions(p_assessment_id UUID)
RETURNS TABLE (
    id UUID,
    question_number INTEGER,
    question_text TEXT,
    question_type VARCHAR(20),
    options JSONB,
    marks INTEGER,
    difficulty VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aq.id,
        aq.question_number,
        aq.question_text,
        aq.question_type,
        aq.options,
        aq.marks,
        aq.difficulty
    FROM assessment_questions aq
    WHERE aq.assessment_id = p_assessment_id
    ORDER BY aq.question_number;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- DONE! 
-- =====================================================

-- Summary of tables created:
-- 1. assessments - Core assessment metadata
-- 2. assessment_questions - Individual questions for each assessment
-- 3. exam_submissions - Student exam attempts
-- 4. student_answers - Individual answers for each question
-- 5. quiz_results - Quick quiz/practice test results
-- 6. proctoring_logs - Exam monitoring events

-- To verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
