import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Copy, 
  Settings,
  Clock,
  Award,
  FileText,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
  Target
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { toast } from 'react-toastify';

interface HRQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'behavioral' | 'scenario';
  category: 'communication' | 'teamwork' | 'leadership' | 'problem_solving' | 'cultural_fit' | 'motivation' | 'adaptability';
  question: string;
  description?: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number;
  required: boolean;
  tags: string[];
}

interface HRQuiz {
  id?: string;
  title: string;
  description: string;
  department: string;
  jobTitle?: string;
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  questions: HRQuestion[];
  status: 'draft' | 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  usageCount?: number;
  averageScore?: number;
  tags: string[];
  isTemplate: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
}

interface QuizEditorProps {
  mode: 'create' | 'edit';
  className?: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ mode, className = '' }) => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<HRQuiz>({
    title: '',
    description: '',
    department: '',
    totalQuestions: 0,
    totalPoints: 0,
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    status: 'draft',
    tags: [],
    isTemplate: false,
    difficulty: 'intermediate',
    instructions: 'Please answer all questions honestly and to the best of your ability. There are no right or wrong answers for most questions.'
  });

  const [currentQuestion, setCurrentQuestion] = useState<HRQuestion>({
    id: '',
    type: 'text',
    category: 'communication',
    question: '',
    points: 10,
    required: true,
    tags: []
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Question templates for quick creation
  const questionTemplates = {
    communication: [
      {
        question: "Describe a time when you had to explain a complex concept to someone with no technical background.",
        type: 'text' as const,
        category: 'communication' as const,
        points: 15,
        description: "Assess communication skills and ability to simplify complex information"
      },
      {
        question: "How do you prefer to receive feedback?",
        type: 'multiple_choice' as const,
        category: 'communication' as const,
        options: ['Direct and immediate', 'Written with examples', 'In private meetings', 'Through regular check-ins'],
        points: 10
      }
    ],
    teamwork: [
      {
        question: "Rate your preference for working in teams vs. independently",
        type: 'rating' as const,
        category: 'teamwork' as const,
        options: ['1', '2', '3', '4', '5'],
        points: 10
      },
      {
        question: "Describe a challenging team project you worked on and your role in its success.",
        type: 'text' as const,
        category: 'teamwork' as const,
        points: 20
      }
    ],
    leadership: [
      {
        question: "How do you motivate team members who are struggling with their tasks?",
        type: 'text' as const,
        category: 'leadership' as const,
        points: 15
      },
      {
        question: "What leadership style do you identify with most?",
        type: 'multiple_choice' as const,
        category: 'leadership' as const,
        options: ['Democratic', 'Transformational', 'Servant Leadership', 'Situational'],
        points: 10
      }
    ],
    cultural_fit: [
      {
        question: "What motivates you most in your work?",
        type: 'multiple_choice' as const,
        category: 'cultural_fit' as const,
        options: ['Learning new skills', 'Solving complex problems', 'Helping others succeed', 'Creating innovative solutions'],
        points: 10
      },
      {
        question: "How do you handle work-life balance?",
        type: 'text' as const,
        category: 'cultural_fit' as const,
        points: 15
      }
    ]
  };

  useEffect(() => {
    if (mode === 'edit' && quizId) {
      loadQuiz(quizId);
    }
  }, [mode, quizId]);

  useEffect(() => {
    // Recalculate quiz metrics when questions change
    const totalQuestions = quiz.questions.length;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
    setQuiz(prev => ({
      ...prev,
      totalQuestions,
      totalPoints
    }));
  }, [quiz.questions]);

  const loadQuiz = async (id: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock quiz data
      const mockQuiz: HRQuiz = {
        id,
        title: 'Senior Developer Behavioral Assessment',
        description: 'Comprehensive behavioral evaluation for senior developer positions',
        department: 'Engineering',
        jobTitle: 'Senior Full Stack Developer',
        totalQuestions: 8,
        totalPoints: 120,
        timeLimit: 45,
        passingScore: 75,
        status: 'draft',
        tags: ['behavioral', 'leadership', 'communication'],
        isTemplate: false,
        difficulty: 'intermediate',
        instructions: 'This assessment evaluates your behavioral competencies and cultural fit for our organization.',
        questions: [
          {
            id: '1',
            type: 'text',
            category: 'communication',
            question: 'Describe your communication style when working with cross-functional teams.',
            points: 15,
            required: true,
            tags: ['communication', 'teamwork'],
            description: 'Assess ability to communicate across different departments'
          },
          {
            id: '2',
            type: 'multiple_choice',
            category: 'leadership',
            question: 'What leadership style do you identify with most?',
            options: ['Democratic', 'Transformational', 'Servant Leadership', 'Situational'],
            points: 10,
            required: true,
            tags: ['leadership', 'management']
          }
        ]
      };
      
      setQuiz(mockQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async (status: 'draft' | 'active' = 'draft') => {
    if (!quiz.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (!quiz.description.trim()) {
      toast.error('Please enter a quiz description');
      return;
    }

    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      const quizData = {
        ...quiz,
        status,
        updatedAt: new Date().toISOString(),
        ...(mode === 'create' && {
          id: `quiz-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: 'HR Manager',
          usageCount: 0
        })
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Quiz ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      navigate('/rh/quiz-management');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (template?: Partial<HRQuestion>) => {
    const newQuestion: HRQuestion = {
      id: `q_${Date.now()}`,
      type: template?.type || 'text',
      category: template?.category || 'communication',
      question: template?.question || '',
      description: template?.description || '',
      options: template?.options || [],
      points: template?.points || 10,
      required: true,
      tags: template?.tags || []
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (index: number, updatedQuestion: HRQuestion) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? updatedQuestion : q)
    }));
    setEditingQuestionIndex(null);
  };

  const deleteQuestion = (index: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = quiz.questions[index];
    const duplicatedQuestion: HRQuestion = {
      ...questionToDuplicate,
      id: `q_${Date.now()}`,
      question: `${questionToDuplicate.question} (Copy)`
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outlined"
            onClick={() => navigate('/rh/quiz-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz Management
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Create New Quiz' : 'Edit Quiz'}
            </h1>
            <p className="text-gray-600">
              {mode === 'create' 
                ? 'Build a comprehensive HR assessment quiz' 
                : 'Modify your existing quiz'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => handleSaveQuiz('draft')}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </Button>
          
          <Button
            variant="contained"
            onClick={() => handleSaveQuiz('active')}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save & Activate'}
          </Button>
        </div>
      </div>

      {/* Quiz Basic Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Title *
              </label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and scope of this quiz..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={quiz.instructions}
                onChange={(e) => setQuiz(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instructions for candidates taking this quiz..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={quiz.department}
                  onChange={(e) => setQuiz(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Management">Management</option>
                  <option value="All">All Departments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={quiz.difficulty}
                  onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title (Optional)
              </label>
              <Input
                value={quiz.jobTitle || ''}
                onChange={(e) => setQuiz(prev => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Specific job title this quiz is for..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (min)
                </label>
                <Input
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  min="5"
                  max="180"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <Input
                  type="number"
                  value={quiz.passingScore}
                  onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quiz.isTemplate}
                    onChange={(e) => setQuiz(prev => ({ ...prev, isTemplate: e.target.checked }))}
                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Use as Template</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</div>
            <div className="text-sm text-blue-800">Questions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{quiz.totalPoints}</div>
            <div className="text-sm text-green-800">Total Points</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{quiz.timeLimit}</div>
            <div className="text-sm text-yellow-800">Minutes</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{quiz.passingScore}%</div>
            <div className="text-sm text-purple-800">Passing Score</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizEditor;
