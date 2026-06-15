import { useState, useEffect } from 'react';
import {
    Send,
    Users,
    User,
    Bell,
    X,
    Check
} from 'lucide-react';
import { sendNotification, getStudentsByClass, getClassStudentIds, StudentProfile } from '../../lib/teacherDb';

interface NotificationBroadcasterProps {
    classId: number;
    onClose?: () => void;
}

export default function NotificationBroadcaster({ classId, onClose }: NotificationBroadcasterProps) {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'alert' | 'assignment' | 'exam',
        targetType: 'class' as 'class' | 'selected',
        selectedStudents: [] as string[]
    });

    useEffect(() => {
        loadStudents();
    }, [classId]);

    const loadStudents = async () => {
        setLoading(true);
        const data = await getStudentsByClass(classId);
        setStudents(data);
        setLoading(false);
    };

    const toggleStudent = (studentId: string) => {
        setFormData(prev => ({
            ...prev,
            selectedStudents: prev.selectedStudents.includes(studentId)
                ? prev.selectedStudents.filter(id => id !== studentId)
                : [...prev.selectedStudents, studentId]
        }));
    };

    const selectAll = () => {
        setFormData(prev => ({
            ...prev,
            selectedStudents: students.map(s => s.id)
        }));
    };

    const deselectAll = () => {
        setFormData(prev => ({
            ...prev,
            selectedStudents: []
        }));
    };

    const handleSend = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            alert('Please enter a title and message');
            return;
        }

        setSending(true);

        const recipientIds = formData.targetType === 'class'
            ? await getClassStudentIds(classId)
            : formData.selectedStudents;

        if (recipientIds.length === 0) {
            alert('No recipients selected');
            setSending(false);
            return;
        }

        const success = await sendNotification({
            recipient_type: 'student',
            recipient_ids: recipientIds,
            title: formData.title,
            message: formData.message,
            type: formData.type
        });

        setSending(false);

        if (success) {
            setSent(true);
            setTimeout(() => {
                setSent(false);
                if (onClose) onClose();
            }, 2000);
        } else {
            alert('Failed to send notification');
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'info': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'alert': return 'bg-red-100 text-red-700 border-red-300';
            case 'assignment': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'exam': return 'bg-orange-100 text-orange-700 border-orange-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (sent) {
        return (
            <div className="bg-white rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Sent!</h3>
                <p className="text-gray-600">
                    Your notification has been delivered to{' '}
                    {formData.targetType === 'class' ? 'all students' : `${formData.selectedStudents.length} students`}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Send Notification</h2>
                    <p className="text-gray-600">Broadcast to Class {classId}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Notification Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {(['info', 'alert', 'assignment', 'exam'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFormData(prev => ({ ...prev, type }))}
                            className={`px-4 py-2 rounded-lg border capitalize font-medium transition-colors ${formData.type === type
                                ? getTypeStyles(type)
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Homework Due Tomorrow"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Message */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                </label>
                <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter your message here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            </div>

            {/* Target Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send To
                </label>
                <div className="flex items-center space-x-4 mb-4">
                    <button
                        onClick={() => setFormData(prev => ({ ...prev, targetType: 'class' }))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${formData.targetType === 'class'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Entire Class</span>
                    </button>
                    <button
                        onClick={() => setFormData(prev => ({ ...prev, targetType: 'selected' }))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${formData.targetType === 'selected'
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        <span>Select Students</span>
                    </button>
                </div>

                {/* Student Selection */}
                {formData.targetType === 'selected' && (
                    <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600">
                                {formData.selectedStudents.length} students selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={selectAll}
                                    className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={deselectAll}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-auto">
                                {students.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => toggleStudent(student.id)}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-left transition-colors ${formData.selectedStudents.includes(student.id)
                                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.selectedStudents.includes(student.id)
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300'
                                            }`}>
                                            {formData.selectedStudents.includes(student.id) && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm truncate">{student.student_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <div className={`bg-white rounded-lg p-4 border ${getTypeStyles(formData.type)}`}>
                    <div className="flex items-start space-x-3">
                        <Bell className="w-5 h-5 mt-0.5" />
                        <div>
                            <h5 className="font-semibold">{formData.title || 'Notification Title'}</h5>
                            <p className="text-sm opacity-80 mt-1">{formData.message || 'Your message will appear here...'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Button */}
            <button
                onClick={handleSend}
                disabled={sending || !formData.title.trim() || !formData.message.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {sending ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending...</span>
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" />
                        <span>Send Notification</span>
                    </>
                )}
            </button>
        </div>
    );
}
