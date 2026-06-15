import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, AlertCircle, CheckCircle, XCircle, Sparkles, Brain, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getRandomQuizQuestions, hasUploadedMaterials } from '../../lib/questionDb';
import { generateAdaptiveQuiz, generateSocraticHints } from '../../lib/gemini';
import { saveQuizResultHybrid } from '../../lib/db';

interface QuizQuestion {
  id: number | string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  timeEstimate: number;
  marks?: number;
  difficulty?: string;
  sourceContentTitle?: string;
  imageUrl?: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
  totalMarks: number;
  timeLimit: number;
}

export default function QuizApp() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [noContentMessage, setNoContentMessage] = useState<string | null>(null);

  // Hint State
  const [hints, setHints] = useState<{ level1: string, level2: string, level3: string } | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [loadingHint, setLoadingHint] = useState(false);

  // Launcher states
  const [showLauncher, setShowLauncher] = useState(true);
  const [hasTeacherContent, setHasTeacherContent] = useState(false);
  const [availableQuestionCount, setAvailableQuestionCount] = useState(0);
  const [checkingContent, setCheckingContent] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  // Get current class and subject from user context
  const currentClass = (user as any)?.current_class || 1;
  const currentSubject = (user as any)?.current_subject || 'MATH';
  const subjectName = currentSubject === 'MATH' ? 'Mathematics' :
    currentSubject === 'SCI' ? 'Science' :
      currentSubject === 'ENG' ? 'English' :
        currentSubject === 'HIST' ? 'History' :
          currentSubject === 'PHY' ? 'Physics' : currentSubject;

  // Check for teacher content on mount
  useEffect(() => {
    checkTeacherContent();
  }, []);

  // Timer for quiz
  useEffect(() => {
    if (!quiz || quizCompleted) return;

    if (timeRemaining <= 0) {
      setQuizCompleted(true);
      setShowResults(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, quiz, quizCompleted]);

  // Start timing when a new question is shown
  useEffect(() => {
    if (quiz && !quizCompleted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, quiz]);

  // Check if teacher has uploaded content
  const checkTeacherContent = async () => {
    setCheckingContent(true);
    try {
      const hasMaterials = await hasUploadedMaterials(currentClass, currentSubject);
      setHasTeacherContent(hasMaterials);

      if (hasMaterials) {
        const { questions, available } = await getRandomQuizQuestions(
          currentClass,
          currentSubject,
          100,
          'mixed'
        );
        setAvailableQuestionCount(available ? questions.length : 0);
      }
    } catch (error) {
      console.error('Error checking content:', error);
    } finally {
      setCheckingContent(false);
    }
  };

  // Generate quiz with teacher content
  const generateQuiz = async () => {
    setLoading(true);
    setShowLauncher(false);
    setNoContentMessage(null);

    try {
      // Try to get questions from teacher-uploaded materials
      const { questions, available, message } = await getRandomQuizQuestions(
        currentClass,
        currentSubject,
        5, // Number of questions
        difficulty as 'easy' | 'medium' | 'hard' | 'mixed'
      );

      if (!available || questions.length === 0) {
        // No content available - show message to student
        setNoContentMessage(message);
        setLoading(false);
        return;
      }

      // Convert GeneratedQuestion format to QuizQuestion format
      const quizQuestions: QuizQuestion[] = questions
        .filter(q => q.type === 'mcq' && q.options)
        .map(q => ({
          id: q.id,
          question: q.question,
          options: q.options || [],
          correct: q.correct || 0,
          explanation: q.explanation || 'Please review the lesson material for more details.',
          timeEstimate: 60,
          marks: q.marks,
          difficulty: q.difficulty,
          sourceContentTitle: q.sourceContentTitle,
          imageUrl: q.imageUrl
        }));

      if (quizQuestions.length === 0) {
        setNoContentMessage('No multiple choice questions available. Your teacher needs to generate MCQ questions from the uploaded materials.');
        setLoading(false);
        return;
      }

      const newQuiz: Quiz = {
        title: `${subjectName} Quiz - Class ${currentClass}`,
        questions: quizQuestions,
        totalMarks: quizQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
        timeLimit: quizQuestions.length * 60 // 1 minute per question
      };

      setQuiz(newQuiz);
      setTimeRemaining(newQuiz.timeLimit);
      setSelectedAnswers(new Array(newQuiz.questions.length).fill(-1));
      setReactionTimes(new Array(newQuiz.questions.length).fill(0));
      setCurrentQuestionIndex(0);
      setQuizCompleted(false);
      setShowResults(false);
      setScore(0);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      setNoContentMessage('Failed to load quiz. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate quiz with AI (when no teacher content)
  const generateWithAI = async () => {
    setGeneratingAI(true);
    setShowLauncher(false);
    setNoContentMessage(null);

    try {
      console.log('🤖 Generating AI quiz for:', subjectName, difficulty);
      const aiQuiz = await generateAdaptiveQuiz(subjectName, difficulty, [subjectName]);

      if (aiQuiz && aiQuiz.questions && aiQuiz.questions.length > 0) {
        console.log('✅ AI Quiz generated successfully with', aiQuiz.questions.length, 'questions');
        setQuiz(aiQuiz);
        setTimeRemaining(aiQuiz.timeLimit || 300);
        setSelectedAnswers(new Array(aiQuiz.questions.length).fill(-1));
        setReactionTimes(new Array(aiQuiz.questions.length).fill(0));
        setCurrentQuestionIndex(0);
        setQuizCompleted(false);
        setShowResults(false);
        setScore(0);
      } else {
        // This shouldn't happen now since gemini.ts has fallback
        console.warn('⚠️ AI returned empty quiz, using fallback');
        const fallbackQuiz = createFallbackQuiz();
        setQuiz(fallbackQuiz);
        setTimeRemaining(fallbackQuiz.timeLimit);
        setSelectedAnswers(new Array(fallbackQuiz.questions.length).fill(-1));
        setReactionTimes(new Array(fallbackQuiz.questions.length).fill(0));
      }
    } catch (error) {
      console.error('Failed to generate AI quiz:', error);
      // Use fallback quiz instead of showing error
      const fallbackQuiz = createFallbackQuiz();
      setQuiz(fallbackQuiz);
      setTimeRemaining(fallbackQuiz.timeLimit);
      setSelectedAnswers(new Array(fallbackQuiz.questions.length).fill(-1));
      setReactionTimes(new Array(fallbackQuiz.questions.length).fill(0));
    } finally {
      setGeneratingAI(false);
    }
  };

  // Create a fallback quiz when AI fails
  const createFallbackQuiz = (): Quiz => ({
    title: `${subjectName} Practice Quiz - Class ${currentClass}`,
    questions: [
      {
        id: 1,
        question: `Which of the following best describes a fundamental concept in ${subjectName}?`,
        options: ["A) The correct fundamental concept", "B) An incorrect statement", "C) A common misconception", "D) An unrelated topic"],
        correct: 0,
        explanation: `Understanding fundamentals is key to mastering ${subjectName}.`,
        timeEstimate: 60
      },
      {
        id: 2,
        question: `In ${subjectName}, what is the relationship between theory and practice?`,
        options: ["A) Theory guides practice effectively", "B) They are unrelated", "C) Practice doesn't need theory", "D) Theory is always wrong"],
        correct: 0,
        explanation: `Theory and practice work together in ${subjectName}.`,
        timeEstimate: 60
      },
      {
        id: 3,
        question: `What skill is most important for success in ${subjectName}?`,
        options: ["A) Critical thinking and analysis", "B) Memorization only", "C) Guessing answers", "D) Avoiding practice"],
        correct: 0,
        explanation: `Critical thinking helps you understand ${subjectName} deeply.`,
        timeEstimate: 60
      },
      {
        id: 4,
        question: `How should you approach problem-solving in ${subjectName}?`,
        options: ["A) Break problems into smaller steps", "B) Skip difficult problems", "C) Only solve easy problems", "D) Never ask for help"],
        correct: 0,
        explanation: `Breaking problems into steps is an effective strategy.`,
        timeEstimate: 60
      },
      {
        id: 5,
        question: `What helps you learn ${subjectName} more effectively?`,
        options: ["A) Regular practice and review", "B) Studying only before exams", "C) Avoiding homework", "D) Not taking notes"],
        correct: 0,
        explanation: `Consistent practice leads to better understanding of ${subjectName}.`,
        timeEstimate: 60
      }
    ],
    totalMarks: 25,
    timeLimit: 300
  });

  const handleAnswerSelect = (answerIndex: number) => {
    if (quizCompleted || showExplanation) return;

    // Record reaction time
    const reactionTime = Math.floor((Date.now() - questionStartTime) / 1000);
    const newReactionTimes = [...reactionTimes];
    newReactionTimes[currentQuestionIndex] = reactionTime;
    setReactionTimes(newReactionTimes);

    // Record selected answer
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);

    // Show explanation
    setShowExplanation(true);

    // Update score if correct
    if (quiz && answerIndex === quiz.questions[currentQuestionIndex].correct) {
      setScore(prev => prev + (quiz.totalMarks / quiz.questions.length));
    }

    // Adjust difficulty based on performance (adaptive learning)
    if (currentQuestionIndex === quiz!.questions.length - 1) {
      const correctAnswers = newSelectedAnswers.filter(
        (answer, idx) => answer === quiz!.questions[idx].correct
      ).length;
      const successRate = correctAnswers / quiz!.questions.length;

      if (successRate > 0.8) {
        setDifficulty('hard');
      } else if (successRate < 0.4) {
        setDifficulty('easy');
      } else {
        setDifficulty('medium');
      }
    }
  };

  // user is already defined at the top of the component

  const handleNextQuestion = async () => {
    setShowExplanation(false);

    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Reset Hints
      setHints(null);
      setHintLevel(0);
    } else {
      setQuizCompleted(true);
      setShowResults(true);

      // Save Results to Hybrid Database
      if (user) {
        // Prepare detailed logs for MongoDB
        const detailedLogs = {
          answers: selectedAnswers,
          reactionTimes: reactionTimes,
          questions: quiz!.questions, // Saving the generated questions to Mongo since they are ephemeral
          difficulty: difficulty,
          topics: [currentSubject, subjectName]
        };

        // Calculate final score
        const finalScore = score + (selectedAnswers[currentQuestionIndex] === quiz!.questions[currentQuestionIndex].correct ? (quiz!.totalMarks / quiz!.questions.length) : 0);

        // import('../../lib/db').then(({ saveQuizResultHybrid }) => {
        saveQuizResultHybrid(
          (user as any).id || 'student_123',
          quiz,
          finalScore,
          detailedLogs
        );
        // });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Show launcher screen first
  if (showLauncher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-7 h-7" />
              {subjectName} Quiz
            </h1>
            <p className="text-blue-100 mt-1">Class {currentClass} • Adaptive Learning</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {checkingContent ? (
              <div className="text-center py-8">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Checking for available content...</p>
              </div>
            ) : hasTeacherContent && availableQuestionCount > 0 ? (
              // Teacher content available
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-800">
                        Teacher Content Available! ✅
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your teacher has uploaded materials with{' '}
                        <strong>{availableQuestionCount}</strong> questions ready.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateQuiz}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                >
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                  Start Quiz Now
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-sm text-gray-500">or</span>
                  </div>
                </div>

                <button
                  onClick={generateWithAI}
                  disabled={generatingAI}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all"
                >
                  {generatingAI ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Fresh AI Questions
                    </>
                  )}
                </button>
              </div>
            ) : (
              // No teacher content - prompt for AI generation
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">
                        No Teacher Content Yet
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Your teacher hasn't uploaded materials for {subjectName} yet.
                        You can generate practice questions with AI!
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={generateWithAI}
                  disabled={generatingAI}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
                >
                  {generatingAI ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-6 h-6" />
                      Generate Quiz with AI
                    </>
                  )}
                </button>

                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI-Generated Quiz
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Questions based on {subjectName} curriculum</li>
                    <li>• Adaptive difficulty based on your performance</li>
                    <li>• Immediate feedback and explanations</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              ~5 minutes
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || generatingAI) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader className="w-16 h-16 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          {generatingAI ? 'Generating AI Quiz...' : 'Loading your quiz...'}
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
        <div className="max-w-md text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {noContentMessage ? 'Content Not Available' : 'Failed to Load Quiz'}
          </h2>
          <p className="text-gray-600 mb-6">
            {noContentMessage || 'There was an error loading the quiz. Please try again.'}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={generateWithAI}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Generate with AI Instead
            </button>
            <button
              onClick={() => { setShowLauncher(true); checkTeacherContent(); }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = selectedAnswers.filter(
      (answer, idx) => answer === quiz.questions[idx].correct
    ).length;
    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    const avgReactionTime = Math.round(
      reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length
    );

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
        <h1 className="text-2xl font-bold text-center mb-6">{quiz.title} - Results</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-700 mb-1">Score</p>
            <p className="text-3xl font-bold text-blue-800">{Math.round(score)}/{quiz.totalMarks}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-700 mb-1">Correct Answers</p>
            <p className="text-3xl font-bold text-green-800">{correctAnswers}/{quiz.questions.length}</p>
            <p className="text-lg font-medium text-green-700">{percentage}%</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-700 mb-1">Avg. Response Time</p>
            <p className="text-3xl font-bold text-purple-800">{avgReactionTime}s</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Question Analysis</h2>
        <div className="space-y-4 mb-8">
          {quiz.questions.map((question, idx) => (
            <div key={question.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                {selectedAnswers[idx] === question.correct ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                )}
                <div>
                  <p className="font-medium">{question.question}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Your answer: {selectedAnswers[idx] >= 0 ? question.options[selectedAnswers[idx]] : 'Not answered'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Correct answer: {question.options[question.correct]}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{question.explanation}</p>
                  <p className="text-xs text-gray-500 mt-2">Response time: {reactionTimes[idx]}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setDifficulty(percentage > 80 ? 'hard' : percentage < 40 ? 'easy' : 'medium');
              generateQuiz();
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take Another Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Clock className="w-5 h-5 text-blue-700" />
          <span className="font-medium text-blue-700">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        <p className="text-gray-600">Difficulty: <span className="font-medium capitalize">{difficulty}</span></p>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">{currentQuestion.question}</h2>

        {currentQuestion.imageUrl && (
          <div className="mb-6 flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt="Visual Aid"
              className="max-h-64 object-contain rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedAnswers[currentQuestionIndex] === idx
                ? showExplanation
                  ? idx === currentQuestion.correct
                    ? 'bg-green-100 border-green-300'
                    : 'bg-red-100 border-red-300'
                  : 'bg-blue-100 border-blue-300'
                : 'hover:bg-gray-50 border-gray-200'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Hints Section */}
      {!showExplanation && !quizCompleted && (
        <div className="mb-6">
          <button
            onClick={async () => {
              if (hintLevel < 3) {
                setLoadingHint(true);
                // Generate hints only if not already generated
                if (!hints) {
                  try {
                    const generatedHints = await generateSocraticHints(
                      currentQuestion.question,
                      currentQuestion.options[currentQuestion.correct],
                      "Student is asking for a hint", // Context
                      subjectName
                    );
                    setHints(generatedHints);
                    setHintLevel(1);
                  } catch (e) {
                    console.error("Failed to generate hint", e);
                  }
                } else {
                  setHintLevel(prev => prev + 1);
                }
                setLoadingHint(false);
              }
            }}
            disabled={loadingHint || hintLevel >= 3}
            className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {loadingHint ? 'Thinking...' : hintLevel === 0 ? 'Need a Hint?' : 'Get Next Hint'}
          </button>

          {hintLevel > 0 && hints && (
            <div className="mt-3 bg-purple-50 p-3 rounded-lg border border-purple-100 animate-in fade-in slide-in-from-top-2">
              <p className="text-xs font-semibold text-purple-800 mb-1">
                HINT {hintLevel}/3: {hintLevel === 1 ? 'Concept' : hintLevel === 2 ? 'Strategy' : 'Guidance'}
              </p>
              <p className="text-sm text-purple-900">
                {hintLevel === 1 ? hints.level1 : hintLevel === 2 ? hints.level2 : hints.level3}
              </p>
            </div>
          )}
        </div>
      )}

      {showExplanation && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Explanation:</h3>
          <p className="text-blue-700">{currentQuestion.explanation}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Exit Quiz
        </button>

        {showExplanation && (
          <button
            onClick={handleNextQuestion}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}