import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../lib/firebaseService';
import {
  ArrowLeft,
  FileText,
  BookOpen,
  BarChart3,
  Download,
  Share2,
  Search,
  Filter,
  Calendar,
  MessageSquare
} from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  type: 'note' | 'quiz' | 'test' | 'report' | 'chat';
  content: string;
  date: string;
  score?: number;
  subject: string;
  questionBreakdown?: any[];
  answerSheetUrl?: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    title: 'Mathematics Quiz - Algebra',
    type: 'quiz',
    content: 'Completed adaptive quiz on quadratic equations',
    date: '2024-01-15T10:30:00',
    score: 85,
    subject: 'Mathematics'
  },
  {
    id: '2',
    title: 'Physics Notes - Chapter 5',
    type: 'note',
    content: 'Notes on thermodynamics and heat transfer',
    date: '2024-01-14T14:20:00',
    subject: 'Physics'
  },
  {
    id: '3',
    title: 'Weekly Progress Report',
    type: 'report',
    content: 'Performance analysis for week 2',
    date: '2024-01-13T16:00:00',
    subject: 'Overall'
  },
  {
    id: '4',
    title: 'Chemistry Test - Reactions',
    type: 'test',
    content: 'Unit test on chemical reactions',
    date: '2024-01-12T11:00:00',
    score: 92,
    subject: 'Chemistry'
  },
  {
    id: '5',
    title: 'English Essay - Literature',
    type: 'note',
    content: 'Essay on Shakespeare\'s Hamlet',
    date: '2024-01-11T13:45:00',
    subject: 'English'
  }
];

export default function HistoryViewer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // Load Real History Data
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      // 1. Chat Sessions
      const sessions = await firestoreService.getUserSessions(user.id);
      const sessionItems: HistoryItem[] = sessions.map(session => ({
        id: session.id,
        title: session.title || 'Chat Session',
        type: 'chat',
        content: session.preview || 'Conversation with AI Assistant',
        date: session.lastMessageAt ? session.lastMessageAt.toISOString() : new Date().toISOString(),
        subject: 'AI Help'
      }));

      // 2. Exam Feedback from Firebase
      const feedbacks = await firestoreService.getStudentFeedback(user.id);
      const feedbackItems: HistoryItem[] = feedbacks.map(fb => ({
        id: fb.id,
        title: `Grade Report: ${fb.examTitle}`,
        type: 'test',
        content: fb.teacherFeedback || `Score: ${fb.score}/${fb.totalMarks} - ${fb.grade}`,
        date: fb.timestamp ? fb.timestamp.toISOString() : new Date().toISOString(),
        score: fb.score ? Math.round((fb.score / fb.totalMarks) * 100) : undefined,
        subject: 'Exam Result',
        questionBreakdown: fb.questionBreakdown,
        answerSheetUrl: fb.answerSheetUrl
      }));

      // Merge with mock data
      // Filter out duplicates if any
      setHistory([...sessionItems, ...feedbackItems, ...mockHistory]);

    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === 'all' || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="w-5 h-5" />;
      case 'quiz':
        return <BookOpen className="w-5 h-5" />;
      case 'test':
        return <BookOpen className="w-5 h-5" />;
      case 'report':
        return <BarChart3 className="w-5 h-5" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-blue-100 text-blue-800';
      case 'test':
        return 'bg-purple-100 text-purple-800';
      case 'report':
        return 'bg-orange-100 text-orange-800';
      case 'chat':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full flex">
      {/* Sidebar - History List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">History</h1>
            <div className="w-10"></div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="note">Notes</option>
              <option value="quiz">Quizzes</option>
              <option value="test">Tests</option>
              <option value="report">Reports</option>
            </select>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {filteredHistory.length > 0 ? (
            filteredHistory.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-purple-50' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{item.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      {item.score !== undefined && (
                        <span className={`text-xs font-medium ${item.score >= 85 ? 'text-green-600' : item.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                          {item.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No history items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Item Details */}
      <div className="flex-1 flex flex-col">
        {selectedItem ? (
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(selectedItem.type)}`}>
                      {getTypeIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedItem.title}</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedItem.subject} • {new Date(selectedItem.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Score (if applicable) */}
                {selectedItem.score !== undefined && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Score</span>
                      <span className={`text-3xl font-bold ${selectedItem.score >= 85 ? 'text-green-600' :
                        selectedItem.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                        {selectedItem.score}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                  <p className="text-gray-800">{selectedItem.content}</p>

                  {/* Mock additional content based on type */}
                  {selectedItem.type === 'quiz' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        This quiz covered key concepts in {selectedItem.subject.toLowerCase()}.
                        Your performance was analyzed to identify areas for improvement.
                      </p>
                    </div>
                  )}

                  {selectedItem.type === 'note' && (
                    <div className="mt-4 space-y-2">
                      <p className="text-gray-700">Key points from this note:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        <li>Converted from handwritten notes</li>
                        <li>Auto-organized by subject and date</li>
                        <li>Searchable and shareable</li>
                      </ul>
                    </div>
                  )}

                  {selectedItem.type === 'report' && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-900">
                        This report provides insights into your learning progress,
                        highlighting strengths and areas that need attention.
                      </p>
                    </div>
                  )}

                  {/* Display Detailed Question Breakdown if available */}
                  {selectedItem.questionBreakdown && selectedItem.questionBreakdown.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Question-wise Feedback</h4>
                      {selectedItem.answerSheetUrl && (
                        <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                          <img src={selectedItem.answerSheetUrl} alt="Graded Answer Sheet" className="w-full h-auto" />
                        </div>
                      )}
                      <div className="space-y-4">
                        {selectedItem.questionBreakdown.map((q: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-900">Q{q.questionNumber}: {q.questionText}</h5>
                              <span className={`text-sm font-bold ${q.marksAwarded === q.totalMarks ? 'text-green-600' : 'text-orange-600'}`}>
                                {q.marksAwarded}/{q.totalMarks}
                              </span>
                            </div>
                            {q.feedback && (
                              <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-100 mt-2">
                                <span className="font-semibold text-purple-600 block mb-1">Feedback:</span>
                                {q.feedback}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No item selected</h3>
              <p className="text-gray-500 mt-2">Select an item from the history to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
