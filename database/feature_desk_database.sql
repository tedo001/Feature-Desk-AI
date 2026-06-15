/*
  # Complete Feature Desk Database Schema (Hybrid Architecture Update)
  
  This script creates the PostgreSQL schema for Supabase, designed to work alongside MongoDB.
  - Supabase: Stores Structured Data (Users, Metadata, Grades, Schedules)
  - MongoDB: Stores Unstructured Data (Canvas Strokes, Detailed Answer Sheets, Logs)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CORE USER TABLES
-- ============================================================

-- 1. Students table (Core Identity)
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text UNIQUE NOT NULL,
  password text NOT NULL,
  student_name text NOT NULL,
  current_class integer,
  current_subject text,
  profile_image text,
  parent_phone text,
  parent_email text,
  health_details text,
  learning_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  teacher_name text NOT NULL,
  is_class_teacher boolean DEFAULT false,
  assigned_class integer,
  assigned_subjects text[],
  profile_image text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- 3. Classes Reference
CREATE TABLE IF NOT EXISTS classes (
  id integer PRIMARY KEY,
  class_name text NOT NULL,
  description text
);

-- 4. Subjects Reference
CREATE TABLE IF NOT EXISTS subjects (
  code text PRIMARY KEY,
  subject_name text NOT NULL,
  description text,
  color_theme text DEFAULT '#3B82F6'
);

-- ============================================================
-- ASSESSMENT & QUIZ TABLES
-- ============================================================

-- 5. Assessments (Teacher Created)
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject_code text REFERENCES subjects(code),
  class_id integer REFERENCES classes(id),
  total_marks integer NOT NULL,
  time_limit integer, -- in seconds
  scheduled_at timestamptz,
  is_active boolean DEFAULT false,
  created_by uuid REFERENCES teachers(id),
  mongo_questions_id text, -- Reference to MongoDB for detailed questions
  created_at timestamptz DEFAULT now()
);

-- 6. Quiz Results (Hybrid Link)
-- Stores the final scores and metadata. Detailed logs go to MongoDB 'quiz_logs'.
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  assessment_id uuid REFERENCES assessments(id),
  quiz_title text NOT NULL,
  score integer NOT NULL,
  total_marks integer NOT NULL,
  grade text,
  ai_suggested_grade text,
  teacher_approved boolean DEFAULT false,
  feedback text,
  subject_code text,
  class_id integer,
  mongo_log_id text,
  timestamp timestamptz DEFAULT now()
);

-- 7. Exam Results (Hybrid Link)
-- Stores final grades. Answer sheets go to MongoDB 'exam_answer_sheets'.
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  exam_id text NOT NULL,
  score numeric,
  grade text,
  status text DEFAULT 'completed',
  feedback_summary text,
  ai_evaluation jsonb,
  teacher_approved boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTES & CONTENT TABLES
-- ============================================================

-- 8. Student Notes Metadata (Hybrid Link)
-- Stores note titles and tags. Content goes to MongoDB 'notes_content'.
CREATE TABLE IF NOT EXISTS notes_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  title text NOT NULL,
  subject_code text,
  note_type text DEFAULT 'handwritten',
  tags text[],
  mongo_content_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Teacher Content Metadata
-- Stores references to uploaded PDFs, images, notes (actual files in MongoDB or Supabase Storage)
CREATE TABLE IF NOT EXISTS teacher_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  title text NOT NULL,
  subject_code text,
  class_id integer,
  content_type text CHECK (content_type IN ('pdf', 'image', 'notes', 'video')),
  file_url text,
  mongo_content_id text,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================================

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL CHECK (recipient_type IN ('student', 'teacher', 'parent')),
  recipient_id uuid NOT NULL,
  sender_id uuid REFERENCES teachers(id),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'alert', 'assignment', 'exam', 'intervention')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 11. Parent Communications Log
CREATE TABLE IF NOT EXISTS parent_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  teacher_id uuid REFERENCES teachers(id),
  communication_type text CHECK (communication_type IN ('progress_report', 'intervention', 'general', 'absence')),
  subject text,
  message text,
  sent_via text CHECK (sent_via IN ('email', 'sms', 'app')),
  sent_at timestamptz DEFAULT now()
);

-- ============================================================
-- ANALYTICS & PERFORMANCE TRACKING
-- ============================================================

-- 12. Student Performance Summary (Aggregated for quick access)
CREATE TABLE IF NOT EXISTS student_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) UNIQUE,
  total_quizzes integer DEFAULT 0,
  total_score integer DEFAULT 0,
  average_percentage numeric DEFAULT 0,
  strongest_subject text,
  weakest_subject text,
  learning_velocity text CHECK (learning_velocity IN ('improving', 'stable', 'declining')),
  intervention_needed boolean DEFAULT false,
  last_updated timestamptz DEFAULT now()
);

-- 13. Class Analytics Snapshots
CREATE TABLE IF NOT EXISTS class_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  average_score numeric,
  top_performers uuid[],
  struggling_students uuid[],
  common_mistakes jsonb,
  readiness_percentage integer,
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- SCHEDULING
-- ============================================================

-- 14. Class Schedule
CREATE TABLE IF NOT EXISTS class_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  teacher_id uuid REFERENCES teachers(id),
  day_of_week integer CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time,
  end_time time,
  room text,
  created_at timestamptz DEFAULT now()
);

-- 15. Teacher Absences
CREATE TABLE IF NOT EXISTS teacher_absences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  absence_date date NOT NULL,
  reason text,
  substitute_id uuid REFERENCES teachers(id),
  ai_lesson_plan text,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_content ENABLE ROW LEVEL SECURITY;

-- Basic Public Access Policies (For Demo/Dev Simplicity)
-- In production, restrict 'USING (auth.uid() = student_id)'
CREATE POLICY "Public Read Students" ON students FOR SELECT TO public USING (true);
CREATE POLICY "Public Update Students" ON students FOR UPDATE TO public USING (true);
CREATE POLICY "Public Read Teachers" ON teachers FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Classes" ON classes FOR SELECT TO public USING (true);
CREATE POLICY "Public Read Subjects" ON subjects FOR SELECT TO public USING (true);
CREATE POLICY "Public Access Quiz Results" ON quiz_results FOR ALL TO public USING (true);
CREATE POLICY "Public Access Exam Results" ON exam_results FOR ALL TO public USING (true);
CREATE POLICY "Public Access Notes" ON notes_metadata FOR ALL TO public USING (true);
CREATE POLICY "Public Access Notifications" ON notifications FOR ALL TO public USING (true);
CREATE POLICY "Public Access Assessments" ON assessments FOR ALL TO public USING (true);
CREATE POLICY "Public Access Teacher Content" ON teacher_content FOR ALL TO public USING (true);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quiz_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_class ON quiz_results(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_student ON notes_metadata(student_id, subject_code);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_assessments_class ON assessments(class_id, is_active);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(current_class);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Data: Classes
INSERT INTO classes (id, class_name) VALUES
(1, 'Class 1'), (2, 'Class 2'), (3, 'Class 3'), (4, 'Class 4'),
(5, 'Class 5'), (6, 'Class 6'), (7, 'Class 7'), (8, 'Class 8'),
(9, 'Class 9'), (10, 'Class 10'), (11, 'Class 11'), (12, 'Class 12')
ON CONFLICT (id) DO NOTHING;

-- Seed Data: Subjects
INSERT INTO subjects (code, subject_name, color_theme) VALUES
('MATH', 'Mathematics', '#3B82F6'),
('SCI', 'Science', '#10B981'),
('ENG', 'English', '#8B5CF6'),
('HIST', 'History', '#F59E0B'),
('PHY', 'Physics', '#06B6D4'),
('CHEM', 'Chemistry', '#EC4899'),
('BIO', 'Biology', '#22C55E'),
('GEO', 'Geography', '#84CC16'),
('CS', 'Computer Science', '#6366F1'),
('ART', 'Art', '#F43F5E')
ON CONFLICT (code) DO NOTHING;

-- Seed Data: Sample Students
INSERT INTO students (roll_number, password, student_name, current_class, current_subject, parent_phone) VALUES
('STU001', 'password123', 'Alice Johnson', 10, 'MATH', '+91-9876543210'),
('STU002', 'password123', 'Bob Smith', 10, 'MATH', '+91-9876543211'),
('STU003', 'password123', 'Charlie Brown', 10, 'SCI', '+91-9876543212'),
('STU004', 'password123', 'Diana Ross', 10, 'MATH', '+91-9876543213'),
('STU005', 'password123', 'Eve Wilson', 10, 'ENG', '+91-9876543214')
ON CONFLICT (roll_number) DO NOTHING;

-- Seed Data: Sample Teachers
INSERT INTO teachers (email, password, teacher_name, is_class_teacher, assigned_class, assigned_subjects) VALUES
('math.teacher@school.com', 'password123', 'Mr. Sharma', true, 10, ARRAY['MATH', 'PHY']),
('science.teacher@school.com', 'password123', 'Ms. Patel', false, NULL, ARRAY['SCI', 'BIO']),
('english.teacher@school.com', 'password123', 'Mrs. Singh', false, NULL, ARRAY['ENG', 'HIST'])
ON CONFLICT (email) DO NOTHING;
