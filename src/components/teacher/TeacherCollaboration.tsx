import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    BookOpen,
    FileText,
    Share2,
    Lock,
    Globe,
    MessageCircle,
    UserPlus,
    CheckCircle,
    X,
    Clock,
    Star,
    ChevronDown,
    Eye,
    Edit3,
    Copy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface QuestionBank {
    id: string;
    name: string;
    subject: string;
    topic: string;
    description: string;
    question_count: number;
    owner_id: string;
    owner_name: string;
    visibility: 'private' | 'school' | 'public';
    collaborators: Collaborator[];
    created_at: string;
    updated_at: string;
    is_starred: boolean;
}

interface Collaborator {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
    added_at: string;
}

interface InviteRequest {
    id: string;
    bank_name: string;
    from_name: string;
    role: 'editor' | 'viewer';
    sent_at: string;
}

export default function TeacherCollaboration() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'my-banks' | 'shared' | 'invites'>('my-banks');
    const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
    const [sharedBanks, setSharedBanks] = useState<QuestionBank[]>([]);
    const [invites, setInvites] = useState<InviteRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);

    // Create form state
    const [newBankName, setNewBankName] = useState('');
    const [newBankSubject, setNewBankSubject] = useState('MATH');
    const [newBankTopic, setNewBankTopic] = useState('');
    const [newBankDescription, setNewBankDescription] = useState('');
    const [newBankVisibility, setNewBankVisibility] = useState<'private' | 'school' | 'public'>('private');

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Mock data for demonstration
        const mockMyBanks: QuestionBank[] = [
            {
                id: 'bank1',
                name: 'Algebra Fundamentals',
                subject: 'MATH',
                topic: 'Algebra',
                description: 'Questions covering algebraic expressions, equations, and inequalities',
                question_count: 45,
                owner_id: (user as any)?.id || 'me',
                owner_name: (user as any)?.teacher_name || 'You',
                visibility: 'school',
                collaborators: [
                    { id: 'c1', name: 'Mrs. Sharma', email: 'sharma@school.edu', role: 'editor', added_at: '2026-01-15' },
                    { id: 'c2', name: 'Mr. Patel', email: 'patel@school.edu', role: 'viewer', added_at: '2026-01-20' }
                ],
                created_at: '2026-01-10T10:00:00Z',
                updated_at: '2026-02-05T14:30:00Z',
                is_starred: true
            },
            {
                id: 'bank2',
                name: 'Trigonometry Practice',
                subject: 'MATH',
                topic: 'Trigonometry',
                description: 'Comprehensive trigonometry questions for Class 10',
                question_count: 32,
                owner_id: (user as any)?.id || 'me',
                owner_name: (user as any)?.teacher_name || 'You',
                visibility: 'private',
                collaborators: [],
                created_at: '2026-01-25T09:00:00Z',
                updated_at: '2026-02-01T11:00:00Z',
                is_starred: false
            }
        ];

        const mockSharedBanks: QuestionBank[] = [
            {
                id: 'shared1',
                name: 'Physics - Motion & Forces',
                subject: 'SCIENCE',
                topic: 'Physics',
                description: 'Newton\'s laws, motion equations, and force problems',
                question_count: 58,
                owner_id: 'teacher2',
                owner_name: 'Dr. Krishnan',
                visibility: 'school',
                collaborators: [
                    { id: 'c1', name: (user as any)?.teacher_name || 'You', email: 'you@school.edu', role: 'editor', added_at: '2026-01-28' }
                ],
                created_at: '2025-12-15T08:00:00Z',
                updated_at: '2026-02-04T16:00:00Z',
                is_starred: false
            },
            {
                id: 'shared2',
                name: 'Chemistry Reactions Bank',
                subject: 'SCIENCE',
                topic: 'Chemistry',
                description: 'Chemical equations, balancing, and reaction types',
                question_count: 40,
                owner_id: 'teacher3',
                owner_name: 'Ms. Reddy',
                visibility: 'school',
                collaborators: [
                    { id: 'c1', name: (user as any)?.teacher_name || 'You', email: 'you@school.edu', role: 'viewer', added_at: '2026-02-01' }
                ],
                created_at: '2026-01-05T10:00:00Z',
                updated_at: '2026-02-03T09:00:00Z',
                is_starred: true
            }
        ];

        const mockInvites: InviteRequest[] = [
            {
                id: 'inv1',
                bank_name: 'English Grammar Complete',
                from_name: 'Mrs. Menon',
                role: 'editor',
                sent_at: '2026-02-06T10:00:00Z'
            }
        ];

        setQuestionBanks(mockMyBanks);
        setSharedBanks(mockSharedBanks);
        setInvites(mockInvites);
    };

    const createQuestionBank = async () => {
        if (!newBankName || !newBankSubject) return;

        const newBank: QuestionBank = {
            id: `bank_${Date.now()}`,
            name: newBankName,
            subject: newBankSubject,
            topic: newBankTopic,
            description: newBankDescription,
            question_count: 0,
            owner_id: (user as any)?.id || 'me',
            owner_name: (user as any)?.teacher_name || 'You',
            visibility: newBankVisibility,
            collaborators: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_starred: false
        };

        setQuestionBanks(prev => [newBank, ...prev]);
        setShowCreateModal(false);
        resetCreateForm();
    };

    const resetCreateForm = () => {
        setNewBankName('');
        setNewBankSubject('MATH');
        setNewBankTopic('');
        setNewBankDescription('');
        setNewBankVisibility('private');
    };

    const sendInvite = async () => {
        if (!inviteEmail || !selectedBank) return;

        // In production, this would send an email and create a pending invite
        const newCollaborator: Collaborator = {
            id: `collab_${Date.now()}`,
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: inviteRole,
            added_at: new Date().toISOString()
        };

        setQuestionBanks(prev => prev.map(bank =>
            bank.id === selectedBank.id
                ? { ...bank, collaborators: [...bank.collaborators, newCollaborator] }
                : bank
        ));

        setInviteEmail('');
        setShowInviteModal(false);
    };

    const acceptInvite = (inviteId: string) => {
        // In production, this would update the database
        const invite = invites.find(i => i.id === inviteId);
        if (invite) {
            // Would add to shared banks
            setInvites(prev => prev.filter(i => i.id !== inviteId));
        }
    };

    const declineInvite = (inviteId: string) => {
        setInvites(prev => prev.filter(i => i.id !== inviteId));
    };

    const toggleStar = (bankId: string, isShared: boolean) => {
        if (isShared) {
            setSharedBanks(prev => prev.map(bank =>
                bank.id === bankId ? { ...bank, is_starred: !bank.is_starred } : bank
            ));
        } else {
            setQuestionBanks(prev => prev.map(bank =>
                bank.id === bankId ? { ...bank, is_starred: !bank.is_starred } : bank
            ));
        }
    };

    const removeCollaborator = (bankId: string, collabId: string) => {
        setQuestionBanks(prev => prev.map(bank =>
            bank.id === bankId
                ? { ...bank, collaborators: bank.collaborators.filter(c => c.id !== collabId) }
                : bank
        ));
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'private': return <Lock className="w-4 h-4 text-gray-500" />;
            case 'school': return <Users className="w-4 h-4 text-blue-500" />;
            case 'public': return <Globe className="w-4 h-4 text-green-500" />;
            default: return <Lock className="w-4 h-4" />;
        }
    };

    const getVisibilityLabel = (visibility: string) => {
        switch (visibility) {
            case 'private': return 'Private';
            case 'school': return 'School';
            case 'public': return 'Public';
            default: return visibility;
        }
    };

    const filteredMyBanks = questionBanks.filter(bank => {
        const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bank.topic.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || bank.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    const filteredSharedBanks = sharedBanks.filter(bank => {
        const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bank.topic.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || bank.subject === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="bg-white rounded-2xl shadow-lg">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Teacher Collaboration</h2>
                            <p className="text-sm text-gray-500">Share question banks with fellow teachers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Question Bank
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    {[
                        { id: 'my-banks', label: 'My Banks', count: questionBanks.length },
                        { id: 'shared', label: 'Shared With Me', count: sharedBanks.length },
                        { id: 'invites', label: 'Invitations', count: invites.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-200' : 'bg-gray-200'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search & Filter */}
                {activeTab !== 'invites' && (
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search question banks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Subjects</option>
                                <option value="MATH">Mathematics</option>
                                <option value="SCIENCE">Science</option>
                                <option value="ENGLISH">English</option>
                                <option value="HINDI">Hindi</option>
                                <option value="SOCIAL">Social Studies</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* My Banks Tab */}
                {activeTab === 'my-banks' && (
                    <div className="space-y-4">
                        {filteredMyBanks.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No Question Banks Yet</h3>
                                <p className="text-gray-400 mt-1">Create your first question bank to get started</p>
                            </div>
                        ) : (
                            filteredMyBanks.map(bank => (
                                <div key={bank.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={() => toggleStar(bank.id, false)}
                                                className="mt-1"
                                            >
                                                <Star className={`w-5 h-5 ${bank.is_starred ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            </button>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{bank.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                        {bank.subject}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{bank.topic}</span>
                                                    <span className="flex items-center gap-1 text-sm text-gray-400">
                                                        {getVisibilityIcon(bank.visibility)}
                                                        {getVisibilityLabel(bank.visibility)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedBank(bank);
                                                    setShowInviteModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-indigo-500 transition-colors"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {bank.description && (
                                        <p className="text-sm text-gray-600 mb-3">{bank.description}</p>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {bank.question_count} questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Updated {new Date(bank.updated_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {bank.collaborators.length > 0 && (
                                            <div className="flex items-center">
                                                <div className="flex -space-x-2">
                                                    {bank.collaborators.slice(0, 3).map((collab) => (
                                                        <div
                                                            key={collab.id}
                                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                                                            title={collab.name}
                                                        >
                                                            {collab.name.charAt(0)}
                                                        </div>
                                                    ))}
                                                    {bank.collaborators.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                                                            +{bank.collaborators.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    {bank.collaborators.length} collaborator{bank.collaborators.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Collaborators List */}
                                    {bank.collaborators.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Collaborators</h4>
                                            <div className="space-y-2">
                                                {bank.collaborators.map(collab => (
                                                    <div key={collab.id} className="flex items-center justify-between py-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-medium">
                                                                {collab.name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-gray-700">{collab.name}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs ${collab.role === 'editor' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {collab.role}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeCollaborator(bank.id, collab.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Shared With Me Tab */}
                {activeTab === 'shared' && (
                    <div className="space-y-4">
                        {filteredSharedBanks.length === 0 ? (
                            <div className="text-center py-12">
                                <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No Shared Banks</h3>
                                <p className="text-gray-400 mt-1">Banks shared with you will appear here</p>
                            </div>
                        ) : (
                            filteredSharedBanks.map(bank => (
                                <div key={bank.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <button onClick={() => toggleStar(bank.id, true)} className="mt-1">
                                                <Star className={`w-5 h-5 ${bank.is_starred ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            </button>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{bank.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                                        {bank.subject}
                                                    </span>
                                                    <span className="text-sm text-gray-500">by {bank.owner_name}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${bank.collaborators.find(c => c.email === 'you@school.edu')?.role === 'editor'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {bank.collaborators.find(c => c.email === 'you@school.edu')?.role || 'viewer'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-500 transition-colors">
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {bank.description && (
                                        <p className="text-sm text-gray-600 mb-3">{bank.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-4 h-4" />
                                            {bank.question_count} questions
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Updated {new Date(bank.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Invites Tab */}
                {activeTab === 'invites' && (
                    <div className="space-y-4">
                        {invites.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600">No Pending Invitations</h3>
                                <p className="text-gray-400 mt-1">Collaboration invites will appear here</p>
                            </div>
                        ) : (
                            invites.map(invite => (
                                <div key={invite.id} className="border rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{invite.bank_name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Invited by <span className="font-medium">{invite.from_name}</span> as{' '}
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${invite.role === 'editor' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {invite.role}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(invite.sent_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => acceptInvite(invite.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => declineInvite(invite.id)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Create Question Bank</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
                                <input
                                    type="text"
                                    value={newBankName}
                                    onChange={(e) => setNewBankName(e.target.value)}
                                    placeholder="e.g., Algebra Fundamentals"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                    <select
                                        value={newBankSubject}
                                        onChange={(e) => setNewBankSubject(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    >
                                        <option value="MATH">Mathematics</option>
                                        <option value="SCIENCE">Science</option>
                                        <option value="ENGLISH">English</option>
                                        <option value="HINDI">Hindi</option>
                                        <option value="SOCIAL">Social Studies</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                    <input
                                        type="text"
                                        value={newBankTopic}
                                        onChange={(e) => setNewBankTopic(e.target.value)}
                                        placeholder="e.g., Algebra"
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newBankDescription}
                                    onChange={(e) => setNewBankDescription(e.target.value)}
                                    placeholder="Brief description of this question bank..."
                                    rows={2}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: 'private', label: 'Private', icon: Lock },
                                        { value: 'school', label: 'School', icon: Users },
                                        { value: 'public', label: 'Public', icon: Globe }
                                    ].map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setNewBankVisibility(option.value as any)}
                                            className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${newBankVisibility === option.value
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <option.icon className={`w-5 h-5 ${newBankVisibility === option.value ? 'text-indigo-600' : 'text-gray-400'
                                                }`} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createQuestionBank}
                                disabled={!newBankName}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Bank
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && selectedBank && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Invite Collaborator</h2>
                            <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                            Invite a colleague to collaborate on "{selectedBank.name}"
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@school.edu"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setInviteRole('editor')}
                                        className={`p-3 rounded-lg border-2 transition-all ${inviteRole === 'editor' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <Edit3 className={`w-5 h-5 mx-auto mb-1 ${inviteRole === 'editor' ? 'text-green-600' : 'text-gray-400'
                                            }`} />
                                        <p className="font-medium text-sm">Editor</p>
                                        <p className="text-xs text-gray-500">Can add & edit questions</p>
                                    </button>
                                    <button
                                        onClick={() => setInviteRole('viewer')}
                                        className={`p-3 rounded-lg border-2 transition-all ${inviteRole === 'viewer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                    >
                                        <Eye className={`w-5 h-5 mx-auto mb-1 ${inviteRole === 'viewer' ? 'text-blue-600' : 'text-gray-400'
                                            }`} />
                                        <p className="font-medium text-sm">Viewer</p>
                                        <p className="text-xs text-gray-500">Can only view questions</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendInvite}
                                disabled={!inviteEmail}
                                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
