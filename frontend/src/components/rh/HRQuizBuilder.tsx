import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Copy,
  Move,
  Star,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';

interface HRQuestion {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'behavioral' | 'scenario';
  category: 'communication' | 'teamwork' | 'leadership' | 'problem_solving' | 'cultural_fit' | 'motivation';
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
  jobId?: string;
  jobTitle?: string;
  department: string;
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  questions: HRQuestion[];
  status: 'draft' | 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

interface HRQuizBuilderProps {
  quizId?: string;
  jobId?: string;
  className?: string;
}

const HRQuizBuilder: React.FC<HRQuizBuilderProps> = ({
  quizId,
  jobId,
  className = ''
}) => {
  const [quiz, setQuiz] = useState<HRQuiz>({
    title: '',
    description: '',
    jobId,
    department: '',
    totalQuestions: 0,
    totalPoints: 0,
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Question templates
  const questionTemplates = {
    communication: [
      {
        question: "Describe a time when you had to explain a complex concept to someone with no technical background.",
        type: 'text' as const,
        category: 'communication' as const,
        points: 15
      },
      {
        question: "How do you handle disagreements with team members?",
        type: 'text' as const,
        category: 'communication' as const,
        points: 15
      }
    ],
    teamwork: [
      {
        question: "Rate your preference for working in teams vs. independently",
        type: 'rating' as const,
        category: 'teamwork' as const,
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
        question: "Have you ever led a team or project?",
        type: 'multiple_choice' as const,
        category: 'leadership' as const,
        options: ['Yes, multiple times', 'Yes, once or twice', 'No, but I would like to', 'No, I prefer to follow'],
        points: 10
      }
    ],
    cultural_fit: [
      {
        question: "What motivates you most in your work?",
        type: 'multiple_choice' as const,
        category: 'cultural_fit' as const,
        options: ['Learning new skills', 'Solving challenging problems', 'Working with great people', 'Making an impact'],
        points: 10
      }
    ]
  };

  useEffect(() => {
    if (quizId) {
      // Load existing quiz
      loadQuiz(quizId);
    }
  }, [quizId]);

  const loadQuiz = async (id: string) => {
    setLoading(true);
    try {
      // API call to load quiz
      // Mock data for now
      const mockQuiz: HRQuiz = {
        id,
        title: 'HR Assessment - Senior Developer',
        description: 'Behavioral and cultural fit assessment for senior developer position',
        jobTitle: 'Senior Full Stack Developer',
        department: 'Engineering',
        totalQuestions: 5,
        totalPoints: 75,
        timeLimit: 30,
        passingScore: 70,
        status: 'draft',
        questions: [
          {
            id: '1',
            type: 'text',
            category: 'communication',
            question: 'Describe your communication style when working with cross-functional teams.',
            points: 15,
            required: true,
            tags: ['communication', 'teamwork']
          }
        ]
      };
      setQuiz(mockQuiz);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (template?: Partial<HRQuestion>) => {
    const newQuestion: HRQuestion = {
      id: Date.now().toString(),
      type: template?.type || 'text',
      category: template?.category || 'communication',
      question: template?.question || '',
      options: template?.options || [],
      points: template?.points || 10,
      required: true,
      tags: template?.tags || []
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalQuestions: prev.questions.length + 1,
      totalPoints: prev.totalPoints + newQuestion.points
    }));

    setActiveQuestionIndex(quiz.questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<HRQuestion>) => {
    setQuiz(prev => {
      const newQuestions = [...prev.questions];
      const oldPoints = newQuestions[index].points;
      newQuestions[index] = { ...newQuestions[index], ...updates };

      const pointsDiff = (updates.points || oldPoints) - oldPoints;

      return {
        ...prev,
        questions: newQuestions,
        totalPoints: prev.totalPoints + pointsDiff
      };
    });
  };

  const deleteQuestion = (index: number) => {
    setQuiz(prev => {
      const newQuestions = prev.questions.filter((_, i) => i !== index);
      const deletedPoints = prev.questions[index].points;

      return {
        ...prev,
        questions: newQuestions,
        totalQuestions: newQuestions.length,
        totalPoints: prev.totalPoints - deletedPoints
      };
    });

    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null);
    }
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === quiz.questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setQuiz(prev => {
      const newQuestions = [...prev.questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];

      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const saveQuiz = async () => {
    setLoading(true);
    try {
      // API call to save quiz
      console.log('Saving quiz:', quiz);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishQuiz = async () => {
    setLoading(true);
    try {
      // API call to publish quiz
      setQuiz(prev => ({ ...prev, status: 'active' }));
      console.log('Publishing quiz:', quiz);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error publishing quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionEditor = (question: HRQuestion, index: number) => {
    return (
      <Card key={question.id} className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              {index + 1}
            </span>
            <div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {question.category.replace('_', ' ')}
              </Badge>
              <Badge className="ml-2 bg-gray-100 text-gray-800 border-gray-200">
                {question.type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outlined"
              size="small"
              onClick={() => moveQuestion(index, 'up')}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => moveQuestion(index, 'down')}
              disabled={index === quiz.questions.length - 1}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setActiveQuestionIndex(activeQuestionIndex === index ? null : index)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => deleteQuestion(index)}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {activeQuestionIndex === index ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <textarea
                value={question.question}
                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your question..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(index, { type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="text">Text Answer</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="rating">Rating Scale</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="scenario">Scenario</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={question.category}
                  onChange={(e) => updateQuestion(index, { category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="communication">Communication</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="leadership">Leadership</option>
                  <option value="problem_solving">Problem Solving</option>
                  <option value="cultural_fit">Cultural Fit</option>
                  <option value="motivation">Motivation</option>
                </select>
              </div>
            </div>

            {question.type === 'multiple_choice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  {(question.options || []).map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, { options: newOptions });
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                          updateQuestion(index, { options: newOptions });
                        }}
                        className="text-red-600 border-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const newOptions = [...(question.options || []), ''];
                      updateQuestion(index, { options: newOptions });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                <Input
                  type="number"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, { points: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={question.timeLimit || ''}
                  onChange={(e) => updateQuestion(index, { timeLimit: parseInt(e.target.value) || undefined })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                  className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Required question</span>
              </label>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{question.points} points</span>
              {question.timeLimit && <span>{question.timeLimit} min limit</span>}
              {question.required && <span className="text-red-600">Required</span>}
            </div>
          </div>
        )}
      </Card>
    );
  };

  if (loading && !quiz.questions.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Quiz Builder</h1>
          <p className="text-gray-600">Create behavioral and cultural fit assessments</p>
        </div>

        <div className="flex items-center space-x-3">
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
            onClick={saveQuiz}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={publishQuiz}
            disabled={loading || quiz.questions.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Publish Quiz
          </Button>
        </div>
      </div>

      {/* Quiz Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
            <Input
              value={quiz.title}
              onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., HR Assessment - Senior Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={quiz.department}
              onChange={(e) => setQuiz(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Describe the purpose and scope of this assessment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
            <Input
              type="number"
              value={quiz.timeLimit}
              onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
              min="5"
              max="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
            <Input
              type="number"
              value={quiz.passingScore}
              onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{quiz.totalQuestions}</div>
            <div className="text-sm text-blue-600">Questions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{quiz.totalPoints}</div>
            <div className="text-sm text-green-600">Total Points</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{quiz.timeLimit}</div>
            <div className="text-sm text-purple-600">Minutes</div>
          </div>
        </div>
      </Card>

      {/* Question Templates */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Object.entries(questionTemplates).map(([category, templates]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2 capitalize">
                {category.replace('_', ' ')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {templates.length} template{templates.length !== 1 ? 's' : ''}
              </p>
              <Button
                variant="outlined"
                size="small"
                onClick={() => addQuestion(templates[0])}
                className="w-full flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>
            </div>
          ))}
        </div>

        <Button
          variant="contained"
          onClick={() => addQuestion()}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom Question
        </Button>
      </Card>

      {/* Questions List */}
      {quiz.questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Questions ({quiz.questions.length})</h2>
          {quiz.questions.map((question, index) => renderQuestionEditor(question, index))}
        </div>
      )}

      {/* Empty State */}
      {quiz.questions.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
          <p className="text-gray-600 mb-4">
            Start building your HR assessment by adding questions from the templates above.
          </p>
        </Card>
      )}
    </div>
  );
};

export default HRQuizBuilder;