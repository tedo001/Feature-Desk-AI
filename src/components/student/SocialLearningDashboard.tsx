import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Users,
    Trophy,
    Star,
    MessageCircle,
    TrendingUp,
    Award,
    Sparkles,
    UserPlus,
    BookOpen,
    Bell,
    Video,
    Circle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PeerChat from './PeerChat';

// Mock data for peer learning - would come from database in production
const peerSuggestions = [
    {
        id: 1,
        name: 'Priya Sharma',
        strongConcepts: ['Quadratic Equations', 'Trigonometry'],
        helpCount: 12,
        rating: 4.8,
        available: true
    },
    {
        id: 2,
        name: 'Rahul Kumar',
        strongConcepts: ['Physics - Motion', 'Newton Laws'],
        helpCount: 8,
        rating: 4.6,
        available: true
    },
    {
        id: 3,
        name: 'Sneha Patel',
        strongConcepts: ['Chemical Reactions', 'Periodic Table'],
        helpCount: 15,
        rating: 4.9,
        available: false
    }
];

const helpersLeaderboard = [
    { rank: 1, name: 'Sneha Patel', helpCount: 45, badge: '🏆', points: 450 },
    { rank: 2, name: 'Amit Singh', helpCount: 38, badge: '🥈', points: 380 },
    { rank: 3, name: 'Priya Sharma', helpCount: 32, badge: '🥉', points: 320 },
    { rank: 4, name: 'Rahul Kumar', helpCount: 28, badge: '⭐', points: 280 },
    { rank: 5, name: 'Kavya Reddy', helpCount: 25, badge: '⭐', points: 250 }
];

const conceptProgress = [
    { concept: 'Algebra', mastery: 85, trend: 'up', weekChange: 8 },
    { concept: 'Geometry', mastery: 72, trend: 'up', weekChange: 5 },
    { concept: 'Trigonometry', mastery: 45, trend: 'down', weekChange: -3 },
    { concept: 'Statistics', mastery: 60, trend: 'up', weekChange: 12 },
    { concept: 'Calculus', mastery: 30, trend: 'neutral', weekChange: 0 }
];

interface SocialLearningDashboardProps {
    onClose?: () => void;
}

export default function SocialLearningDashboard({ onClose }: SocialLearningDashboardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'suggestions' | 'leaderboard' | 'progress'>('suggestions');
    const [requestingHelp, setRequestingHelp] = useState<number | null>(null);

    // Real-time state
    const [onlinePeers, setOnlinePeers] = useState<Set<number>>(new Set([1, 2])); // Mock: peers 1 & 2 online
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [activeSession, setActiveSession] = useState<any | null>(null);
    const [incomingRequest, setIncomingRequest] = useState<any | null>(null);

    // Track presence and subscribe to help requests
    useEffect(() => {
        const userId = (user as any)?.id;
        if (!userId) return;

        // Subscribe to incoming help requests
        const channel = supabase
            .channel('peer_help_requests')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'peer_help_requests',
                    filter: `helper_id=eq.${userId}`
                },
                (payload) => {
                    setIncomingRequest(payload.new);
                }
            )
            .subscribe();

        // Simulate presence for demo
        const presenceInterval = setInterval(() => {
            // Randomly toggle peer online status for demo
            setOnlinePeers(prev => {
                const newSet = new Set(prev);
                if (Math.random() > 0.5) newSet.add(1);
                else newSet.delete(1);
                if (Math.random() > 0.3) newSet.add(2);
                return newSet;
            });
        }, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(presenceInterval);
        };
    }, [user]);

    const handleRequestHelp = useCallback(async (peerId: number, topic?: string) => {
        setRequestingHelp(peerId);

        try {
            // In production, this would create a real help request
            const peer = peerSuggestions.find(p => p.id === peerId);

            // Simulate sending request
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Add to pending requests
            setPendingRequests(prev => [...prev, {
                id: Date.now(),
                peerId,
                peerName: peer?.name,
                topic: topic || peer?.strongConcepts[0],
                status: 'pending',
                createdAt: new Date().toISOString()
            }]);

            // Show success feedback
            alert(`Help request sent to ${peer?.name}! They'll be notified.`);
        } catch (error) {
            console.error('Error sending help request:', error);
        }

        setRequestingHelp(null);
    }, []);

    const handleAcceptRequest = useCallback((request: any) => {
        setActiveSession({
            id: `session_${Date.now()}`,
            requestId: request.id,
            peerName: request.requesterName || 'Student',
            topic: request.topic,
            startedAt: new Date().toISOString()
        });
        setIncomingRequest(null);
    }, []);

    const handleDeclineRequest = useCallback(() => {
        setIncomingRequest(null);
    }, []);

    const handleEndSession = useCallback(() => {
        setActiveSession(null);
    }, []);

    const handleBack = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/');
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen w-full">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-6 h-6 text-purple-600" />
                                Social Learning Dashboard
                            </h1>
                            <p className="text-sm text-gray-500">Connect with peers to learn together</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
                <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'suggestions'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        Peer Suggestions
                    </button>
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'leaderboard'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Trophy className="w-4 h-4" />
                        Helpers Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'progress'
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Concept Progress
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 pb-6 sm:px-6">
                {/* Peer Suggestions Tab */}
                {activeTab === 'suggestions' && (
                    <div className="space-y-4">
                        {/* Info Card */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">AI Peer Matching</h3>
                                    <p className="text-sm text-purple-100 mt-1">
                                        Based on your weak areas, we've found classmates who excel in those concepts.
                                        Learning from peers improves retention by 50%!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Weak Areas Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Your Concepts Needing Help:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {conceptProgress
                                    .filter(c => c.mastery < 60)
                                    .map(c => (
                                        <span key={c.concept} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                                            {c.concept} ({c.mastery}%)
                                        </span>
                                    ))}
                            </div>
                        </div>

                        {/* Peer Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {peerSuggestions.map(peer => (
                                <div key={peer.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {peer.name.charAt(0)}
                                                {/* Live presence indicator */}
                                                {onlinePeers.has(peer.id) && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                                        <Circle className="w-2 h-2 fill-white text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{peer.name}</h4>
                                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    {peer.rating} • {peer.helpCount} helped
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${onlinePeers.has(peer.id)
                                            ? 'bg-green-100 text-green-700'
                                            : peer.available
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {onlinePeers.has(peer.id) && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                                            {onlinePeers.has(peer.id) ? 'Online' : peer.available ? 'Away' : 'Offline'}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 mb-2">Strong in:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {peer.strongConcepts.map(concept => (
                                                <span key={concept} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                                    {concept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRequestHelp(peer.id)}
                                        disabled={!peer.available || requestingHelp === peer.id}
                                        className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${peer.available
                                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {requestingHelp === peer.id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <MessageCircle className="w-4 h-4" />
                                                Request Help
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                        {/* Recognition Banner */}
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8" />
                                <div>
                                    <h3 className="font-bold text-lg">Helper Recognition Program</h3>
                                    <p className="text-sm text-yellow-100">
                                        Students who help others earn special badges and recognition!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    Top Helpers This Month
                                </h3>
                            </div>
                            <div className="divide-y">
                                {helpersLeaderboard.map(helper => (
                                    <div
                                        key={helper.rank}
                                        className={`p-4 flex items-center justify-between ${helper.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl w-8 text-center">{helper.badge}</span>
                                            <div>
                                                <h4 className="font-medium text-gray-900">{helper.name}</h4>
                                                <p className="text-sm text-gray-500">{helper.helpCount} students helped</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-purple-600">{helper.points} pts</p>
                                            <p className="text-xs text-gray-500">Rank #{helper.rank}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Your Stats */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 mb-4">Your Helper Stats</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-purple-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-purple-600">5</p>
                                    <p className="text-xs text-gray-500">Students Helped</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-green-600">50</p>
                                    <p className="text-xs text-gray-500">Points Earned</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-2xl font-bold text-blue-600">#24</p>
                                    <p className="text-xs text-gray-500">Your Rank</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Concept Progress Tab */}
                {activeTab === 'progress' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                Concept-wise Progress
                            </h3>
                            <div className="space-y-4">
                                {conceptProgress.map(item => (
                                    <div key={item.concept} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-700">{item.concept}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${item.trend === 'up' ? 'text-green-600' :
                                                    item.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    {item.trend === 'up' && '↑'}
                                                    {item.trend === 'down' && '↓'}
                                                    {item.trend === 'neutral' && '→'}
                                                    {item.weekChange > 0 ? '+' : ''}{item.weekChange}%
                                                </span>
                                                <span className="font-bold text-gray-900">{item.mastery}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${item.mastery >= 80 ? 'bg-green-500' :
                                                    item.mastery >= 60 ? 'bg-yellow-500' :
                                                        item.mastery >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                                    }`}
                                                style={{ width: `${item.mastery}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Get Help Suggestion */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
                            <h3 className="font-semibold mb-2">💡 AI Recommendation</h3>
                            <p className="text-sm text-indigo-100 mb-3">
                                You're struggling with <strong>Trigonometry</strong> and <strong>Calculus</strong>.
                                3 classmates who excel in these topics are available to help!
                            </p>
                            <button
                                onClick={() => setActiveTab('suggestions')}
                                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                            >
                                Find a Study Buddy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pending Requests Banner */}
            {pendingRequests.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40">
                    <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Bell className="w-5 h-5 text-purple-600" />
                            <span className="font-medium text-gray-900">Pending Requests</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {pendingRequests.length}
                            </span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {pendingRequests.slice(0, 3).map(req => (
                                <div key={req.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="text-sm">
                                        <span className="font-medium">{req.peerName}</span>
                                        <p className="text-xs text-gray-500">{req.topic}</p>
                                    </div>
                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                        Waiting
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Incoming Request Modal */}
            {incomingRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Video className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">Help Request</h3>
                            <p className="text-gray-600">
                                A classmate needs help with <strong>{incomingRequest.topic || 'a topic'}</strong>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeclineRequest}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleAcceptRequest(incomingRequest)}
                                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Session Chat */}
            {activeSession && (
                <PeerChat
                    sessionId={activeSession.id}
                    currentUserId={(user as any)?.id || 'current_user'}
                    peerName={activeSession.peerName}
                    topic={activeSession.topic}
                    onClose={() => setActiveSession(null)}
                    onEndSession={handleEndSession}
                />
            )}
        </div>
    );
}
