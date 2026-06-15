import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =====================================================================
// DATABASE TYPES (Matches Supabase Schema)
// =====================================================================

export interface Student {
  id: string;
  roll_number: string;
  student_name: string;
  email?: string;
  current_class?: number;
  current_subject?: string;
  profile_image?: string;
  date_of_birth?: string;
  gender?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface Teacher {
  id: string;
  email: string;
  password?: string;
  teacher_name: string;
  phone?: string;
  is_class_teacher: boolean;
  assigned_class?: number;
  assigned_subjects?: string[];
  profile_image?: string;
  created_at?: string;
}

export interface Class {
  id: number;
  class_name: string;
  section?: string;
  academic_year?: string;
  description?: string;
}

export interface Subject {
  code: string;
  subject_name: string;
  description?: string;
  icon_emoji?: string;
  color?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  subject_code: string;
  class_id: number;
  exam_type: 'annual' | 'mid_term' | 'unit_test' | 'weekly' | 'practice' | 'quiz';
  questions: any[];
  total_marks: number;
  time_limit?: number;
  passing_marks?: number;
  negative_marking?: boolean;
  shuffle_questions?: boolean;
  instructions?: string;
  scheduled_at?: string;
  due_date?: string;
  is_active: boolean;
  created_by: string;
  created_at?: string;
}

export interface QuizResult {
  id: string;
  student_id: string;
  assessment_id: string;
  score: number;
  total_marks: number;
  percentage?: number;
  grade?: string;
  ai_suggested_grade?: string;
  time_taken?: number;
  teacher_approved: boolean;
  feedback?: string;
  attempt_number?: number;
  submitted_at?: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  title: string;
  content: string;
  subject_code?: string;
  note_type: 'handwritten' | 'typed' | 'converted' | 'ai_generated';
  tags?: string[];
  is_favorite?: boolean;
  color?: string;
  folder?: string;
  created_at: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  sender_id?: string;
  recipient_type: 'student' | 'class' | 'all';
  recipient_ids?: string[];
  class_id?: number;
  title: string;
  message: string;
  notification_type: 'info' | 'alert' | 'assignment' | 'exam' | 'reminder';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  is_read?: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  marked_by?: string;
}

export interface LeaderboardEntry {
  id: string;
  student_id: string;
  class_id: number;
  subject_code: string;
  total_points: number;
  quiz_points?: number;
  attendance_points?: number;
  participation_points?: number;
  peer_help_points?: number;
  streak_days?: number;
  current_rank?: number;
  badges?: any[];
  level?: number;
  experience_points?: number;
}

// Social Learning Types
export interface PeerHelpRequest {
  id: string;
  requester_id: string;
  helper_id: string | null;
  subject_code?: string;
  topic: string;
  description?: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  urgency?: 'low' | 'normal' | 'high';
  created_at: string;
  updated_at?: string;
}

export interface PeerSession {
  id: string;
  request_id: string;
  requester_id: string;
  helper_id: string;
  topic: string;
  status: 'active' | 'ended';
  rating?: number;
  feedback?: string;
  started_at: string;
  ended_at?: string;
}

export interface PeerMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  sent_at: string;
}

export interface StudentInteraction {
  id: string;
  student_id: string;
  interaction_type: 'quiz_attempt' | 'note_created' | 'peer_help' | 'login' | 'lesson_view';
  related_id?: string;
  subject_code?: string;
  details?: any;
  duration?: number;
  created_at: string;
}

// =====================================================================
// DATABASE HELPER FUNCTIONS
// =====================================================================

// Get all students from a class
export const getClassStudents = async (classId: number): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('current_class', classId)
    .eq('is_active', true)
    .order('roll_number');

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }
  return data || [];
};

// Get student by roll number (for login)
export const getStudentByRollNumber = async (rollNumber: string): Promise<Student | null> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('roll_number', rollNumber)
    .single();

  if (error) return null;
  return data;
};

// Get teacher by email (for login)
export const getTeacherByEmail = async (email: string): Promise<Teacher | null> => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
};

// Get all subjects
export const getSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('subject_name');

  if (error) return [];
  return data || [];
};

// Get assessments for a class
export const getClassAssessments = async (classId: number, subjectCode?: string): Promise<Assessment[]> => {
  let query = supabase
    .from('assessments')
    .select('*')
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (subjectCode) {
    query = query.eq('subject_code', subjectCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

// Get student quiz results
export const getStudentResults = async (studentId: string): Promise<QuizResult[]> => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select(`
            *,
            assessments:assessment_id (title, subject_code, exam_type)
        `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) return [];
  return data || [];
};

// Get leaderboard for a class
export const getClassLeaderboard = async (classId: number, subjectCode?: string): Promise<any[]> => {
  let query = supabase
    .from('leaderboard')
    .select(`
            *,
            students:student_id (student_name, roll_number, profile_image)
        `)
    .eq('class_id', classId)
    .order('total_points', { ascending: false });

  if (subjectCode) {
    query = query.eq('subject_code', subjectCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

// Get student notifications
export const getStudentNotifications = async (studentId: string, classId: number): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .or(`recipient_ids.cs.{${studentId}},class_id.eq.${classId},recipient_type.eq.all`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data || [];
};

// Get attendance for a student
export const getStudentAttendance = async (studentId: string, days: number = 30): Promise<Attendance[]> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('student_attendance')
    .select('*')
    .eq('student_id', studentId)
    .gte('attendance_date', startDate.toISOString().split('T')[0])
    .order('attendance_date', { ascending: false });

  if (error) return [];
  return data || [];
};

// Get student notes
export const getStudentNotes = async (studentId: string, subjectCode?: string): Promise<StudentNote[]> => {
  let query = supabase
    .from('student_notes')
    .select('*')
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false });

  if (subjectCode) {
    query = query.eq('subject_code', subjectCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

// Save a new note
export const saveStudentNote = async (note: Partial<StudentNote>): Promise<{ success: boolean; id?: string }> => {
  const { data, error } = await supabase
    .from('student_notes')
    .insert([note])
    .select('id')
    .single();

  if (error) return { success: false };
  return { success: true, id: data?.id };
};

// Update quiz result with grade
export const updateQuizResult = async (resultId: string, updates: Partial<QuizResult>): Promise<boolean> => {
  const { error } = await supabase
    .from('quiz_results')
    .update(updates)
    .eq('id', resultId);

  return !error;
};

// Get peer help requests
export const getPeerHelpRequests = async (subjectCode?: string): Promise<PeerHelpRequest[]> => {
  let query = supabase
    .from('peer_help_requests')
    .select(`
            *,
            requester:requester_id (student_name, roll_number),
            helper:helper_id (student_name, roll_number)
        `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (subjectCode) {
    query = query.eq('subject_code', subjectCode);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
};

// Create peer help request
export const createPeerHelpRequest = async (request: Partial<PeerHelpRequest>): Promise<{ success: boolean; id?: string }> => {
  const { data, error } = await supabase
    .from('peer_help_requests')
    .insert([request])
    .select('id')
    .single();

  if (error) return { success: false };
  return { success: true, id: data?.id };
};

// Log student interaction
export const logStudentInteraction = async (interaction: Partial<StudentInteraction>): Promise<boolean> => {
  const { error } = await supabase
    .from('student_interactions')
    .insert([{
      ...interaction,
      created_at: new Date().toISOString()
    }]);

  return !error;
};

// =====================================================================
// REALTIME SUBSCRIPTIONS
// =====================================================================

// Subscribe to notifications
export const subscribeToNotifications = (classId: number, callback: (notification: Notification) => void) => {
  return supabase
    .channel(`notifications:${classId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `class_id=eq.${classId}`
    }, (payload) => {
      callback(payload.new as Notification);
    })
    .subscribe();
};

// Subscribe to leaderboard updates
export const subscribeToLeaderboard = (classId: number, callback: (entry: LeaderboardEntry) => void) => {
  return supabase
    .channel(`leaderboard:${classId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'leaderboard',
      filter: `class_id=eq.${classId}`
    }, (payload) => {
      callback(payload.new as LeaderboardEntry);
    })
    .subscribe();
};