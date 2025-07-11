import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Copy,
  Clock,
  Target,
  Users,
  Brain,
  Heart,
  MessageSquare,
  Star,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Award
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'scenario' | 'ranking';
  category: 'behavioral' | 'cultural_fit' | 'communication' | 'teamwork' | 'leadership' | 'adaptability';
  options?: string[];
  points: number;
  required: boolean;
  description?: string;
  timeLimit?: number;
}

interface HRQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  instructions: string;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
}

interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
  usage: number;
}

const EnhancedHRQuizBuilder: React.FC = () => {
  const [quiz, setQuiz] = useState<HRQuiz>({
    id: '',
    title: '',
    description: '',
    questions: [],
    totalPoints: 0,
    timeLimit: 60,
    passingScore: 70,
    instructions: '',
    categories: [],
    difficulty: 'intermediate',
    estimatedDuration: 30
  });

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    question: '',
    type: 'text',
    category: 'behavioral',
    points: 10,
    required: true,
    options: []
  });

  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState<QuizTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const questionTypes = [
    { value: 'text', label: 'Open Text', icon: <FileText className="w-4 h-4" /> },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'rating', label: 'Rating Scale', icon: <Star className="w-4 h-4" /> },
    { value: 'scenario', label: 'Scenario Based', icon: <Brain className="w-4 h-4" /> },
    { value: 'ranking', label: 'Ranking', icon: <Target className="w-4 h-4" /> }
  ];

  const questionCategories = [
    { value: 'behavioral', label: 'Behavioral', icon: <Users className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'cultural_fit', label: 'Cultural Fit', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
    { value: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'teamwork', label: 'Teamwork', icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'leadership', label: 'Leadership', icon: <Award className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'adaptability', label: 'Adaptability', icon: <Settings className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' }
  ];

  const predefinedTemplates: QuizTemplate[] = [
    {
      id: 'behavioral-basic',
      name: 'Basic Behavioral Assessment',
      description: 'Standard behavioral questions for general positions',
      category: 'behavioral',
      usage: 45,
      questions: [
        {
          id: 'bq1',
          question: 'Describe a challenging situation you faced at work and how you handled it.',
          type: 'text',
          category: 'behavioral',
          points: 15,
          required: true,
          description: 'Focus on problem-solving approach and outcome'
        },
        {
          id: 'bq2',
          question: 'How do you handle conflicts with team members?',
          type: 'multiple_choice',
          category: 'teamwork',
          options: [
            'Address it directly with the person involved',
            'Seek mediation from a supervisor',
            'Try to avoid confrontation',
            'Discuss with other team members first'
          ],
          points: 10,
          required: true
        }
      ]
    },
    {
      id: 'cultural-fit',
      name: 'Cultural Fit Assessment',
      description: 'Evaluate alignment with company values and culture',
      category: 'cultural_fit',
      usage: 32,
      questions: [
        {
          id: 'cf1',
          question: 'Rate your comfort level with remote work collaboration',
          type: 'rating',
          category: 'cultural_fit',
          options: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'],
          points: 8,
          required: true
        }
      ]
    },
    {
      id: 'leadership-potential',
      name: 'Leadership Potential',
      description: 'Assess leadership qualities and potential',
      category: 'leadership',
      usage: 28,
      questions: [
        {
          id: 'lp1',
          question: 'Describe a time when you had to lead a project or initiative.',
          type: 'text',
          category: 'leadership',
          points: 20,
          required: true,
          description: 'Include challenges faced and how you motivated your team'
        }
      ]
    }
  ];

  useEffect(() => {
    setTemplates(predefinedTemplates);
    calculateQuizMetrics();
  }, [quiz.questions]);

  const calculateQuizMetrics = () => {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const categories = [...new Set(quiz.questions.map(q => q.category))];
    const estimatedDuration = Math.max(30, quiz.questions.length * 3);
    
    setQuiz(prev => ({
      ...prev,
      totalPoints,
      categories,
      estimatedDuration
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) return;

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    // Reset current question
    setCurrentQuestion({
      id: '',
      question: '',
      type: 'text',
      category: 'behavioral',
      points: 10,
      required: true,
      options: []
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = quiz.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion: QuizQuestion = {
        ...questionToDuplicate,
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: `${questionToDuplicate.question} (Copy)`
      };
      
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, duplicatedQuestion]
      }));
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, ...template.questions.map(q => ({
          ...q,
          id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))]
      }));
      setSelectedTemplate('');
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Quiz saved:', quiz);
      // Show success message
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    return questionCategories.find(cat => cat.value === category) || questionCategories[0];
  };

  const getTypeInfo = (type: string) => {
    return questionTypes.find(t => t.value === type) || questionTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Assessment Builder</h1>
          <p className="text-gray-600">
            Create comprehensive behavioral and cultural fit assessments
          </p>
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
            variant="contained"
            onClick={saveQuiz}
            disabled={saving || quiz.questions.length === 0}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>

      {/* Quiz Configuration */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assessment Title *
              </label>
              <Input
                value={quiz.title}
                onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior Developer Behavioral Assessment"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the assessment purpose and scope"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions for Candidates
              </label>
              <textarea
                value={quiz.instructions}
                onChange={(e) => setQuiz(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Instructions that candidates will see before starting the assessment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Limit (minutes)
                </label>
                <Input
                  type="number"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  min="15"
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={quiz.difficulty}
                onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            {/* Quiz Metrics */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Assessment Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-orange-700">Total Questions:</span>
                  <span className="font-medium text-orange-900 ml-2">{quiz.questions.length}</span>
                </div>
                <div>
                  <span className="text-orange-700">Total Points:</span>
                  <span className="font-medium text-orange-900 ml-2">{quiz.totalPoints}</span>
                </div>
                <div>
                  <span className="text-orange-700">Categories:</span>
                  <span className="font-medium text-orange-900 ml-2">{quiz.categories.length}</span>
                </div>
                <div>
                  <span className="text-orange-700">Est. Duration:</span>
                  <span className="font-medium text-orange-900 ml-2">{quiz.estimatedDuration} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Question Templates */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Templates</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <Badge variant="outline" size="sm">
                  {template.usage} uses
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {template.questions.length} questions
                </span>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => loadTemplate(template.id)}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  Add to Quiz
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add New Question */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Question</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {questionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={currentQuestion.category}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {questionCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <Input
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                min="1"
                max="50"
                className="w-full"
              />
            </div>
          </div>

          {/* Options for multiple choice and rating questions */}
          {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'rating') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options (one per line)
              </label>
              <textarea
                value={currentQuestion.options?.join('\n') || ''}
                onChange={(e) => setCurrentQuestion(prev => ({
                  ...prev,
                  options: e.target.value.split('\n').filter(opt => opt.trim())
                }))}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description/Instructions (optional)
            </label>
            <Input
              value={currentQuestion.description || ''}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional context or instructions for this question"
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={currentQuestion.required}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required question</span>
            </label>

            <Button
              variant="contained"
              onClick={addQuestion}
              disabled={!currentQuestion.question.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>
      </Card>

      {/* Questions List */}
      {quiz.questions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Assessment Questions ({quiz.questions.length})
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {quiz.totalPoints} total points
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const categoryInfo = getCategoryInfo(question.category);
              const typeInfo = getTypeInfo(question.type);
              const isEditing = editingQuestion === question.id;

              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <Badge className={categoryInfo.color} size="sm">
                          {categoryInfo.icon}
                          <span className="ml-1">{categoryInfo.label}</span>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {typeInfo.icon}
                          <span className="ml-1">{typeInfo.label}</span>
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {question.points} pts
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive" size="sm">
                            Required
                          </Badge>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            rows={2}
                          />

                          {question.options && question.options.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options:
                              </label>
                              <textarea
                                value={question.options.join('\n')}
                                onChange={(e) => updateQuestion(question.id, {
                                  options: e.target.value.split('\n').filter(opt => opt.trim())
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={3}
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => setEditingQuestion(null)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setEditingQuestion(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 mb-2">{question.question}</p>

                          {question.description && (
                            <p className="text-sm text-gray-600 mb-2 italic">
                              {question.description}
                            </p>
                          )}

                          {question.options && question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex} className="flex items-center">
                                    <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                                      {optIndex + 1}
                                    </span>
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => setEditingQuestion(isEditing ? null : question.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => duplicateQuestion(question.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => deleteQuestion(question.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-blue-900">Assessment Preview</h2>
            <Button
              variant="ghost"
              onClick={() => setShowPreview(false)}
              className="text-blue-600"
            >
              Close Preview
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {quiz.title || 'Untitled Assessment'}
              </h3>
              {quiz.description && (
                <p className="text-gray-600 mb-4">{quiz.description}</p>
              )}

              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {quiz.timeLimit} minutes
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {quiz.questions.length} questions
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {quiz.totalPoints} points
                </div>
              </div>
            </div>

            {quiz.instructions && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
                <p className="text-gray-700">{quiz.instructions}</p>
              </div>
            )}

            <div className="space-y-6">
              {quiz.questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {index + 1}. {question.question}
                    </span>
                    {question.required && (
                      <span className="text-red-500">*</span>
                    )}
                  </div>

                  {question.type === 'text' && (
                    <textarea
                      placeholder="Your answer here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      disabled
                    />
                  )}

                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            className="mr-2"
                            disabled
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'rating' && question.options && (
                    <div className="flex gap-2">
                      {question.options.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                          disabled
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {quiz.questions.length > 3 && (
                <div className="text-center text-gray-500">
                  ... and {quiz.questions.length - 3} more questions
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedHRQuizBuilder;
