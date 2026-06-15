import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    TrendingUp,
    Bell,
    Calendar,
    Award,
    Clock,
    Eye,
    ChevronRight,
    Star,
    AlertTriangle,
    CheckCircle,
    BarChart3,
    GraduationCap,
    FileText,
    Phone,
    Mail
} from 'lucide-react';

interface ChildProfile {
    id: string;
    name: string;
    roll_number: string;
    class: number;
    section: string;
    photo?: string;
}

interface AcademicRecord {
    subject: string;
    score: number;
    grade: string;
    maxScore: number;
    examType: string;
    date: string;
}

interface Attendance {
    present: number;
    absent: number;
    total: number;
    percentage: number;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'alert' | 'exam' | 'assignment';
    date: string;
    read: boolean;
}

export default function ParentPortal() {
    const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
    const [attendance, setAttendance] = useState<Attendance>({ present: 0, absent: 0, total: 0, percentage: 0 });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'attendance' | 'notifications'>('overview');
    const [loading, setLoading] = useState(true);

    // Mock data for demonstration
    useEffect(() => {
        loadParentData();
    }, []);

    const loadParentData = async () => {
        setLoading(true);
        try {
            // In production, this would fetch from Supabase based on parent's linked children
            const mockChildren: ChildProfile[] = [
                {
                    id: 'child1',
                    name: 'Arjun Kumar',
                    roll_number: '1034',
                    class: 9,
                    section: 'A',
                    photo: undefined
                },
                {
                    id: 'child2',
                    name: 'Priya Kumar',
                    roll_number: '845',
                    class: 6,
                    section: 'B',
                    photo: undefined
                }
            ];

            setChildren(mockChildren);
            setSelectedChild(mockChildren[0]);

            // Mock academic records
            setAcademicRecords([
                { subject: 'Mathematics', score: 85, grade: 'A', maxScore: 100, examType: 'Unit Test 2', date: '2026-01-28' },
                { subject: 'Science', score: 78, grade: 'B+', maxScore: 100, examType: 'Unit Test 2', date: '2026-01-27' },
                { subject: 'English', score: 92, grade: 'A+', maxScore: 100, examType: 'Unit Test 2', date: '2026-01-26' },
                { subject: 'Hindi', score: 88, grade: 'A', maxScore: 100, examType: 'Unit Test 2', date: '2026-01-25' },
                { subject: 'Social Studies', score: 75, grade: 'B', maxScore: 100, examType: 'Unit Test 2', date: '2026-01-24' },
            ]);

            // Mock attendance
            setAttendance({
                present: 142,
                absent: 8,
                total: 150,
                percentage: 94.7
            });

            // Mock notifications
            setNotifications([
                {
                    id: '1',
                    title: 'PTM Scheduled',
                    message: 'Parent-Teacher Meeting is scheduled for Feb 15th, 2026 at 10:00 AM',
                    type: 'info',
                    date: '2026-02-05',
                    read: false
                },
                {
                    id: '2',
                    title: 'Unit Test Results',
                    message: 'Unit Test 2 results have been published. Arjun scored 85% overall.',
                    type: 'exam',
                    date: '2026-02-01',
                    read: false
                },
                {
                    id: '3',
                    title: 'Assignment Due',
                    message: 'Science project submission deadline is Feb 10th',
                    type: 'assignment',
                    date: '2026-01-30',
                    read: true
                },
                {
                    id: '4',
                    title: 'Attendance Alert',
                    message: 'Arjun was absent on Jan 25th. Please submit leave application if applicable.',
                    type: 'alert',
                    date: '2026-01-26',
                    read: true
                }
            ]);

        } catch (error) {
            console.error('Failed to load parent data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-green-600 bg-green-100';
        if (grade.startsWith('B')) return 'text-blue-600 bg-blue-100';
        if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'info': return <Bell className="w-5 h-5 text-blue-500" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'exam': return <FileText className="w-5 h-5 text-purple-500" />;
            case 'assignment': return <BookOpen className="w-5 h-5 text-green-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const averageScore = academicRecords.length > 0
        ? Math.round(academicRecords.reduce((acc, r) => acc + r.score, 0) / academicRecords.length)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading Parent Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Parent Portal</h1>
                                <p className="text-sm text-gray-500">Track your child's progress</p>
                            </div>
                        </div>

                        {/* Child Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">Viewing:</span>
                            <select
                                value={selectedChild?.id || ''}
                                onChange={(e) => {
                                    const child = children.find(c => c.id === e.target.value);
                                    if (child) setSelectedChild(child);
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg bg-white font-medium"
                            >
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>
                                        {child.name} (Class {child.class}-{child.section})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-1">
                        {[
                            { id: 'overview', label: 'Overview', icon: Eye },
                            { id: 'academics', label: 'Academics', icon: BookOpen },
                            { id: 'attendance', label: 'Attendance', icon: Calendar },
                            { id: 'notifications', label: 'Notifications', icon: Bell }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        {notifications.filter(n => !n.read).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Child Info Card */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {selectedChild?.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-800">{selectedChild?.name}</h2>
                                <div className="flex items-center gap-4 mt-1 text-gray-500">
                                    <span>Roll No: {selectedChild?.roll_number}</span>
                                    <span>Class: {selectedChild?.class}-{selectedChild?.section}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <TrendingUp className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Average</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{averageScore}%</p>
                                <p className="text-sm text-green-500 mt-1">+5% from last month</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Attendance</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{attendance.percentage}%</p>
                                <p className="text-sm text-gray-500 mt-1">{attendance.present}/{attendance.total} days</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <Award className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Rank</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">5th</p>
                                <p className="text-sm text-gray-500 mt-1">Out of 45 students</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-orange-100 rounded-xl">
                                        <Clock className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <span className="text-sm text-gray-500">Study Time</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">2.5h</p>
                                <p className="text-sm text-gray-500 mt-1">Today on platform</p>
                            </div>
                        </div>

                        {/* Recent Performance */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    Recent Test Scores
                                </h3>
                                <div className="space-y-3">
                                    {academicRecords.slice(0, 4).map((record, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-24 text-sm text-gray-600">{record.subject}</div>
                                            <div className="flex-1">
                                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${record.score >= 80 ? 'bg-green-500' :
                                                            record.score >= 60 ? 'bg-blue-500' :
                                                                record.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${record.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${getGradeColor(record.grade)}`}>
                                                {record.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-orange-500" />
                                    Recent Updates
                                </h3>
                                <div className="space-y-3">
                                    {notifications.slice(0, 4).map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-3 rounded-xl flex items-start gap-3 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'
                                                }`}
                                        >
                                            {getNotificationIcon(notification.type)}
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800 text-sm">{notification.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{notification.date}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Academics Tab */}
                {activeTab === 'academics' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-purple-500" />
                                Academic Performance
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-gray-500 text-sm border-b">
                                            <th className="pb-3 font-medium">Subject</th>
                                            <th className="pb-3 font-medium">Exam Type</th>
                                            <th className="pb-3 font-medium">Score</th>
                                            <th className="pb-3 font-medium">Grade</th>
                                            <th className="pb-3 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {academicRecords.map((record, index) => (
                                            <tr key={index} className="border-b last:border-0">
                                                <td className="py-4 font-medium text-gray-800">{record.subject}</td>
                                                <td className="py-4 text-gray-600">{record.examType}</td>
                                                <td className="py-4">
                                                    <span className="text-gray-800">{record.score}</span>
                                                    <span className="text-gray-400">/{record.maxScore}</span>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(record.grade)}`}>
                                                        {record.grade}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-gray-500">{record.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subject-wise Analysis */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Strengths & Areas for Improvement</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-green-50 rounded-xl p-4">
                                    <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Excellent in English (92%)</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Strong in Hindi (88%)</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Good in Mathematics (85%)</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Areas to Improve
                                    </h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-orange-700">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Social Studies needs attention (75%)</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-orange-700">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Science practical concepts (78%)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attendance Tab */}
                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-500" />
                                Attendance Summary
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-green-50 rounded-xl">
                                    <p className="text-4xl font-bold text-green-600">{attendance.present}</p>
                                    <p className="text-green-700 mt-1">Days Present</p>
                                </div>
                                <div className="text-center p-6 bg-red-50 rounded-xl">
                                    <p className="text-4xl font-bold text-red-600">{attendance.absent}</p>
                                    <p className="text-red-700 mt-1">Days Absent</p>
                                </div>
                                <div className="text-center p-6 bg-blue-50 rounded-xl">
                                    <p className="text-4xl font-bold text-blue-600">{attendance.percentage}%</p>
                                    <p className="text-blue-700 mt-1">Attendance Rate</p>
                                </div>
                            </div>

                            {/* Attendance Progress */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Overall Attendance</span>
                                    <span className="font-medium">{attendance.percentage}%</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${attendance.percentage >= 90 ? 'bg-green-500' :
                                            attendance.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${attendance.percentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {attendance.percentage >= 75
                                        ? '✅ Good! Attendance is above the required 75% threshold.'
                                        : '⚠️ Warning: Attendance is below the required 75% threshold.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow p-4 flex items-start gap-4 ${!notification.read ? 'border-l-4 border-blue-500' : ''
                                    }`}
                            >
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-2">{notification.date}</p>
                                </div>
                                {!notification.read && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">New</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t py-4 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>Feature Desk Parent Portal • Read-Only View</p>
                    <p className="mt-1">For any queries, please contact the school administration.</p>
                </div>
            </div>
        </div>
    );
}
