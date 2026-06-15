import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    BookOpen,
    History,
    GraduationCap,
    PenTool,
    BarChart3,
    MessageCircle,
    Heart,
    FileText,
    Bell,
    Move,
    FlaskConical,
    Users,
    Star,
    UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadNotificationCount } from '../../lib/notificationService';

interface AppInfo {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    route: string;
    image: string;
}

const apps: AppInfo[] = [
    { id: 'quiz', name: 'Quiz', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-500', description: 'Take adaptive quizzes', route: '/quiz', image: '/app-icons/quiz.png' },
    { id: 'test', name: 'Unit Test', icon: <FileText className="w-6 h-6" />, color: 'bg-teal-500', description: 'Standardized tests', route: '/test', image: '/app-icons/test.png' },
    { id: 'exam', name: 'Exam', icon: <GraduationCap className="w-6 h-6" />, color: 'bg-red-500', description: 'High-stakes exams', route: '/exam', image: '/app-icons/exam.png' },
    { id: 'dashboard', name: 'Analysis', icon: <BarChart3 className="w-6 h-6" />, color: 'bg-indigo-500', description: 'Self-reflection & stats', route: '/dashboard', image: '/app-icons/dashboard.png' },
    { id: 'social', name: 'Social', icon: <Users className="w-6 h-6" />, color: 'bg-purple-500', description: 'Peer Learning Hub', route: '/social-learning', image: '/app-icons/social.png' },
    { id: 'chatbot', name: 'Chatbot', icon: <MessageCircle className="w-6 h-6" />, color: 'bg-cyan-500', description: 'AI Companion', route: '/chatbot', image: '/app-icons/chatbot.png' },
    { id: 'notes', name: 'Notes', icon: <PenTool className="w-6 h-6" />, color: 'bg-green-500', description: 'Digital notebook', route: '/notes', image: '/app-icons/notes.png' },
    { id: 'history', name: 'History', icon: <History className="w-6 h-6" />, color: 'bg-purple-500', description: 'Activity log', route: '/history', image: '/app-icons/history.png' },
    { id: 'notifications', name: 'Notify', icon: <Bell className="w-6 h-6" />, color: 'bg-yellow-500', description: 'Communication hub', route: '/notifications', image: '/app-icons/notifications.png' },
    { id: 'life', name: 'Life Skills', icon: <Heart className="w-6 h-6" />, color: 'bg-pink-500', description: 'Activity based questions', route: '/life-activity', image: '/app-icons/life.png' },
    { id: 'science-hub', name: 'Virtual Lab', icon: <FlaskConical className="w-6 h-6" />, color: 'bg-green-600', description: '3D Science Laboratory', route: 'https://scilab-hubx.netlify.app/', image: '/app-icons/science-hub.png' },
    { id: 'self-assessment', name: 'Self Rate', icon: <Star className="w-6 h-6" />, color: 'bg-amber-500', description: 'Self-assessment & reflection', route: '/self-assessment', image: '/app-icons/self-assessment.png' },
    { id: 'peer-review', name: 'Peer Review', icon: <UserCheck className="w-6 h-6" />, color: 'bg-rose-500', description: 'Give & receive feedback', route: '/peer-review', image: '/app-icons/peer-review.png' }
];


export default function CentralHub() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const hubRef = useRef<HTMLDivElement>(null);

    // Poll for unread notification count
    useEffect(() => {
        const studentId = (user as any)?.id;
        if (!studentId) return;

        const checkUnread = () => {
            const count = getUnreadNotificationCount(studentId);
            setUnreadCount(count);
        };

        checkUnread();
        const interval = setInterval(checkUnread, 5000);
        return () => clearInterval(interval);
    }, [user]);

    // Initialize position to bottom right
    useEffect(() => {
        const updatePosition = () => {
            setPosition({
                x: window.innerWidth - 80,
                y: window.innerHeight - 80
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isExpanded) return;

        setIsDragging(true);
        setHasMoved(false);
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        // Prevent default to stop text selection during drag
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || isExpanded) return;

            // Calculate new position
            const newX = e.clientX - dragStartRef.current.x;
            const newY = e.clientY - dragStartRef.current.y;

            // Check if moved enough to consider it a drag (threshold of 5px)
            if (!hasMoved) {
                const moveDist = Math.hypot(
                    e.clientX - (dragStartRef.current.x + position.x),
                    e.clientY - (dragStartRef.current.y + position.y)
                );
                if (moveDist > 5) {
                    setHasMoved(true);
                }
            }

            // Apply constraints
            const constrainedX = Math.max(20, Math.min(window.innerWidth - 84, newX));
            const constrainedY = Math.max(20, Math.min(window.innerHeight - 84, newY));

            if (hasMoved) {
                setPosition({ x: constrainedX, y: constrainedY });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isExpanded, position, hasMoved]);

    const handleHubClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Only toggle if we haven't dragged significantly
        if (!hasMoved) {
            setIsExpanded(!isExpanded);
        }
    };

    const handleAppClick = (route: string) => {
        setIsExpanded(false);
        if (route.startsWith('http')) {
            window.location.href = route;
        } else {
            navigate(route);
        }
    };

    const handleBackdropClick = () => {
        setIsExpanded(false);
    };



    return (
        <>
            {/* Backdrop */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={handleBackdropClick}
                />
            )}

            {/* Hub Container */}
            <div
                ref={hubRef}
                className="fixed z-50 transition-all duration-500 ease-out"
                style={{
                    left: isExpanded ? '50%' : `${position.x}px`,
                    top: isExpanded ? '50%' : `${position.y}px`,
                    transform: isExpanded ? 'translate(-50%, -50%)' : 'none'
                }}
            >
                {/* Central Hub Button - Resized to match apps (w-16 h-16) */}
                <div className="relative group">
                    {/* Simplified Glow Effect */}
                    <div className={`absolute inset-0 rounded-full bg-blue-500/30 blur-lg transition-all duration-500 
                        ${isExpanded ? 'scale-125 opacity-50' : 'scale-0 opacity-0 group-hover:scale-110 group-hover:opacity-40'}`}></div>

                    <button
                        onMouseDown={handleMouseDown}
                        onClick={handleHubClick}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 
                            ${isDragging && hasMoved ? 'cursor-grabbing' : 'cursor-grab'} 
                            relative bg-white border-2 border-slate-100 shadow-lg z-50 overflow-hidden
                            hover:shadow-xl hover:scale-105 active:scale-95`}
                    >
                        {/* Icon Container */}
                        <div className={`transition-all duration-500 transform
                            ${isExpanded ? 'rotate-[135deg] text-red-500' : 'rotate-0 text-blue-600'}`}>
                            <Plus className="w-8 h-8" strokeWidth={2.5} />
                        </div>

                        {/* Drag indicator (only shows when stuck in corner) */}
                        {isDragging && hasMoved && !isExpanded && (
                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                <Move className="w-6 h-6 text-slate-500 opacity-50" />
                            </div>
                        )}
                    </button>

                    {/* Label for Central Hub */}
                    {!isExpanded && !isDragging && (
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">
                            Menu
                        </div>
                    )}
                </div>

                {/* Apps Circle */}
                {isExpanded && (
                    <div className="absolute inset-0" style={{ zIndex: 45 }}>
                        {apps.map((app, index) => {
                            const angle = (index * 360) / apps.length - 90;
                            const radius = 260; // Increased radius to prevent clumping
                            const x = Math.cos((angle * Math.PI) / 180) * radius;
                            const y = Math.sin((angle * Math.PI) / 180) * radius;

                            return (
                                <div
                                    key={app.id}
                                    className="absolute top-1/2 left-1/2"
                                    style={{
                                        marginLeft: `${x}px`,
                                        marginTop: `${y}px`,
                                        transform: 'translate(-50%, -50%)',
                                        animation: `appSpread 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${index * 0.05}s both`
                                    }}
                                >
                                    <div className="relative group flex flex-col items-center">
                                        <button
                                            onClick={() => handleAppClick(app.route)}
                                            className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-white bg-white hover:shadow-xl overflow-hidden relative"
                                        >
                                            <ImageWithFallback
                                                src={app.image}
                                                alt={app.name}
                                                fallback={app.icon}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                        {/* Notification badge for the Notify app */}
                                        {app.id === 'notifications' && unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md animate-pulse z-50 border-2 border-white">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </div>
                                        )}

                                        {/* Label below icon */}
                                        <div className="absolute top-full mt-2 bg-white text-slate-700 text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-50 pointer-events-none font-medium border border-slate-100 opacity-90 transition-opacity">
                                            {app.name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes appSpread {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
          80% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
        </>
    );
}

// Helper component for image fallback
function ImageWithFallback({ src, alt, fallback, className }: { src: string, alt: string, fallback: React.ReactNode, className?: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return <div className={`flex items-center justify-center text-slate-500 ${className}`}>{fallback}</div>;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
