import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  ArrowLeft,
  Settings,
  Award,
  FileText,
  CheckCircle,
  Wand2,
  Sparkles,
  RefreshCw,
  X,
  Brain,
  Zap
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { toast } from 'react-toastify';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice';
  category: 'behavioral' | 'cultural_fit' | 'communication' | 'teamwork' | 'leadership' | 'adaptability';
  options: [string, string, string, string];
  correctAnswer: number;
  points: number;
  required: boolean;
  description?: string;
}

interface HRQuiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  instructions: string;
  categories: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  creationMethod: 'manual' | 'ai';
}

const questionCategories = [
  { value: 'behavioral', label: 'Behavioral', icon: '🧠' },
  { value: 'cultural_fit', label: 'Cultural Fit', icon: '🤝' },
  { value: 'communication', label: 'Communication', icon: '💬' },
  { value: 'teamwork', label: 'Teamwork', icon: '👥' },
  { value: 'leadership', label: 'Leadership', icon: '👑' },
  { value: 'adaptability', label: 'Adaptability', icon: '🔄' }
];

const CleanQuizBuilder: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAIMode = location.pathname.includes('/ai');
  const isEditMode = location.pathname.includes('/edit');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [quiz, setQuiz] = useState<HRQuiz>({
    id: quizId || '',
    title: '',
    description: '',
    questions: [],
    totalQuestions: 10,
    totalPoints: 0,
    timeLimit: 30,
    passingScore: 70,
    instructions: 'Please read each question carefully and select the best answer. There is only one correct answer per question.',
    categories: [],
    difficulty: 'intermediate',
    estimatedDuration: 15,
    creationMethod: isAIMode ? 'ai' : 'manual'
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIGeneration, setShowAIGeneration] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Current question being edited
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: '',
    question: '',
    type: 'multiple_choice',
    category: 'behavioral',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 10,
    required: true
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEditMode && quizId) {
      loadExistingQuiz();
    } else if (isAIMode) {
      setShowAIGeneration(true);
    }
  }, [quizId, isEditMode, isAIMode]);

  useEffect(() => {
    calculateQuizMetrics();
  }, [quiz.questions]);

  const loadExistingQuiz = async () => {
    try {
      toast.info('Loading quiz...');
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    }
  };

  const calculateQuizMetrics = () => {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const categories = [...new Set(quiz.questions.map(q => q.category))];
    const estimatedDuration = Math.max(15, quiz.questions.length * 2);
    
    setQuiz(prev => ({
      ...prev,
      totalPoints,
      categories,
      estimatedDuration
    }));
  };

  const quickAIGeneration = async () => {
    if (generating) return;
    
    setGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate AI generation with progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Generate sample questions
      const sampleQuestions: QuizQuestion[] = Array.from({ length: 10 }, (_, index) => ({
        id: `q_${Date.now()}_${index}`,
        question: `Sample behavioral question ${index + 1}: How do you handle challenging situations in a team environment?`,
        type: 'multiple_choice' as const,
        category: questionCategories[index % questionCategories.length].value as any,
        options: [
          'I take charge and make decisions quickly',
          'I collaborate with team members to find solutions',
          'I escalate to management immediately',
          'I avoid the situation until it resolves itself'
        ] as [string, string, string, string],
        correctAnswer: 1,
        points: 10,
        required: true,
        description: `This question assesses ${questionCategories[index % questionCategories.length].label.toLowerCase()} skills.`
      }));

      setQuiz(prev => ({
        ...prev,
        questions: sampleQuestions,
        title: prev.title || 'Professional Assessment Quiz',
        description: prev.description || 'AI-generated professional competency assessment'
      }));

      setCurrentStep(2);
      toast.success('Successfully generated 10 questions!');
      
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all question fields');
      return;
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: `q_${Date.now()}`
    };

    if (editingQuestionIndex !== null) {
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
      setEditingQuestionIndex(null);
      toast.success('Question updated successfully');
    } else {
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
      toast.success('Question added successfully');
    }

    // Reset form
    setCurrentQuestion({
      id: '',
      question: '',
      type: 'multiple_choice',
      category: 'behavioral',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 10,
      required: true
    });
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(quiz.questions[index]);
    setEditingQuestionIndex(index);
  };

  const deleteQuestion = (index: number) => {
    const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    toast.success('Question deleted successfully');
  };

  const updateQuestionOption = (optionIndex: number, value: string) => {
    const newOptions = [...currentQuestion.options] as [string, string, string, string];
    newOptions[optionIndex] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const saveQuiz = async (status: 'draft' | 'active' = 'draft') => {
    if (!quiz.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (quiz.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Quiz ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/rh/quiz');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const getStepStatus = (step: number) => {
    if (step === 1) return quiz.title ? 'completed' : currentStep === 1 ? 'active' : 'pending';
    if (step === 2) return quiz.questions.length > 0 ? 'completed' : currentStep === 2 ? 'active' : 'pending';
    if (step === 3) return currentStep === 3 ? 'active' : 'pending';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Full Width Container */}
      <div className="w-full">
        {/* Clean Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/rh/quiz')}
                  className="flex items-center gap-2 px-4 py-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
                  </h1>
                  <p className="text-lg text-gray-600">
                    Build your quiz step by step
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outlined"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-6 py-3 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </Button>
                <Button
                  variant="contained"
                  onClick={() => saveQuiz('draft')}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => saveQuiz('active')}
                  disabled={saving || quiz.questions.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                >
                  <CheckCircle className="w-5 h-5" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Step Progress Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-center">
                {[1, 2, 3].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg transition-all ${
                        getStepStatus(step) === 'completed' ? 'bg-green-600 text-white' :
                        getStepStatus(step) === 'active' ? 'bg-blue-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {getStepStatus(step) === 'completed' ? <CheckCircle className="w-6 h-6" /> : step}
                      </div>
                      <div className="ml-4">
                        <p className={`text-sm font-medium ${
                          getStepStatus(step) === 'completed' ? 'text-green-600' :
                          getStepStatus(step) === 'active' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          Step {step}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {step === 1 ? 'Quiz Settings' : step === 2 ? 'Add Questions' : 'Review & Publish'}
                        </p>
                      </div>
                    </div>
                    {index < 2 && (
                      <div className="flex-1 h-1 bg-gray-200 rounded mx-8">
                        <div
                          className="h-1 bg-blue-600 rounded transition-all duration-500"
                          style={{ width: getStepStatus(step + 1) !== 'pending' ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step 1: Quiz Settings */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl">
                      <Settings className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Quiz Settings</h2>
                      <p className="text-gray-600">Configure your quiz basic information and parameters</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Quiz Title *
                        </label>
                        <Input
                          value={quiz.title}
                          onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter a clear, descriptive title for your quiz"
                          className="w-full h-14 text-lg px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Quiz Description
                        </label>
                        <textarea
                          value={quiz.description}
                          onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the purpose and scope of this quiz"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Instructions for Candidates
                        </label>
                        <textarea
                          value={quiz.instructions}
                          onChange={(e) => setQuiz(prev => ({ ...prev, instructions: e.target.value }))}
                          placeholder="Instructions that candidates will see before starting the quiz"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Time Limit (minutes)
                          </label>
                          <Input
                            type="number"
                            value={quiz.timeLimit}
                            onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                            min="10"
                            max="180"
                            className="w-full h-14 text-lg px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Passing Score (%)
                          </label>
                          <Input
                            type="number"
                            value={quiz.passingScore}
                            onChange={(e) => setQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                            min="0"
                            max="100"
                            className="w-full h-14 text-lg px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Difficulty Level
                        </label>
                        <select
                          value={quiz.difficulty}
                          onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
                        >
                          <option value="beginner">Beginner Level</option>
                          <option value="intermediate">Intermediate Level</option>
                          <option value="advanced">Advanced Level</option>
                        </select>
                      </div>

                      {/* Quick Stats */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-4">Quiz Overview</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
                            <div className="text-sm text-gray-600">Questions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{quiz.totalPoints}</div>
                            <div className="text-sm text-gray-600">Total Points</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{quiz.timeLimit}</div>
                            <div className="text-sm text-gray-600">Minutes</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{quiz.estimatedDuration}</div>
                            <div className="text-sm text-gray-600">Est. Duration</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Step 1 of 3 - Configure your quiz settings
                    </div>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!quiz.title.trim()) {
                          toast.error('Please enter a quiz title');
                          return;
                        }
                        setCurrentStep(2);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg flex items-center gap-2"
                    >
                      Next: Add Questions
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Add Questions */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* AI Generation Options */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl">
                        <Wand2 className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Generate Questions with AI</h2>
                        <p className="text-gray-600">Let AI create professional assessment questions for you</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            Quick AI Generation
                          </h3>
                          <p className="text-gray-600 mb-4">Generate 10 professional assessment questions instantly</p>
                          <Button
                            variant="contained"
                            onClick={quickAIGeneration}
                            disabled={generating}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                            {generating ? (
                              <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating... {generationProgress}%
                              </>
                            ) : (
                              <>
                                <Zap className="w-5 h-5" />
                                Generate 10 Questions
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Manual Question Creation
                          </h3>
                          <p className="text-gray-600 mb-4">Create questions manually with full control</p>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              // Scroll to manual question form
                              document.getElementById('manual-question-form')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add Question Manually
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {generating && (
                          <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-3 mb-4">
                              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                              <div>
                                <div className="font-semibold text-gray-900">Generating Questions...</div>
                                <div className="text-sm text-gray-600">Creating professional assessment questions</div>
                              </div>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-3">
                              <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${generationProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-3">✨ AI Features</h4>
                          <ul className="text-sm text-gray-700 space-y-2">
                            <li>• Generates contextual behavioral questions</li>
                            <li>• Creates 4 multiple-choice options per question</li>
                            <li>• Covers all key competency areas</li>
                            <li>• All questions are fully editable</li>
                            <li>• Professional assessment standards</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                {quiz.questions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl">
                            <FileText className="w-8 h-8 text-green-600" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Quiz Questions ({quiz.questions.length})</h2>
                            <p className="text-gray-600">Review and edit your questions</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-4 py-2">
                          {quiz.questions.length} Questions Ready
                        </Badge>
                      </div>

                      <div className="space-y-6">
                        {quiz.questions.map((question, index) => (
                          <div key={question.id} className="border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                    {index + 1}
                                  </div>
                                  <h3 className="font-medium text-gray-900 text-lg">
                                    {question.question}
                                  </h3>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {questionCategories.find(cat => cat.value === question.category)?.icon} {' '}
                                    {questionCategories.find(cat => cat.value === question.category)?.label}
                                  </Badge>
                                  <span className="flex items-center gap-1 text-green-600">
                                    <Award className="w-4 h-4" />
                                    {question.points} points
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg ${
                                      question.correctAnswer === optIndex
                                        ? 'bg-green-50 border-2 border-green-200'
                                        : 'bg-gray-50 border border-gray-200'
                                    }`}>
                                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                                        question.correctAnswer === optIndex
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-300 text-gray-700'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </div>
                                      <span className="text-sm flex-1">{option}</span>
                                      {question.correctAnswer === optIndex && (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-6">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => editQuestion(index)}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => deleteQuestion(index)}
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Question Form */}
                <div id="manual-question-form" className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl">
                        <Plus className="w-8 h-8 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
                        </h2>
                        <p className="text-gray-600">Create a custom question with multiple choice answers</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Question Text *
                          </label>
                          <textarea
                            value={currentQuestion.question}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                            placeholder="Enter your question here..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Category
                            </label>
                            <select
                              value={currentQuestion.category}
                              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, category: e.target.value as any }))}
                              className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                            >
                              {questionCategories.map((category) => (
                                <option key={category.value} value={category.value}>
                                  {category.icon} {category.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Points
                            </label>
                            <Input
                              type="number"
                              value={currentQuestion.points}
                              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                              min="1"
                              max="50"
                              className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Description (optional)
                          </label>
                          <Input
                            value={currentQuestion.description || ''}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Additional context or instructions"
                            className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Answer Options * (Select the correct answer)
                          </label>
                          <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={currentQuestion.correctAnswer === index}
                                  onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                                  className="w-5 h-5 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700 w-8">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                <Input
                                  value={option}
                                  onChange={(e) => updateQuestionOption(index, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                  className="flex-1 h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Select the radio button next to the correct answer
                          </p>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentQuestion.required}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">Required question</span>
                        </div>

                        <div className="flex gap-3">
                          {editingQuestionIndex !== null && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setEditingQuestionIndex(null);
                                setCurrentQuestion({
                                  id: '',
                                  question: '',
                                  type: 'multiple_choice',
                                  category: 'behavioral',
                                  options: ['', '', '', ''],
                                  correctAnswer: 0,
                                  points: 10,
                                  required: true
                                });
                              }}
                              className="flex-1 py-3 border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Cancel Edit
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            onClick={addQuestion}
                            disabled={!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outlined"
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back: Quiz Settings
                    </Button>

                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Step 2 of 3 - Add questions to your quiz
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {quiz.questions.length} questions added
                      </div>
                    </div>

                    <Button
                      variant="contained"
                      onClick={() => {
                        if (quiz.questions.length === 0) {
                          toast.error('Please add at least one question');
                          return;
                        }
                        setCurrentStep(3);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                      Next: Review & Publish
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Publish */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Review & Publish</h2>
                        <p className="text-gray-600">Review your quiz and publish when ready</p>
                      </div>
                    </div>

                    {/* Quiz Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h3>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Title:</span>
                              <p className="text-gray-900 font-medium">{quiz.title}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Description:</span>
                              <p className="text-gray-900">{quiz.description || 'No description provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Difficulty:</span>
                              <Badge variant="outline" className="ml-2 capitalize">
                                {quiz.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Statistics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">{quiz.questions.length}</div>
                              <div className="text-sm text-gray-600">Questions</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">{quiz.totalPoints}</div>
                              <div className="text-sm text-gray-600">Total Points</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-purple-600">{quiz.timeLimit}</div>
                              <div className="text-sm text-gray-600">Minutes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange-600">{quiz.passingScore}%</div>
                              <div className="text-sm text-gray-600">Passing Score</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Categories</h3>
                          <div className="space-y-2">
                            {quiz.categories.map((category, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">
                                  {questionCategories.find(cat => cat.value === category)?.icon} {' '}
                                  {questionCategories.find(cat => cat.value === category)?.label}
                                </span>
                                <span className="text-sm font-medium text-purple-600">
                                  {quiz.questions.filter(q => q.category === category).length} questions
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Publish?</h3>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Quiz title and description set
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              {quiz.questions.length} questions added
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Time limit and scoring configured
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              All questions have correct answers
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back: Add Questions
                      </Button>

                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          Step 3 of 3 - Final review
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          Quiz ready for publication
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outlined"
                          onClick={() => saveQuiz('draft')}
                          disabled={saving}
                          className="px-6 py-3 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Save as Draft
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => saveQuiz('active')}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 shadow-lg"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {saving ? 'Publishing...' : 'Publish Quiz'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanQuizBuilder;
