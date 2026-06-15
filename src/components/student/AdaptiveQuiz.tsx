import React, { useState } from 'react';
import { BookOpen, X, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface AdaptiveQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

const AdaptiveQuiz: React.FC<AdaptiveQuizProps> = ({ isOpen, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Sample questions (in a real app, these would be fetched from an API)
  const questions: Question[] = [
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      id: 2,
      text: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    },
    {
      id: 3,
      text: "What is the largest mammal?",
      options: ["Elephant", "Giraffe", "Blue Whale", "Hippopotamus"],
      correctAnswer: 2
    }
  ];

  const handleOptionSelect = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswerSubmitted(true);
    
    if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Adaptive Quiz</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {!quizCompleted ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              
              {/* Question */}
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <p className="text-xl mb-6">{questions[currentQuestionIndex].text}</p>
                
                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedOption === index 
                          ? isAnswerSubmitted
                            ? index === questions[currentQuestionIndex].correctAnswer
                              ? 'bg-green-100 border-green-500'
                              : 'bg-red-100 border-red-500'
                            : 'bg-blue-100 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      disabled={isAnswerSubmitted}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {isAnswerSubmitted && index === questions[currentQuestionIndex].correctAnswer && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {isAnswerSubmitted && selectedOption === index && index !== questions[currentQuestionIndex].correctAnswer && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3">
                {!isAnswerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      selectedOption === null
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center space-x-1"
                  >
                    <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-6">
              <h3 className="text-2xl font-bold">Quiz Completed!</h3>
              <div className="text-5xl font-bold text-green-600">
                {score} / {questions.length}
              </div>
              <p className="text-gray-600">
                You answered {score} out of {questions.length} questions correctly.
              </p>
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveQuiz;