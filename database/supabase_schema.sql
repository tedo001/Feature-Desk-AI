-- =====================================================================
-- FEATURE DESK - COMPLETE SUPABASE DATABASE SCHEMA
-- Class 7 Students Database Setup
-- =====================================================================
-- Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================================

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. DROP EXISTING TABLES (IF RECREATING)
-- =====================================================================
-- DROP TABLE IF EXISTS peer_messages CASCADE;
-- DROP TABLE IF EXISTS peer_sessions CASCADE;
-- DROP TABLE IF EXISTS peer_help_requests CASCADE;
-- DROP TABLE IF EXISTS student_interactions CASCADE;
-- DROP TABLE IF EXISTS leaderboard CASCADE;
-- DROP TABLE IF EXISTS student_notes CASCADE;
-- DROP TABLE IF EXISTS quiz_responses CASCADE;
-- DROP TABLE IF EXISTS quiz_results CASCADE;
-- DROP TABLE IF EXISTS assessments CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS student_attendance CASCADE;
-- DROP TABLE IF EXISTS student_subjects CASCADE;
-- DROP TABLE IF EXISTS class_subjects CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS teachers CASCADE;
-- DROP TABLE IF EXISTS subjects CASCADE;
-- DROP TABLE IF EXISTS classes CASCADE;

-- =====================================================================
-- 3. CORE TABLES
-- =====================================================================

-- Classes Table
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    academic_year VARCHAR(20) DEFAULT '2025-26',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    code VARCHAR(20) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10) DEFAULT '📚',
    color VARCHAR(20) DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Teachers Table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_class_teacher BOOLEAN DEFAULT FALSE,
    assigned_class INTEGER REFERENCES classes(id),
    assigned_subjects TEXT[] DEFAULT '{}',
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL DEFAULT '123456',
    current_class INTEGER REFERENCES classes(id),
    current_subject VARCHAR(20) REFERENCES subjects(code),
    profile_image TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    parent_email VARCHAR(255),
    address TEXT,
    health_details TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Class-Subject Mapping
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id INTEGER REFERENCES classes(id),
    subject_code VARCHAR(20) REFERENCES subjects(code),
    teacher_id UUID REFERENCES teachers(id),
    schedule TEXT,
    UNIQUE(class_id, subject_code)
);

-- Student-Subject Enrollment
CREATE TABLE IF NOT EXISTS student_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_code VARCHAR(20) REFERENCES subjects(code),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(student_id, subject_code)
);

-- =====================================================================
-- 4. ASSESSMENT TABLES
-- =====================================================================

-- Assessments Table (Quizzes, Tests, Exams)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_code VARCHAR(20) REFERENCES subjects(code),
    class_id INTEGER REFERENCES classes(id),
    exam_type VARCHAR(50) DEFAULT 'unit_test', -- 'annual', 'mid_term', 'unit_test', 'weekly', 'practice', 'quiz'
    questions JSONB NOT NULL DEFAULT '[]',
    total_marks INTEGER NOT NULL,
    time_limit INTEGER, -- in seconds
    passing_marks INTEGER DEFAULT 40,
    negative_marking BOOLEAN DEFAULT FALSE,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    instructions TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Quiz Results Table
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN total_marks > 0 THEN (score::DECIMAL / total_marks) * 100 ELSE 0 END) STORED,
    grade VARCHAR(5),
    ai_suggested_grade VARCHAR(5),
    time_taken INTEGER, -- in seconds
    teacher_approved BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    attempt_number INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES teachers(id)
);

-- Detailed Quiz Responses
CREATE TABLE IF NOT EXISTS quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID REFERENCES quiz_results(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_text TEXT,
    student_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN,
    marks_obtained DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================
-- 5. NOTES & LEARNING CONTENT
-- =====================================================================

-- Student Notes
CREATE TABLE IF NOT EXISTS student_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    subject_code VARCHAR(20) REFERENCES subjects(code),
    note_type VARCHAR(50) DEFAULT 'typed', -- 'handwritten', 'typed', 'converted', 'ai_generated'
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    color VARCHAR(20) DEFAULT '#FFFFFF',
    folder VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================
-- 6. NOTIFICATIONS
-- =====================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES teachers(id),
    recipient_type VARCHAR(20) NOT NULL, -- 'student', 'class', 'all'
    recipient_ids UUID[] DEFAULT '{}',
    class_id INTEGER REFERENCES classes(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'info', -- 'info', 'alert', 'assignment', 'exam', 'reminder'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================
-- 7. ATTENDANCE
-- =====================================================================

CREATE TABLE IF NOT EXISTS student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'present', -- 'present', 'absent', 'late', 'excused'
    remarks TEXT,
    marked_by UUID REFERENCES teachers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(student_id, attendance_date)
);

-- =====================================================================
-- 8. SOCIAL LEARNING & PEER INTERACTIONS
-- =====================================================================

-- Peer Help Requests
CREATE TABLE IF NOT EXISTS peer_help_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES students(id) ON DELETE CASCADE,
    helper_id UUID REFERENCES students(id),
    subject_code VARCHAR(20) REFERENCES subjects(code),
    topic VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'completed', 'cancelled'
    urgency VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Peer Sessions
CREATE TABLE IF NOT EXISTS peer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES peer_help_requests(id) ON DELETE CASCADE,
    requester_id UUID REFERENCES students(id),
    helper_id UUID REFERENCES students(id),
    topic VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'ended'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Peer Messages
CREATE TABLE IF NOT EXISTS peer_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES peer_sessions(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES students(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Student Interactions (Activity Tracking)
CREATE TABLE IF NOT EXISTS student_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'quiz_attempt', 'note_created', 'peer_help', 'login', 'lesson_view'
    related_id UUID, -- Could be assessment_id, note_id, etc.
    subject_code VARCHAR(20) REFERENCES subjects(code),
    details JSONB DEFAULT '{}',
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================
-- 9. LEADERBOARD & GAMIFICATION
-- =====================================================================

CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id),
    subject_code VARCHAR(20) REFERENCES subjects(code),
    total_points INTEGER DEFAULT 0,
    quiz_points INTEGER DEFAULT 0,
    attendance_points INTEGER DEFAULT 0,
    participation_points INTEGER DEFAULT 0,
    peer_help_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    current_rank INTEGER,
    badges JSONB DEFAULT '[]',
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(student_id, subject_code)
);

-- =====================================================================
-- 10. STUDY MATERIALS (Reference Table)
-- =====================================================================

CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_code VARCHAR(20) REFERENCES subjects(code),
    class_id INTEGER REFERENCES classes(id),
    material_type VARCHAR(50), -- 'pdf', 'video', 'image', 'document'
    file_url TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_summary TEXT,
    key_topics TEXT[] DEFAULT '{}',
    uploaded_by UUID REFERENCES teachers(id),
    is_active BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================================
-- 11. INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_students_class ON students(current_class);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_assessment ON quiz_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class ON assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_code);
CREATE INDEX IF NOT EXISTS idx_notifications_class ON notifications(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON student_attendance(student_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_interactions_student ON student_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_class ON leaderboard(class_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON leaderboard(total_points DESC);

-- =====================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =====================================================================

-- Enable RLS on sensitive tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
-- For demo, allow all operations
CREATE POLICY "Allow all for students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all for quiz_results" ON quiz_results FOR ALL USING (true);
CREATE POLICY "Allow all for student_notes" ON student_notes FOR ALL USING (true);
CREATE POLICY "Allow all for notifications" ON notifications FOR ALL USING (true);

-- =====================================================================
-- 13. INSERT BASE DATA
-- =====================================================================

-- Insert Classes
INSERT INTO classes (id, class_name, section, academic_year) VALUES
    (1, 'Class 1', 'A', '2025-26'),
    (2, 'Class 2', 'A', '2025-26'),
    (3, 'Class 3', 'A', '2025-26'),
    (4, 'Class 4', 'A', '2025-26'),
    (5, 'Class 5', 'A', '2025-26'),
    (6, 'Class 6', 'A', '2025-26'),
    (7, 'Class 7', 'A', '2025-26'),
    (8, 'Class 8', 'A', '2025-26'),
    (9, 'Class 9', 'A', '2025-26'),
    (10, 'Class 10', 'A', '2025-26'),
    (11, 'Class 11', 'A', '2025-26'),
    (12, 'Class 12', 'A', '2025-26')
ON CONFLICT (id) DO NOTHING;

-- Insert Subjects
INSERT INTO subjects (code, subject_name, description, icon_emoji, color) VALUES
    ('MATH', 'Mathematics', 'Numbers, algebra, geometry, and problem-solving', '🔢', '#3B82F6'),
    ('SCIENCE', 'Science', 'Physics, Chemistry, Biology fundamentals', '🔬', '#10B981'),
    ('ENGLISH', 'English', 'Language, grammar, literature', '📖', '#8B5CF6'),
    ('HINDI', 'Hindi', 'हिंदी भाषा और साहित्य', '📝', '#F59E0B'),
    ('TAMIL', 'Tamil', 'தமிழ் மொழி மற்றும் இலக்கியம்', '🪷', '#DC2626'),
    ('SOCIAL', 'Social Studies', 'History, Geography, Civics', '🌍', '#EF4444'),
    ('COMPUTER', 'Computer Science', 'Programming, digital literacy', '💻', '#06B6D4')
ON CONFLICT (code) DO NOTHING;

-- Insert Demo Teacher
INSERT INTO teachers (id, email, password, teacher_name, is_class_teacher, assigned_class, assigned_subjects) VALUES
    ('00000000-0000-0000-0000-000000000001', 'teacher@demo.com', 'teacher123', 'Mrs. Priya Sharma', true, 7, ARRAY['MATH', 'SCIENCE', 'ENGLISH', 'HINDI', 'TAMIL', 'SOCIAL', 'COMPUTER'])
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
