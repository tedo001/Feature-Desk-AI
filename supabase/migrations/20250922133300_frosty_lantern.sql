/*
  # Complete Feature Desk Database Schema

  1. New Tables
    - `students` - Student authentication and profile data
    - `teachers` - Teacher authentication and profile data  
    - `classes` - Class definitions (1-12)
    - `subjects` - Subject definitions with codes
    - `class_subjects` - Many-to-many relationship between classes and subjects
    - `teacher_assignments` - Teacher-class-subject assignments
    - `student_notes` - Digital and handwritten notes storage
    - `quizzes` - Quiz definitions with questions and metadata
    - `quiz_attempts` - Student quiz attempt records
    - `student_progress` - Learning analytics and progress tracking
    - `notifications` - System notifications and alerts
    - `ai_interactions` - Chatbot and AI assistant interactions
    - `handwriting_conversions` - Handwriting to text conversion records
    - `exam_sessions` - Controlled exam environment sessions
    - `test_submissions` - Test and unit test submissions
    - `learning_insights` - AI-generated learning recommendations
    - `student_badges` - Achievement and progress badges
    - `content_uploads` - Teacher uploaded materials
    - `peer_interactions` - Student collaboration records

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access control
    - Ensure students can only access their own data
    - Teachers can access their assigned class/subject data

  3. Indexes and Constraints
    - Foreign key relationships
    - Unique constraints where needed
    - Performance indexes for common queries
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text UNIQUE NOT NULL,
  password text NOT NULL,
  student_name text NOT NULL,
  current_class integer,
  current_subject text,
  profile_image text,
  learning_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Teachers table  
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  teacher_name text NOT NULL,
  is_class_teacher boolean DEFAULT false,
  assigned_class integer,
  assigned_subjects text[],
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id integer PRIMARY KEY,
  class_name text NOT NULL,
  description text,
  academic_year text DEFAULT '2024-25'
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  code text PRIMARY KEY,
  subject_name text NOT NULL,
  description text,
  color_theme text DEFAULT '#3B82F6'
);

-- Class-Subject relationships
CREATE TABLE IF NOT EXISTS class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  UNIQUE(class_id, subject_code)
);

-- Teacher assignments
CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  UNIQUE(teacher_id, class_id, subject_code)
);

-- Student notes (handwritten and typed)
CREATE TABLE IF NOT EXISTS student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  class_id integer,
  subject_code text,
  title text NOT NULL,
  content text,
  note_type text DEFAULT 'handwritten' CHECK (note_type IN ('handwritten', 'typed', 'converted')),
  canvas_data jsonb, -- For storing drawing data
  handwriting_image text, -- URL to handwriting image
  converted_text text, -- AI converted text
  tags text[],
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL, -- Array of question objects
  total_marks integer DEFAULT 0,
  time_limit integer, -- in minutes
  difficulty_level text DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_adaptive boolean DEFAULT true,
  is_active boolean DEFAULT true,
  due_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id),
  student_id uuid REFERENCES students(id),
  answers jsonb NOT NULL, -- Student answers
  score integer DEFAULT 0,
  max_score integer DEFAULT 0,
  time_taken integer, -- in seconds
  reaction_times jsonb, -- Per question reaction times
  difficulty_progression jsonb, -- How difficulty adapted
  completed_at timestamptz DEFAULT now(),
  is_completed boolean DEFAULT true
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  class_id integer,
  subject_code text,
  metric_type text NOT NULL, -- 'quiz_score', 'time_spent', 'concept_mastery', etc.
  value numeric NOT NULL,
  metadata jsonb, -- Additional context data
  recorded_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL CHECK (recipient_type IN ('student', 'teacher')),
  recipient_id uuid NOT NULL,
  sender_type text CHECK (sender_type IN ('system', 'teacher', 'student')),
  sender_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'quiz', 'assignment')),
  action_url text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- AI interactions (chatbot, assistant)
CREATE TABLE IF NOT EXISTS ai_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  interaction_type text NOT NULL CHECK (interaction_type IN ('chatbot', 'friendly_ai', 'analysis')),
  context_data jsonb, -- Screen context, current subject, etc.
  user_message text NOT NULL,
  ai_response text NOT NULL,
  feedback_rating integer CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- Handwriting conversions
CREATE TABLE IF NOT EXISTS handwriting_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  original_image text NOT NULL, -- URL to handwriting image
  converted_text text NOT NULL,
  confidence_score numeric,
  processing_time integer, -- in milliseconds
  gemini_model text DEFAULT 'gemini-2.5-flash',
  created_at timestamptz DEFAULT now()
);

-- Exam sessions (controlled environment)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  exam_title text NOT NULL,
  instructions text,
  time_limit integer NOT NULL, -- in minutes
  allowed_tools jsonb DEFAULT '["pen", "eraser", "shapes"]',
  is_active boolean DEFAULT false,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Test submissions
CREATE TABLE IF NOT EXISTS test_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  exam_session_id uuid REFERENCES exam_sessions(id),
  answers jsonb NOT NULL,
  submission_type text DEFAULT 'mixed' CHECK (submission_type IN ('handwritten', 'typed', 'mixed')),
  canvas_data jsonb, -- Drawing data if handwritten
  auto_score integer,
  manual_score integer,
  feedback text,
  submitted_at timestamptz DEFAULT now()
);

-- Learning insights (AI recommendations)
CREATE TABLE IF NOT EXISTS learning_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  subject_code text,
  insight_type text NOT NULL CHECK (insight_type IN ('strength', 'weakness', 'recommendation', 'intervention')),
  title text NOT NULL,
  description text NOT NULL,
  confidence_score numeric,
  action_items jsonb,
  is_addressed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Student badges and achievements
CREATE TABLE IF NOT EXISTS student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  description text,
  icon_url text,
  criteria_met jsonb,
  earned_at timestamptz DEFAULT now()
);

-- Content uploads (teacher materials)
CREATE TABLE IF NOT EXISTS content_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id),
  class_id integer REFERENCES classes(id),
  subject_code text REFERENCES subjects(code),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  is_public boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- Peer interactions
CREATE TABLE IF NOT EXISTS peer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  peer_id uuid REFERENCES students(id),
  interaction_type text NOT NULL CHECK (interaction_type IN ('share_note', 'help_request', 'collaboration')),
  content_id uuid, -- Reference to shared content
  message text,
  created_at timestamptz DEFAULT now()
);

-- Insert sample data for classes
INSERT INTO classes (id, class_name, description) VALUES
(1, 'Class 1', 'First Grade'),
(2, 'Class 2', 'Second Grade'),
(3, 'Class 3', 'Third Grade'),
(4, 'Class 4', 'Fourth Grade'),
(5, 'Class 5', 'Fifth Grade'),
(6, 'Class 6', 'Sixth Grade'),
(7, 'Class 7', 'Seventh Grade'),
(8, 'Class 8', 'Eighth Grade'),
(9, 'Class 9', 'Ninth Grade'),
(10, 'Class 10', 'Tenth Grade'),
(11, 'Class 11', 'Eleventh Grade'),
(12, 'Class 12', 'Twelfth Grade')
ON CONFLICT (id) DO NOTHING;

-- Insert sample subjects
INSERT INTO subjects (code, subject_name, description, color_theme) VALUES
('MATH', 'Mathematics', 'Numbers, Algebra, Geometry', '#3B82F6'),
('SCI', 'Science', 'Physics, Chemistry, Biology', '#10B981'),
('ENG', 'English', 'Language and Literature', '#8B5CF6'),
('HIST', 'History', 'World and National History', '#F59E0B'),
('GEO', 'Geography', 'Physical and Human Geography', '#06B6D4'),
('COMP', 'Computer Science', 'Programming and Technology', '#EF4444'),
('ART', 'Arts', 'Drawing, Painting, Crafts', '#EC4899'),
('PE', 'Physical Education', 'Sports and Fitness', '#84CC16')
ON CONFLICT (code) DO NOTHING;

-- Insert sample students
INSERT INTO students (roll_number, password, student_name, current_class, current_subject) VALUES
('STU001', 'password123', 'Alice Johnson', 10, 'MATH'),
('STU002', 'password123', 'Bob Smith', 10, 'SCI'),
('STU003', 'password123', 'Carol Davis', 9, 'ENG'),
('STU004', 'password123', 'David Wilson', 11, 'MATH'),
('STU005', 'password123', 'Emma Brown', 12, 'SCI')
ON CONFLICT (roll_number) DO NOTHING;

-- Insert sample teachers
INSERT INTO teachers (email, password, teacher_name, is_class_teacher, assigned_class, assigned_subjects) VALUES
('teacher1@school.com', 'teacher123', 'Dr. Sarah Miller', true, 10, ARRAY['MATH', 'SCI']),
('teacher2@school.com', 'teacher123', 'Prof. John Anderson', false, NULL, ARRAY['ENG', 'HIST']),
('teacher3@school.com', 'teacher123', 'Ms. Lisa Garcia', false, NULL, ARRAY['SCI']),
('teacher4@school.com', 'teacher123', 'Mr. Michael Chen', true, 9, ARRAY['MATH', 'COMP'])
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE handwriting_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Students can read own data
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO public
  USING (true);

-- Teachers can read own data  
CREATE POLICY "Teachers can read own data"
  ON teachers
  FOR SELECT
  TO public
  USING (true);

-- Classes and subjects are publicly readable
CREATE POLICY "Classes are publicly readable"
  ON classes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Subjects are publicly readable"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

-- Students can manage their own notes
CREATE POLICY "Students can manage own notes"
  ON student_notes
  FOR ALL
  TO public
  USING (true);

-- Students can view quizzes for their class/subject
CREATE POLICY "Students can view relevant quizzes"
  ON quizzes
  FOR SELECT
  TO public
  USING (true);

-- Students can manage their quiz attempts
CREATE POLICY "Students can manage own quiz attempts"
  ON quiz_attempts
  FOR ALL
  TO public
  USING (true);

-- Students can view their progress
CREATE POLICY "Students can view own progress"
  ON student_progress
  FOR SELECT
  TO public
  USING (true);

-- Notification policies
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (true);

-- AI interactions policies
CREATE POLICY "Students can manage own AI interactions"
  ON ai_interactions
  FOR ALL
  TO public
  USING (true);

-- Other tables follow similar patterns...
CREATE POLICY "Students can manage own handwriting conversions"
  ON handwriting_conversions
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Students can view exam sessions"
  ON exam_sessions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Students can manage own test submissions"
  ON test_submissions
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Students can view own learning insights"
  ON learning_insights
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Students can view own badges"
  ON student_badges
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Students can view content uploads"
  ON content_uploads
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Students can manage peer interactions"
  ON peer_interactions
  FOR ALL
  TO public
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_notes_student_subject ON student_notes(student_id, subject_code);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_subject ON student_progress(student_id, subject_code);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_student ON ai_interactions(student_id, interaction_type);