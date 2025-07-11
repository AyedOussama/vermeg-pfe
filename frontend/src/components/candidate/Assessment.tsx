import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Save,
  Send,
  Eye,
  FileText,
  Code,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'code' | 'rating';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number;
  category: 'technical' | 'hr' | 'behavioral';
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'technical' | 'hr' | 'behavioral';
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  timeLimit: number; // in minutes
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  questions: AssessmentQuestion[];
  startedAt?: string;
  completedAt?: string;
  score?: number;
  timeRemaining?: number;
  jobTitle: string;
  company: string;
}

interface AssessmentProps {
  assessmentId: string;
  applicationId: string;
  className?: string;
}

const Assessment: React.FC<AssessmentProps> = ({ 
  assessmentId, 
  applicationId, 
  className = '' 
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockAssessment: Assessment = {
      id: assessmentId,
      title: 'Technical Assessment - Full Stack Developer',
      description: 'This assessment evaluates your technical skills in React, Node.js, and general programming concepts.',
      type: 'technical',
      status: 'not_started',
      timeLimit: 60,
      totalQuestions: 10,
      totalPoints: 100,
      passingScore: 70,
      jobTitle: 'Senior Full Stack Developer',
      company: 'Vermeg',
      questions: [
        {
          id: '1',
          type: 'multiple_choice',
          question: 'What is the purpose of React hooks?',
          options: [
            'To add state and lifecycle methods to functional components',
            'To replace class components entirely',
            'To improve performance of React applications',
            'To handle routing in React applications'
          ],
          correctAnswer: 'To add state and lifecycle methods to functional components',
          points: 10,
          category: 'technical'
        },
        {
          id: '2',
          type: 'code',
          question: 'Write a function that returns the factorial of a number using recursion.',
          points: 15,
          category: 'technical'
        },
        {
          id: '3',
          type: 'multiple_choice',
          question: 'Which HTTP method is typically used to update a resource?',
          options: ['GET', 'POST', 'PUT', 'DELETE'],
          correctAnswer: 'PUT',
          points: 10,
          category: 'technical'
        },
        {
          id: '4',
          type: 'text',
          question: 'Explain the difference between SQL and NoSQL databases. When would you use each?',
          points: 20,
          category: 'technical'
        },
        {
          id: '5',
          type: 'multiple_choice',
          question: 'What is the main advantage of using TypeScript over JavaScript?',
          options: [
            'Better performance',
            'Static type checking',
            'Smaller bundle size',
            'Built-in testing framework'
          ],
          correctAnswer: 'Static type checking',
          points: 10,
          category: 'technical'
        }
      ]
    };

    setTimeout(() => {
      setAssessment(mockAssessment);
      setLoading(false);
    }, 1000);
  }, [assessmentId]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            handleSubmitAssessment();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const startAssessment = () => {
    if (assessment) {
      setTimeRemaining(assessment.timeLimit * 60);
      setIsActive(true);
      setAssessment(prev => prev ? { ...prev, status: 'in_progress', startedAt: new Date().toISOString() } : null);
    }
  };

  const pauseAssessment = () => {
    setIsActive(false);
  };

  const resumeAssessment = () => {
    setIsActive(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const saveProgress = async () => {
    try {
      // API call to save progress
      console.log('Saving progress...', answers);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleSubmitAssessment = async () => {
    try {
      setIsActive(false);
      // API call to submit assessment
      console.log('Submitting assessment...', answers);
      
      // Mock score calculation
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      
      setAssessment(prev => prev ? { 
        ...prev, 
        status: 'completed', 
        completedAt: new Date().toISOString(),
        score 
      } : null);
      
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining > 600) return 'text-green-600'; // > 10 minutes
    if (timeRemaining > 300) return 'text-yellow-600'; // > 5 minutes
    return 'text-red-600'; // < 5 minutes
  };

  const renderQuestion = (question: AssessmentQuestion) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        );

      case 'code':
        return (
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Write your code below:</p>
            </div>
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="// Write your code here..."
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleAnswerChange(question.id, rating)}
                className={`p-1 ${answer >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-gray-600">
              {answer ? `${answer}/5` : 'Not rated'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Assessment not found</p>
      </div>
    );
  }

  // Results view
  if (showResults && assessment.status === 'completed') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Completed!</h2>
          <p className="text-gray-600 mb-6">Thank you for completing the assessment.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{assessment.score}%</div>
              <div className="text-gray-600">Your Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{assessment.passingScore}%</div>
              <div className="text-gray-600">Passing Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{assessment.totalQuestions}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge 
              className={`text-lg px-4 py-2 ${
                assessment.score! >= assessment.passingScore 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {assessment.score! >= assessment.passingScore ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Results will be shared with the hiring team.</p>
            <p>You will be notified about the next steps via email.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Pre-assessment view
  if (assessment.status === 'not_started') {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h1>
            <p className="text-gray-600">{assessment.jobTitle} at {assessment.company}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{assessment.timeLimit} min</div>
              <div className="text-gray-600">Time Limit</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{assessment.totalQuestions}</div>
              <div className="text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{assessment.totalPoints}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">{assessment.passingScore}%</div>
              <div className="text-gray-600">Passing Score</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Important Instructions</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• You have {assessment.timeLimit} minutes to complete this assessment</li>
                  <li>• Once started, the timer cannot be paused</li>
                  <li>• Make sure you have a stable internet connection</li>
                  <li>• You can save your progress and return to questions</li>
                  <li>• Submit before time runs out to avoid automatic submission</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="contained"
              size="large"
              onClick={startAssessment}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Assessment
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Assessment in progress
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.totalQuestions) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with timer and progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900">{assessment.title}</h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Question {currentQuestionIndex + 1} of {assessment.totalQuestions}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {isActive ? (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={pauseAssessment}
                  className="flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={resumeAssessment}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              )}
              
              <Button
                variant="outlined"
                size="small"
                onClick={saveProgress}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Question */}
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {currentQuestion.points} points
              </Badge>
              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                {currentQuestion.category}
              </Badge>
              {currentQuestion.type === 'code' && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Code className="w-3 h-3 mr-1" />
                  Code
                </Badge>
              )}
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQuestion.question}
          </h2>
        </div>

        {renderQuestion(currentQuestion)}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outlined"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          {currentQuestionIndex === assessment.totalQuestions - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmitAssessment}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Assessment
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => setCurrentQuestionIndex(Math.min(assessment.totalQuestions - 1, currentQuestionIndex + 1))}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Question navigator */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Question Navigator</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {assessment.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-red-600 text-white'
                  : answers[assessment.questions[index].id]
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Assessment;
