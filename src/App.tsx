import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ClassSubjectSelector from './components/ClassSubjectSelector';
import StudentDashboard from './components/student/StudentDashboard.tsx';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import SchoolDashboard from './components/school/SchoolDashboard';
import QuizApp from './components/student/QuizApp';
import ExaminationApp from './components/student/ExaminationApp';
import NotesApp from './components/student/NotesApp';
import DashboardAnalysis from './components/student/DashboardAnalysis';
import TestApp from './components/student/TestApp';
import NotificationCenter from './components/student/NotificationCenter';
import HistoryViewer from './components/student/HistoryViewer';
import LifeActivityApp from './components/student/LifeActivityApp';
import FloatingAIChatbot from './components/student/FloatingAIChatbot';
import LiveChatbot from './components/student/LiveChatbot';
import SocialLearningDashboard from './components/student/SocialLearningDashboard';
import SelfAssessment from './components/student/SelfAssessment';
import PeerReview from './components/student/PeerReview';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScreenAdapter from './components/common/ScreenAdapter';

function AppContent() {
    const { user, userType, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Feature Desk...</p>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!user || !userType) {
        return (
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // School admin - direct to school dashboard
    if (userType === 'school') {
        return (
            <Routes>
                <Route path="/" element={<SchoolDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // Student without class/subject selected
    if (userType === 'student' && (!(user as any).current_class || !(user as any).current_subject)) {
        return (
            <Routes>
                <Route path="/" element={<ClassSubjectSelector />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // Teacher (class teacher doesn't need subject selection)
    if (userType === 'teacher' && !(user as any).is_class_teacher && !((user as any).assigned_subjects?.length)) {
        return (
            <Routes>
                <Route path="/" element={<ClassSubjectSelector />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // Routes for authenticated users
    return (
        <>
            <PWAInstallPrompt />
            {(userType === 'student' || userType === 'teacher') && <FloatingAIChatbot />}
            <Routes>
                {userType === 'student' ? (
                    <>
                        <Route path="/" element={<StudentDashboard />} />
                        <Route path="/quiz" element={<QuizApp />} />
                        <Route path="/history" element={<HistoryViewer />} />
                        <Route path="/exam" element={<ExaminationApp />} />
                        <Route path="/notes" element={<NotesApp />} />
                        <Route path="/dashboard" element={<DashboardAnalysis />} />
                        <Route path="/chatbot" element={<LiveChatbot />} />
                        <Route path="/life-activity" element={<LifeActivityApp />} />
                        <Route path="/test" element={<TestApp />} />
                        <Route path="/notifications" element={<NotificationCenter />} />
                        <Route path="/social-learning" element={<SocialLearningDashboard />} />
                        <Route path="/self-assessment" element={<SelfAssessment />} />
                        <Route path="/peer-review" element={<PeerReview />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<TeacherDashboard />} />
                        <Route path="/chatbot" element={<LiveChatbot />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <ScreenAdapter>
                <AppContent />
            </ScreenAdapter>
        </AuthProvider>
    );
}

export default App;
