import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Award, 
  AlertCircle, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

interface StudentPerformanceDashboardProps {
  classId: number;
}

// Mock Data
const PERFORMANCE_DATA = [
  { week: 'Week 1', avgScore: 65, attendance: 92 },
  { week: 'Week 2', avgScore: 68, attendance: 95 },
  { week: 'Week 3', avgScore: 74, attendance: 91 },
  { week: 'Week 4', avgScore: 72, attendance: 94 },
  { week: 'Week 5', avgScore: 79, attendance: 96 },
  { week: 'Week 6', avgScore: 82, attendance: 95 },
];

const STUDENTS = [
  { id: 1, name: 'Alice Smith', score: 95, trend: 'up', status: 'Excellent', lastQuiz: 'Math Final', avatar: 'AS' },
  { id: 2, name: 'Bob Jones', score: 78, trend: 'up', status: 'Good', lastQuiz: 'Math Final', avatar: 'BJ' },
  { id: 3, name: 'Charlie Brown', score: 62, trend: 'down', status: 'Needs Support', lastQuiz: 'Physics Test', avatar: 'CB' },
  { id: 4, name: 'Diana Prince', score: 88, trend: 'up', status: 'Very Good', lastQuiz: 'Chemistry Quiz', avatar: 'DP' },
  { id: 5, name: 'Ethan Hunt', score: 45, trend: 'down', status: 'Critical', lastQuiz: 'Math Final', avatar: 'EH' },
];

export default function StudentPerformanceDashboard({ classId }: StudentPerformanceDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredStudents = STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || s.status.includes(filterStatus);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Class Average</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">76%</p>
            <p className="text-sm font-medium text-green-600 flex items-center mt-1">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +4.5% vs last month
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Top Performers</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">12</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Students above 90%</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Needs Intervention</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">4</p>
            <p className="text-sm font-medium text-red-600 flex items-center mt-1">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              -2 from last week
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Enrolled</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">42</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Class {classId}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
            <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 text-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 6 Weeks</option>
              <option>Last 3 Months</option>
              <option>This Semester</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Avg Score (%)" dataKey="avgScore" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" name="Attendance (%)" dataKey="attendance" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4" /> AI Insights
            </div>
            <h3 className="text-xl font-bold mb-4 leading-snug">
              Students struggling with "Quadratic Equations"
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Our analysis shows 30% of the class scored below average on the recent Math assignment. We recommend scheduling a revision session or assigning the interactive PhET simulation.
            </p>
          </div>
          <button className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
            Assign Revision Material
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Student Directory</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Support">Needs Support</option>
                <option value="Critical">Critical</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {student.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">ID: STU-{student.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{student.score}%</span>
                        {student.trend === 'up' ? 
                          <ArrowUpRight className="w-4 h-4 text-green-500" /> : 
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'Excellent' ? 'bg-green-100 text-green-700' :
                        student.status === 'Good' || student.status === 'Very Good' ? 'bg-blue-100 text-blue-700' :
                        student.status === 'Needs Support' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.lastQuiz}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Sparkles icon if missing
function Sparkles(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
