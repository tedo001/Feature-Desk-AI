import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    ArrowLeft,
    Users,
    Star,
    MessageCircle,
    CheckCircle,
    Clock,
    ThumbsUp,
    Eye,
    Send,
    Award,
    AlertTriangle,
    Shield,
    ChevronRight
} from 'lucide-react';

interface Answer {
    id: string;
    student_id: string;
    student_name: string;
    question: string;
    answer_text: string;
    subject: string;
    topic: string;
    submitted_at: string;
    reviews_received: number;
    average_rating: number;
    is_reviewed_by_me: boolean;
}

interface Review {
    id: string;
    answer_id: string;
    reviewer_id: string;
    reviewer_name: string;
    rating: number;
    feedback: string;
    is_helpful: boolean;
    helpfulness_score: number;
    created_at: string;
    is_approved: boolean;
}

interface MyReview {
    answer_id: string;
    rating: number;
    feedback: string;
}

export default function PeerReview() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<'review' | 'my-answers' | 'my-reviews'>('review');
    const [pendingAnswers, setPendingAnswers] = useState<Answer[]>([]);
    const [myAnswers, setMyAnswers] = useState<Answer[]>([]);
    const [myReviews, setMyReviews] = useState<Review[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
    const [reviewInProgress, setReviewInProgress] = useState<MyReview | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [peerPoints, setPeerPoints] = useState(250);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Mock data for demonstration
        const mockPendingAnswers: Answer[] = [
            {
                id: 'ans1',
                student_id: 'other1',
                student_name: 'Anonymous Peer',
                question: 'Explain the process of photosynthesis and its importance for life on Earth.',
                answer_text: 'Photosynthesis is the process by which plants convert sunlight into energy. They take in carbon dioxide from the air and water from the soil. Using chlorophyll in their leaves, they convert these into glucose and oxygen. The glucose is used for energy and growth, while oxygen is released into the atmosphere. This process is crucial because it produces the oxygen we breathe and forms the base of most food chains on Earth.',
                subject: 'SCIENCE',
                topic: 'Biology - Plants',
                submitted_at: new Date(Date.now() - 3600000).toISOString(),
                reviews_received: 1,
                average_rating: 4,
                is_reviewed_by_me: false
            },
            {
                id: 'ans2',
                student_id: 'other2',
                student_name: 'Anonymous Peer',
                question: 'Write a paragraph on the importance of water conservation.',
                answer_text: 'Water is essential for all life on Earth. As our population grows and climate change affects rainfall patterns, conserving water becomes more important. We can save water by fixing leaks, using water-efficient appliances, taking shorter showers, and collecting rainwater for gardens. Industries and agriculture also need to adopt water-saving technologies. By conserving water today, we ensure that future generations will have access to this precious resource.',
                subject: 'ENGLISH',
                topic: 'Essay Writing',
                submitted_at: new Date(Date.now() - 7200000).toISOString(),
                reviews_received: 2,
                average_rating: 4.5,
                is_reviewed_by_me: false
            },
            {
                id: 'ans3',
                student_id: 'other3',
                student_name: 'Anonymous Peer',
                question: 'Solve and explain: Find the HCF of 24 and 36.',
                answer_text: 'To find the HCF (Highest Common Factor) of 24 and 36, I use the prime factorization method.\n\n24 = 2 × 2 × 2 × 3 = 2³ × 3\n36 = 2 × 2 × 3 × 3 = 2² × 3²\n\nThe common factors are 2² and 3 (taking the lowest power).\nSo HCF = 2² × 3 = 4 × 3 = 12\n\nTherefore, the HCF of 24 and 36 is 12.',
                subject: 'MATH',
                topic: 'Number Theory',
                submitted_at: new Date(Date.now() - 10800000).toISOString(),
                reviews_received: 0,
                average_rating: 0,
                is_reviewed_by_me: false
            }
        ];

        const mockMyAnswers: Answer[] = [
            {
                id: 'myans1',
                student_id: (user as any)?.id || 'me',
                student_name: (user as any)?.student_name || 'You',
                question: 'Explain Newton\'s Third Law of Motion with an example.',
                answer_text: 'Newton\'s Third Law states that for every action, there is an equal and opposite reaction. When you push against a wall, the wall pushes back on you with the same force. Another example is walking - when you push the ground backward with your foot, the ground pushes you forward.',
                subject: 'SCIENCE',
                topic: 'Physics',
                submitted_at: new Date(Date.now() - 86400000).toISOString(),
                reviews_received: 3,
                average_rating: 4.3,
                is_reviewed_by_me: false
            }
        ];

        const mockMyReviews: Review[] = [
            {
                id: 'rev1',
                answer_id: 'other_ans1',
                reviewer_id: (user as any)?.id || 'me',
                reviewer_name: 'You',
                rating: 4,
                feedback: 'Good explanation! You covered the main points well. Consider adding more real-world examples.',
                is_helpful: true,
                helpfulness_score: 5,
                created_at: new Date(Date.now() - 43200000).toISOString(),
                is_approved: true
            }
        ];

        setPendingAnswers(mockPendingAnswers);
        setMyAnswers(mockMyAnswers);
        setMyReviews(mockMyReviews);
    };

    const startReview = (answer: Answer) => {
        setSelectedAnswer(answer);
        setReviewInProgress({
            answer_id: answer.id,
            rating: 0,
            feedback: ''
        });
    };

    const submitReview = async () => {
        if (!reviewInProgress || reviewInProgress.rating === 0 || !reviewInProgress.feedback) return;

        setIsSubmitting(true);
        try {
            // In production, save to Supabase
            const newReview: Review = {
                id: `rev_${Date.now()}`,
                answer_id: reviewInProgress.answer_id,
                reviewer_id: (user as any)?.id || 'me',
                reviewer_name: (user as any)?.student_name || 'You',
                rating: reviewInProgress.rating,
                feedback: reviewInProgress.feedback,
                is_helpful: true,
                helpfulness_score: 0,
                created_at: new Date().toISOString(),
                is_approved: true // In production, would need moderation
            };

            setMyReviews(prev => [newReview, ...prev]);

            // Update pending answers to mark as reviewed
            setPendingAnswers(prev =>
                prev.map(a => a.id === reviewInProgress.answer_id
                    ? { ...a, is_reviewed_by_me: true, reviews_received: a.reviews_received + 1 }
                    : a
                )
            );

            // Award points
            setPeerPoints(prev => prev + 10);

            // Reset state
            setSelectedAnswer(null);
            setReviewInProgress(null);

        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (count: number, onSelect?: (rating: number) => void, interactive = false) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <button
                        key={i}
                        onClick={() => interactive && onSelect && onSelect(i)}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        <Star
                            className={`w-6 h-6 ${i <= count
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <Users className="w-6 h-6 text-emerald-500" />
                                <h1 className="text-xl font-bold text-gray-800">Peer Review</h1>
                            </div>
                        </div>

                        {/* Points Badge */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full">
                                <Award className="w-5 h-5" />
                                <span className="font-semibold">{peerPoints} Points</span>
                            </div>
                            <button
                                onClick={() => setShowGuidelines(true)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <Shield className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 overflow-x-auto">
                        {[
                            { id: 'review', label: 'Review Peers', icon: Eye, count: pendingAnswers.filter(a => !a.is_reviewed_by_me).length },
                            { id: 'my-answers', label: 'My Answers', icon: MessageCircle },
                            { id: 'my-reviews', label: 'My Reviews', icon: CheckCircle, count: myReviews.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Review Tab */}
                {activeTab === 'review' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Answer List */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Answers to Review</h2>

                            {pendingAnswers.filter(a => !a.is_reviewed_by_me).length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700">All caught up!</h3>
                                    <p className="text-gray-500 mt-1">No pending answers to review.</p>
                                </div>
                            ) : (
                                pendingAnswers.filter(a => !a.is_reviewed_by_me).map(answer => (
                                    <div
                                        key={answer.id}
                                        onClick={() => startReview(answer)}
                                        className={`bg-white rounded-xl shadow p-4 cursor-pointer transition-all hover:shadow-lg ${selectedAnswer?.id === answer.id ? 'ring-2 ring-emerald-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {answer.subject}
                                            </span>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                {new Date(answer.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>

                                        <p className="font-medium text-gray-800 mb-2 line-clamp-2">{answer.question}</p>
                                        <p className="text-sm text-gray-600 line-clamp-3">{answer.answer_text}</p>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Users className="w-4 h-4" />
                                                <span>{answer.reviews_received} reviews</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                                <span>Review</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Review Panel */}
                        <div className="lg:sticky lg:top-32">
                            {selectedAnswer && reviewInProgress ? (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Write Your Review</h3>

                                    {/* Question */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-gray-500 mb-1">Question:</p>
                                        <p className="font-medium text-gray-800">{selectedAnswer.question}</p>
                                    </div>

                                    {/* Answer */}
                                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-blue-600 mb-1">Peer's Answer:</p>
                                        <p className="text-gray-800 whitespace-pre-wrap">{selectedAnswer.answer_text}</p>
                                    </div>

                                    {/* Rating */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rate this answer
                                        </label>
                                        {renderStars(
                                            reviewInProgress.rating,
                                            (rating) => setReviewInProgress({ ...reviewInProgress, rating }),
                                            true
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">
                                            {reviewInProgress.rating === 0 && 'Click to rate'}
                                            {reviewInProgress.rating === 1 && 'Needs improvement'}
                                            {reviewInProgress.rating === 2 && 'Below average'}
                                            {reviewInProgress.rating === 3 && 'Average'}
                                            {reviewInProgress.rating === 4 && 'Good'}
                                            {reviewInProgress.rating === 5 && 'Excellent!'}
                                        </p>
                                    </div>

                                    {/* Feedback */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Constructive Feedback *
                                        </label>
                                        <textarea
                                            value={reviewInProgress.feedback}
                                            onChange={(e) => setReviewInProgress({ ...reviewInProgress, feedback: e.target.value })}
                                            placeholder="What did they do well? How can they improve?"
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            Minimum 20 characters required
                                        </p>
                                    </div>

                                    {/* Quick Feedback Buttons */}
                                    <div className="mb-6">
                                        <p className="text-sm text-gray-500 mb-2">Quick suggestions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                'Good explanation!',
                                                'Add more examples',
                                                'Check spelling',
                                                'Well structured',
                                                'Needs more detail'
                                            ].map(suggestion => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => setReviewInProgress({
                                                        ...reviewInProgress,
                                                        feedback: reviewInProgress.feedback
                                                            ? `${reviewInProgress.feedback} ${suggestion}`
                                                            : suggestion
                                                    })}
                                                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        onClick={submitReview}
                                        disabled={reviewInProgress.rating === 0 || reviewInProgress.feedback.length < 20 || isSubmitting}
                                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Submit Review (+10 points)
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                    <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600">Select an Answer</h3>
                                    <p className="text-gray-400 mt-1">Click on an answer card to start reviewing</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* My Answers Tab */}
                {activeTab === 'my-answers' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Submitted Answers</h2>

                        {myAnswers.map(answer => (
                            <div key={answer.id} className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {answer.subject}
                                        </span>
                                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                            {answer.topic}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {answer.average_rating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <span className="font-semibold">{answer.average_rating.toFixed(1)}</span>
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {answer.reviews_received} reviews
                                        </span>
                                    </div>
                                </div>

                                <p className="font-medium text-gray-800 mb-2">{answer.question}</p>
                                <p className="text-gray-600 whitespace-pre-wrap">{answer.answer_text}</p>

                                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                                    Submitted {new Date(answer.submitted_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* My Reviews Tab */}
                {activeTab === 'my-reviews' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Reviews You've Given</h2>

                        {myReviews.map(review => (
                            <div key={review.id} className="bg-white rounded-xl shadow p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {renderStars(review.rating)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {review.is_approved && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Approved
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-700">{review.feedback}</p>

                                {review.helpfulness_score > 0 && (
                                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-500">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{review.helpfulness_score} students found this helpful</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Guidelines Modal */}
            {showGuidelines && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-8 h-8 text-emerald-500" />
                            <h2 className="text-xl font-bold text-gray-800">Peer Review Guidelines</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Be Constructive</h4>
                                    <p className="text-sm text-gray-600">Focus on how the answer can be improved, not just what's wrong.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Be Respectful</h4>
                                    <p className="text-sm text-gray-600">Remember everyone is learning. Be kind and encouraging.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Be Specific</h4>
                                    <p className="text-sm text-gray-600">Point out exactly what could be improved with examples.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-gray-800">Reviews are Moderated</h4>
                                    <p className="text-sm text-gray-600">Teachers review all feedback before it's shown to peers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-emerald-800 flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Earn Points!
                            </h4>
                            <ul className="text-sm text-emerald-700 mt-2 space-y-1">
                                <li>• +10 points for each review submitted</li>
                                <li>• +5 bonus if your review is marked helpful</li>
                                <li>• +20 points for getting 5-star reviews on your answers</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setShowGuidelines(false)}
                            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
