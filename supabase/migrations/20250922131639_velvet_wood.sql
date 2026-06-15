/*
  # Feature Desk Database Schema

  1. New Tables
    - `students` - Student authentication and profile data
    - `teachers` - Teacher authentication and profile data
    - `classes` - Class information (1-12)
    - `subjects` - Subject codes and names
    - `class_subjects` - Many-to-many relationship between classes and subjects
    - `teacher_assignments` - Teacher to class/subject assignments
    - `student_notes` - Digital notes storage
    - `quizzes` - Quiz definitions
    - `quiz_attempts` - Student quiz attempts and scores
    - `student_progress` - Learning progress tracking
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access control

  3. Initial Data
    - Sample classes (1-12)
    - Common subjects
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text UNIQUE NOT NULL,
  password text NOT NULL,
  student_name text NOT NULL,
  current_class integer,
  current_subject text,
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id integer PRIMARY KEY,
  class_name text NOT NULL,
  description text
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  code text PRIMARY KEY,
  subject_name text NOT NULL,
  description text
);

-- Class subjects relationship
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

-- Student notes
CREATE TABLE IF NOT EXISTS student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  class_id integer,
  subject_code text,
  title text NOT NULL,
  content text,
  note_type text DEFAULT 'handwritten', -- 'handwritten', 'typed', 'converted'
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
  questions jsonb NOT NULL,
  total_marks integer DEFAULT 0,
  time_limit integer, -- in minutes
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id),
  student_id uuid REFERENCES students(id),
  answers jsonb NOT NULL,
  score integer DEFAULT 0,
  time_taken integer, -- in seconds
  completed_at timestamptz DEFAULT now()
);

-- Student progress tracking
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  class_id integer,
  subject_code text,
  metric_type text NOT NULL, -- 'quiz_score', 'concept_mastery', 'engagement'
  value numeric NOT NULL,
  metadata jsonb,
  recorded_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL, -- 'student', 'teacher'
  recipient_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
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

-- RLS Policies (Basic - can be expanded)
CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  USING (true); -- Allow public read for authentication

CREATE POLICY "Teachers can read own data"
  ON teachers FOR SELECT
  USING (true); -- Allow public read for authentication

CREATE POLICY "Classes are publicly readable"
  ON classes FOR SELECT
  USING (true);

CREATE POLICY "Subjects are publicly readable"
  ON subjects FOR SELECT
  USING (true);

-- Insert sample data
INSERT INTO classes (id, class_name) VALUES
  (1, 'Class 1'), (2, 'Class 2'), (3, 'Class 3'), (4, 'Class 4'),
  (5, 'Class 5'), (6, 'Class 6'), (7, 'Class 7'), (8, 'Class 8'),
  (9, 'Class 9'), (10, 'Class 10'), (11, 'Class 11'), (12, 'Class 12');

INSERT INTO subjects (code, subject_name) VALUES
  ('MATH', 'Mathematics'),
  ('ENG', 'English'),
  ('SCI', 'Science'),
  ('SST', 'Social Studies'),
  ('PHY', 'Physics'),
  ('CHEM', 'Chemistry'),
  ('BIO', 'Biology'),
  ('HIST', 'History'),
  ('GEO', 'Geography'),
  ('COMP', 'Computer Science');

-- Sample students
INSERT INTO students (roll_number, password, student_name) VALUES
  ('STU001', 'password123', 'John Doe'),
  ('STU002', 'password123', 'Jane Smith'),
  ('STU003', 'password123', 'Alice Johnson');

-- Sample teachers
INSERT INTO teachers (email, password, teacher_name, is_class_teacher, assigned_class) VALUES
  ('teacher1@school.com', 'teacher123', 'Mr. Anderson', true, 10),
  ('teacher2@school.com', 'teacher123', 'Ms. Johnson', false, null),
  ('teacher3@school.com', 'teacher123', 'Dr. Smith', false, null);