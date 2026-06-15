import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Mail, Hash, Lock, Eye, EyeOff, Building2 } from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'school'>('student');
  const [credentials, setCredentials] = useState({
    rollNumber: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginAsDemo } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(credentials, activeTab);

    if (!success) {
      setError('Invalid credentials. Please try again.');
    }

    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Desk</h1>
          <p className="text-gray-600">Digital Classroom Experience</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tab Switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'student'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:text-blue-500'
                }`}
            >
              <Users className="w-4 h-4 mr-1" />
              Student
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'teacher'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-indigo-500'
                }`}
            >
              <Mail className="w-4 h-4 mr-1" />
              Teacher
            </button>
            <button
              onClick={() => setActiveTab('school')}
              className={`flex-1 flex items-center justify-center py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'school'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-600 hover:text-purple-500'
                }`}
            >
              <Building2 className="w-4 h-4 mr-1" />
              School
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'student' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="rollNumber"
                    value={credentials.rollNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your roll number"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    placeholder={activeTab === 'school' ? "Enter admin email" : "Enter your email"}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 ${activeTab === 'school' ? 'focus:ring-purple-500' : 'focus:ring-indigo-500'} focus:border-transparent`}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all ${activeTab === 'student'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : activeTab === 'teacher'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-8 border-t pt-6">
            <p className="text-sm font-semibold text-gray-900 text-center mb-4">
              🚀 Quick Demo Access (No Password)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => loginAsDemo('student')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 transition-all"
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('teacher')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105 transition-all"
              >
                <Mail className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo('school')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-105 transition-all"
              >
                <Building2 className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-3">
              *Bypasses authentication for demonstration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}