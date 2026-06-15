import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import type { Class, Subject } from '../lib/supabase';

export default function ClassSubjectSelector() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, userType, setClassSubject } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesResponse, subjectsResponse] = await Promise.all([
        supabase.from('classes').select('*').order('id'),
        supabase.from('subjects').select('*').order('subject_name')
      ]);

      if (classesResponse.data) setClasses(classesResponse.data);
      if (subjectsResponse.data) setSubjects(subjectsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (selectedClass && selectedSubject) {
      await setClassSubject(selectedClass, selectedSubject);
    }
  };

  const isClassTeacher = userType === 'teacher' && (user as any)?.is_class_teacher;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.student_name || user?.teacher_name}!
          </h1>
          <p className="text-gray-600">
            {isClassTeacher 
              ? 'Select your class to view overall progress'
              : 'Select your class and subject to continue'
            }
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Class Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              <Users className="inline w-5 h-5 mr-2" />
              Select Class
            </label>
            <div className="grid grid-cols-4 gap-3">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedClass === cls.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium">{cls.class_name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          {!isClassTeacher && (
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <BookOpen className="inline w-5 h-5 mr-2" />
                Select Subject
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.code}
                    onClick={() => setSelectedSubject(subject.code)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedSubject === subject.code
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-medium">{subject.subject_name}</div>
                    <div className="text-sm opacity-75">{subject.code}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedClass || (!isClassTeacher && !selectedSubject)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center"
          >
            Continue to Dashboard
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}