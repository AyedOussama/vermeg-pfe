import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Brain,
  FileText,
  Clock,
  Award,
  Users,
  Settings,
  Wand2,
  Hash,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Zap,
  X
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
  options: [string, string, string, string]; // Always exactly 4 options
  correctAnswer: number; // Index of correct answer (0-3)
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

const ModernQuizBuilder: React.FC = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine creation method from URL
  const isAIMode = location.pathname.includes('/ai');
  const isEditMode = location.pathname.includes('/edit');
  
  const [quiz, setQuiz] = useState<HRQuiz>({
    id: quizId || '',
    title: '',
    description: '',
    questions: [],
    totalQuestions: 10, // Default number of questions
    totalPoints: 0,
    timeLimit: 30,
    passingScore: 70,
    instructions: 'Please read each question carefully and select the best answer. There is only one correct answer per question.',
    categories: [],
    difficulty: 'intermediate',
    estimatedDuration: 15,
    creationMethod: isAIMode ? 'ai' : 'manual'
  });

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
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const questionCategories = [
    { value: 'behavioral', label: 'Behavioral', icon: '🧠' },
    { value: 'cultural_fit', label: 'Cultural Fit', icon: '🏢' },
    { value: 'communication', label: 'Communication', icon: '💬' },
    { value: 'teamwork', label: 'Teamwork', icon: '👥' },
    { value: 'leadership', label: 'Leadership', icon: '👑' },
    { value: 'adaptability', label: 'Adaptability', icon: '🔄' }
  ];

  useEffect(() => {
    if (isEditMode && quizId) {
      loadExistingQuiz();
    } else if (isAIMode) {
      // Show AI generation interface
      setShowAIGeneration(true);
    }
  }, [quizId, isEditMode, isAIMode]);

  useEffect(() => {
    calculateQuizMetrics();
  }, [quiz.questions]);

  const [showAIGeneration, setShowAIGeneration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showAIOptions, setShowAIOptions] = useState(false);

  const loadExistingQuiz = async () => {
    try {
      // Simulate API call to load existing quiz
      // In real implementation, this would fetch from your backend
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

  const generateAIQuiz = async () => {
    if (!aiPrompt.trim() || !selectedDepartment) {
      toast.error('Please provide both department and description');
      return;
    }

    setGenerating(true);
    setGenerationProgress(0);

    try {
      // Enhanced AI question templates based on categories and difficulty
      const questionTemplates = {
        behavioral: [
          "Describe a time when you had to {action} in a challenging situation. How did you handle it?",
          "Tell me about a situation where you had to {action} under pressure. What was your approach?",
          "Give an example of when you {action} to achieve a goal. What steps did you take?",
          "Describe a time when you had to {action} with limited resources. How did you manage?"
        ],
        cultural_fit: [
          "How do you {action} when working in a diverse team environment?",
          "Describe your approach to {action} when company values are at stake.",
          "How would you {action} if you disagreed with a company policy?",
          "What does {action} mean to you in a professional context?"
        ],
        communication: [
          "How do you {action} when explaining complex concepts to non-technical stakeholders?",
          "Describe a time when you had to {action} difficult feedback to a colleague.",
          "How do you ensure effective {action} in remote work environments?",
          "Tell me about a situation where miscommunication occurred. How did you {action}?"
        ],
        teamwork: [
          "Describe how you {action} when working with team members who have different working styles.",
          "How do you {action} when there's conflict within your team?",
          "Tell me about a time when you had to {action} to support a struggling team member.",
          "How do you {action} to ensure everyone's voice is heard in team discussions?"
        ],
        leadership: [
          "Describe a situation where you had to {action} without formal authority.",
          "How do you {action} when leading a team through organizational change?",
          "Tell me about a time when you had to {action} a difficult decision that affected your team.",
          "How do you {action} to motivate team members who are underperforming?"
        ],
        adaptability: [
          "Describe a time when you had to {action} quickly to changing priorities.",
          "How do you {action} when faced with new technology or processes?",
          "Tell me about a situation where you had to {action} your approach mid-project.",
          "How do you {action} when working in an uncertain or ambiguous environment?"
        ]
      };

      const actionWords = {
        beginner: ['adapt', 'communicate', 'collaborate', 'learn', 'support'],
        intermediate: ['lead', 'innovate', 'resolve', 'optimize', 'influence'],
        advanced: ['strategize', 'transform', 'mentor', 'architect', 'orchestrate']
      };

      // Generate questions with progress updates
      const aiGeneratedQuestions: QuizQuestion[] = [];
      const totalQuestions = aiQuestionCount;

      for (let index = 0; index < totalQuestions; index++) {
        // Update progress
        setGenerationProgress(Math.round((index / totalQuestions) * 100));

        // Small delay to show progress (can be removed in production)
        await new Promise(resolve => setTimeout(resolve, 100));

        const category = questionCategories[index % questionCategories.length].value as any;
        const templates = questionTemplates[category] || questionTemplates.behavioral;
        const actions = actionWords[aiDifficulty];

        const template = templates[Math.floor(Math.random() * templates.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const questionText = template.replace('{action}', action);

        // Generate contextual options based on category and difficulty
        const optionSets = {
          behavioral: [
            ['I take immediate action without consulting others', 'I gather input from stakeholders before acting', 'I delegate the decision to someone else', 'I postpone the decision until more information is available'],
            ['I focus solely on the technical solution', 'I consider both technical and business implications', 'I prioritize speed over quality', 'I avoid making any changes'],
            ['I work independently to solve the problem', 'I collaborate with team members to find solutions', 'I escalate to management immediately', 'I document the issue and wait for guidance'],
            ['I stick to established procedures', 'I adapt my approach based on the situation', 'I follow what others are doing', 'I seek approval for every step']
          ],
          communication: [
            ['I use technical jargon to be precise', 'I simplify language and use analogies', 'I provide written documentation only', 'I assume others understand without explanation'],
            ['I deliver feedback directly without context', 'I provide specific examples and suggestions', 'I avoid giving feedback to prevent conflict', 'I only give positive feedback'],
            ['I rely on email for all communication', 'I use multiple channels and confirm understanding', 'I assume silence means agreement', 'I communicate only when asked'],
            ['I interrupt to clarify immediately', 'I listen fully before asking questions', 'I pretend to understand to avoid embarrassment', 'I change the subject to avoid confusion']
          ],
          teamwork: [
            ['I focus on my individual tasks only', 'I actively support team goals and collaboration', 'I compete with team members for recognition', 'I avoid participating in team activities'],
            ['I take sides based on personal relationships', 'I facilitate discussion to find common ground', 'I ignore the conflict and hope it resolves', 'I escalate to management immediately'],
            ['I complete their work for them', 'I offer guidance and resources to help them improve', 'I report their performance to management', 'I avoid working with them in the future'],
            ['I dominate discussions with my ideas', 'I actively encourage input from all team members', 'I only speak when directly asked', 'I agree with the loudest voice']
          ]
        };

        const categoryOptions = optionSets[category] || optionSets.behavioral;
        const selectedOptions = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];

        // Determine correct answer based on best practices (usually the collaborative/thoughtful option)
        const correctAnswerIndex = selectedOptions.findIndex(option =>
          option.includes('collaborate') ||
          option.includes('consider') ||
          option.includes('facilitate') ||
          option.includes('encourage') ||
          option.includes('specific examples') ||
          option.includes('adapt') ||
          option.includes('multiple channels')
        );

        const question: QuizQuestion = {
          id: `ai_q_${Date.now()}_${index}`,
          question: questionText,
          type: 'multiple_choice' as const,
          category,
          options: selectedOptions as [string, string, string, string],
          correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 1, // Default to second option if no match
          points: aiDifficulty === 'beginner' ? 8 : aiDifficulty === 'intermediate' ? 10 : 12,
          required: true,
          description: `This question evaluates ${questionCategories.find(cat => cat.value === category)?.label.toLowerCase()} competencies for ${selectedDepartment} positions at ${aiDifficulty} level.`
        };

        aiGeneratedQuestions.push(question);
      }

      setGenerationProgress(100);

      // Update quiz with generated questions
      setQuiz(prev => ({
        ...prev,
        questions: aiGeneratedQuestions,
        title: prev.title || `${selectedDepartment} Assessment Quiz`,
        description: prev.description || `AI-generated ${aiDifficulty} level assessment for ${selectedDepartment} positions. Focus areas: ${aiPrompt}`,
        difficulty: aiDifficulty,
        totalQuestions: aiGeneratedQuestions.length
      }));

      setShowAIGeneration(false);
      toast.success(`Successfully generated ${aiGeneratedQuestions.length} ${aiDifficulty} level questions!`);

      // Reset AI form
      setAiPrompt('');
      setSelectedDepartment('');
      setAiTopics([]);

    } catch (error) {
      console.error('Error generating AI quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const quickAIGeneration = async () => {
    if (generating) return;

    setGenerating(true);
    setGenerationProgress(0);

    try {
      // Use default values for quick generation
      const defaultPrompt = 'professional competencies and behavioral assessment';
      const defaultDepartment = 'General';
      const defaultQuestionCount = 10;
      const defaultDifficulty = 'intermediate';

      // Enhanced AI question templates based on categories and difficulty
      const questionTemplates = {
        behavioral: [
          "Describe a time when you had to {action} in a challenging situation. How did you handle it?",
          "Tell me about a situation where you had to {action} under pressure. What was your approach?",
          "Give an example of when you {action} to achieve a goal. What steps did you take?",
          "Describe a time when you had to {action} with limited resources. How did you manage?"
        ],
        cultural_fit: [
          "How do you {action} when working in a diverse team environment?",
          "Describe your approach to {action} when company values are at stake.",
          "How would you {action} if you disagreed with a company policy?",
          "What does {action} mean to you in a professional context?"
        ],
        communication: [
          "How do you {action} when explaining complex concepts to non-technical stakeholders?",
          "Describe a time when you had to {action} difficult feedback to a colleague.",
          "How do you ensure effective {action} in remote work environments?",
          "Tell me about a situation where miscommunication occurred. How did you {action}?"
        ],
        teamwork: [
          "Describe how you {action} when working with team members who have different working styles.",
          "How do you {action} when there's conflict within your team?",
          "Tell me about a time when you had to {action} to support a struggling team member.",
          "How do you {action} to ensure everyone's voice is heard in team discussions?"
        ],
        leadership: [
          "Describe a situation where you had to {action} without formal authority.",
          "How do you {action} when leading a team through organizational change?",
          "Tell me about a time when you had to {action} a difficult decision that affected your team.",
          "How do you {action} to motivate team members who are underperforming?"
        ],
        adaptability: [
          "Describe a time when you had to {action} quickly to changing priorities.",
          "How do you {action} when faced with new technology or processes?",
          "Tell me about a situation where you had to {action} your approach mid-project.",
          "How do you {action} when working in an uncertain or ambiguous environment?"
        ]
      };

      const actionWords = {
        beginner: ['adapt', 'communicate', 'collaborate', 'learn', 'support'],
        intermediate: ['lead', 'innovate', 'resolve', 'optimize', 'influence'],
        advanced: ['strategize', 'transform', 'mentor', 'architect', 'orchestrate']
      };

      // Generate questions with progress updates
      const aiGeneratedQuestions: QuizQuestion[] = [];

      for (let index = 0; index < defaultQuestionCount; index++) {
        // Update progress
        setGenerationProgress(Math.round((index / defaultQuestionCount) * 100));

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));

        const category = questionCategories[index % questionCategories.length].value as any;
        const templates = questionTemplates[category] || questionTemplates.behavioral;
        const actions = actionWords[defaultDifficulty];

        const template = templates[Math.floor(Math.random() * templates.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const questionText = template.replace('{action}', action);

        // Generate contextual options based on category
        const optionSets = {
          behavioral: [
            ['I take immediate action without consulting others', 'I gather input from stakeholders before acting', 'I delegate the decision to someone else', 'I postpone the decision until more information is available'],
            ['I focus solely on the technical solution', 'I consider both technical and business implications', 'I prioritize speed over quality', 'I avoid making any changes'],
            ['I work independently to solve the problem', 'I collaborate with team members to find solutions', 'I escalate to management immediately', 'I document the issue and wait for guidance']
          ],
          communication: [
            ['I use technical jargon to be precise', 'I simplify language and use analogies', 'I provide written documentation only', 'I assume others understand without explanation'],
            ['I deliver feedback directly without context', 'I provide specific examples and suggestions', 'I avoid giving feedback to prevent conflict', 'I only give positive feedback']
          ],
          teamwork: [
            ['I focus on my individual tasks only', 'I actively support team goals and collaboration', 'I compete with team members for recognition', 'I avoid participating in team activities'],
            ['I take sides based on personal relationships', 'I facilitate discussion to find common ground', 'I ignore the conflict and hope it resolves', 'I escalate to management immediately']
          ]
        };

        const categoryOptions = optionSets[category] || optionSets.behavioral;
        const selectedOptions = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];

        // Determine correct answer (usually the collaborative/thoughtful option)
        const correctAnswerIndex = selectedOptions.findIndex(option =>
          option.includes('collaborate') ||
          option.includes('consider') ||
          option.includes('facilitate') ||
          option.includes('specific examples') ||
          option.includes('simplify')
        );

        const question: QuizQuestion = {
          id: `ai_q_${Date.now()}_${index}`,
          question: questionText,
          type: 'multiple_choice' as const,
          category,
          options: selectedOptions as [string, string, string, string],
          correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 1,
          points: 10,
          required: true,
          description: `This question evaluates ${questionCategories.find(cat => cat.value === category)?.label.toLowerCase()} competencies for professional assessment.`
        };

        aiGeneratedQuestions.push(question);
      }

      setGenerationProgress(100);

      // Update quiz with generated questions
      setQuiz(prev => ({
        ...prev,
        questions: aiGeneratedQuestions,
        title: prev.title || `Professional Assessment Quiz`,
        description: prev.description || `AI-generated professional competency assessment with ${defaultQuestionCount} behavioral and skill-based questions.`,
        difficulty: defaultDifficulty,
        totalQuestions: aiGeneratedQuestions.length
      }));

      toast.success(`Successfully generated ${aiGeneratedQuestions.length} professional assessment questions!`);

    } catch (error) {
      console.error('Error in quick AI generation:', error);
      toast.error('Failed to generate questions quickly');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('Please fill in all 4 answer options');
      return;
    }

    const newQuestion: QuizQuestion = {
      ...currentQuestion,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
      setEditingQuestionIndex(null);
      toast.success('Question updated successfully');
    } else {
      // Add new question
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
      const quizData = {
        ...quiz,
        status,
        updatedAt: new Date().toISOString(),
        ...(isEditMode ? {} : {
          id: `quiz-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: 'HR Manager',
          usageCount: 0
        })
      };

      // Simulate API call
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Full Width Container */}
      <div className="w-full px-6 py-8">
        {/* Clean Header */}
        <div className="max-w-7xl mx-auto mb-12">
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {isEditMode ? 'Edit Quiz' : isAIMode ? 'AI Quiz Generator' : 'Create New Quiz'}
                </h1>
                <p className="text-lg text-gray-600">
                  {isAIMode ? 'Generate questions automatically with AI' : 'Build your quiz step by step'}
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
                {showPreview ? 'Hide Preview' : 'Preview'}
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
                Publish Quiz
              </Button>
            </div>
          </div>
        </div>

        {/* AI Generation Modal */}
        {showAIGeneration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Quiz Generator</h2>
                  <p className="text-gray-600">Let AI create your quiz questions automatically</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(parseInt(e.target.value) || 10)}
                      min="5"
                      max="30"
                      className="w-full"
                      placeholder="5-30 questions"
                      disabled={generating}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recommended: 10-15 questions</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      disabled={generating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner (Entry Level)</option>
                      <option value="intermediate">Intermediate (Mid Level)</option>
                      <option value="advanced">Advanced (Senior Level)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department/Position *
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    disabled={generating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Management">Management</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Focus & Skills *
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={generating}
                    placeholder="Describe the skills and competencies you want to assess (e.g., 'Leadership skills for senior management positions', 'Communication abilities for customer-facing roles', etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                  />
                </div>

                {/* Advanced Options Toggle */}
                <div className="border-t border-gray-200 pt-4">
                  <Button
                    variant="outlined"
                    onClick={() => setShowAIOptions(!showAIOptions)}
                    className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    {showAIOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                  </Button>
                </div>

                {/* Advanced Options */}
                {showAIOptions && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Advanced Configuration
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question Categories
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {questionCategories.map((category) => (
                            <label key={category.value} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={aiTopics.includes(category.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAiTopics([...aiTopics, category.value]);
                                  } else {
                                    setAiTopics(aiTopics.filter(t => t !== category.value));
                                  }
                                }}
                                disabled={generating}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {category.icon} {category.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Leave empty to include all categories</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points per Question
                        </label>
                        <Input
                          type="number"
                          value={aiDifficulty === 'beginner' ? 8 : aiDifficulty === 'intermediate' ? 10 : 12}
                          disabled={true}
                          className="w-full bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-calculated based on difficulty</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry Context (Optional)
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            setAiPrompt(prev => prev + (prev ? ', ' : '') + e.target.value);
                          }
                        }}
                        disabled={generating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Add industry-specific context...</option>
                        <option value="technology startup environment">Technology Startup</option>
                        <option value="enterprise corporate setting">Enterprise Corporate</option>
                        <option value="healthcare industry standards">Healthcare</option>
                        <option value="financial services compliance">Financial Services</option>
                        <option value="retail customer service focus">Retail</option>
                        <option value="manufacturing operational excellence">Manufacturing</option>
                        <option value="consulting client-facing skills">Consulting</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Generation Progress in Modal */}
                {generating ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 w-8 h-8 border-2 border-blue-200 rounded-full animate-pulse"></div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">Generating your assessment...</div>
                        <div className="text-sm text-gray-600">Creating {quiz.totalQuestions} questions for {selectedDepartment}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{generationProgress}%</div>
                        <div className="text-xs text-gray-500">Complete</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out relative"
                          style={{ width: `${generationProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          {generationProgress < 20 ? '🔍 Analyzing requirements...' :
                           generationProgress < 40 ? '🧠 Processing AI templates...' :
                           generationProgress < 60 ? '📝 Generating questions...' :
                           generationProgress < 80 ? '🎯 Optimizing answers...' :
                           generationProgress < 95 ? '✨ Finalizing assessment...' :
                           '✅ Almost ready!'}
                        </div>
                        <div className="text-blue-600 font-medium">
                          {Math.floor(generationProgress * quiz.totalQuestions / 100)} / {quiz.totalQuestions} questions
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <div className="text-xs text-blue-800">
                        <span className="font-medium">💡 Did you know?</span> All generated questions will be fully editable after creation.
                        You can modify text, answers, and categories to perfectly match your needs.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 mb-1">AI Generation Features</h4>
                        <ul className="text-sm text-purple-700 space-y-1">
                          <li>• Automatically generates {quiz.totalQuestions} relevant questions</li>
                          <li>• Each question has exactly 4 answer choices</li>
                          <li>• Questions are tailored to your department and focus area</li>
                          <li>• All questions can be edited after generation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outlined"
                    onClick={() => setShowAIGeneration(false)}
                    disabled={generating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={generateAIQuiz}
                    disabled={generating || !aiPrompt.trim() || !selectedDepartment}
                    className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Width Step-by-Step Layout */}
        <div className="max-w-7xl mx-auto">
          {/* Step Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-semibold text-lg">
                  1
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Step 1</p>
                  <p className="text-lg font-semibold text-gray-900">Quiz Settings</p>
                </div>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-blue-600 rounded" style={{ width: quiz.title ? '100%' : '0%' }}></div>
              </div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg ${
                  quiz.title ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${quiz.title ? 'text-blue-600' : 'text-gray-500'}`}>Step 2</p>
                  <p className="text-lg font-semibold text-gray-900">Add Questions</p>
                </div>
              </div>
              <div className="flex-1 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-blue-600 rounded" style={{ width: quiz.questions.length > 0 ? '100%' : '0%' }}></div>
              </div>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-lg ${
                  quiz.questions.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${quiz.questions.length > 0 ? 'text-blue-600' : 'text-gray-500'}`}>Step 3</p>
                  <p className="text-lg font-semibold text-gray-900">Review & Publish</p>
                </div>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Settings */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quiz Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <Input
                    value={quiz.title}
                    onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter quiz title"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <Input
                    type="number"
                    value={quiz.timeLimit}
                    onChange={(e) => setQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                    min="10"
                    max="180"
                    className="w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={quiz.description}
                    onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and scope of this quiz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={quiz.difficulty}
                    onChange={(e) => setQuiz(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Enhanced AI Generation Section */}
              {!isAIMode && (
                <div className="mt-6 space-y-4">
                  {/* Quick AI Generation */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Quick AI Generation</h4>
                          <p className="text-sm text-gray-600">Generate 10 professional assessment questions instantly</p>
                        </div>
                      </div>
                      <Button
                        variant="contained"
                        onClick={quickAIGeneration}
                        disabled={generating}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 flex items-center gap-2 shadow-lg"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            Generate Now
                          </>
                        )}
                      </Button>
                    </div>

                    {generating && (
                      <div className="mt-4">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {generationProgress < 30 ? 'Analyzing requirements...' :
                           generationProgress < 70 ? 'Generating questions...' :
                           'Finalizing assessment...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Custom AI Generation */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium text-purple-900">Custom AI Generation</h4>
                          <p className="text-sm text-purple-700">Customize department, topics, and difficulty level</p>
                        </div>
                      </div>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAIGeneration(true)}
                        className="border-purple-300 text-purple-700 hover:bg-purple-100 flex items-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        Customize & Generate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Question Builder */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter your question here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={currentQuestion.category}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {questionCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
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

                {/* Answer Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Answer Options * (4 options required)
                  </label>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={currentQuestion.correctAnswer === index}
                            onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: index }))}
                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {String.fromCharCode(65 + index)}.
                          </span>
                        </div>
                        <Input
                          value={option}
                          onChange={(e) => updateQuestionOption(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select the radio button next to the correct answer
                  </p>
                </div>

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

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentQuestion.required}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required question</span>
                  </label>

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
                      >
                        Cancel Edit
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      onClick={addQuestion}
                      disabled={!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())}
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Enhanced Questions List */}
            {quiz.questions.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Questions ({quiz.questions.length})
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      All questions editable
                    </Badge>
                    {quiz.creationMethod === 'ai' && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        AI Generated
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="group border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 text-lg leading-relaxed">
                                {question.question}
                              </h3>
                              {question.required && (
                                <span className="text-red-500 text-sm ml-1">*</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              {questionCategories.find(cat => cat.value === question.category)?.icon} {' '}
                              {questionCategories.find(cat => cat.value === question.category)?.label}
                            </Badge>
                            <span className="flex items-center gap-1 text-green-600">
                              <Award className="w-4 h-4" />
                              {question.points} points
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">Multiple Choice</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                question.correctAnswer === optIndex
                                  ? 'bg-green-50 border-2 border-green-200 shadow-sm'
                                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
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

                          {question.description && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">Assessment Focus:</span> {question.description}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => editQuestion(index)}
                            className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => deleteQuestion(index)}
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Questions Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{quiz.questions.length}</span> questions generated
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{quiz.totalPoints}</span> total points
                      </div>
                      <div className="text-sm text-gray-600">
                        Est. <span className="font-medium text-gray-900">{quiz.estimatedDuration}</span> minutes
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      ✓ Ready for review and editing
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Metrics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Quiz Metrics
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Questions:</span>
                  <span className="font-semibold text-gray-900">{quiz.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Points:</span>
                  <span className="font-semibold text-gray-900">{quiz.totalPoints}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Limit:</span>
                  <span className="font-semibold text-gray-900">{quiz.timeLimit} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Passing Score:</span>
                  <span className="font-semibold text-gray-900">{quiz.passingScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. Duration:</span>
                  <span className="font-semibold text-gray-900">{quiz.estimatedDuration} min</span>
                </div>
              </div>

              {quiz.categories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Categories:</h4>
                  <div className="flex flex-wrap gap-1">
                    {quiz.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {questionCategories.find(cat => cat.value === category)?.icon} {' '}
                        {questionCategories.find(cat => cat.value === category)?.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h3>

              <div className="space-y-4">
                {/* Preview Action */}
                <Button
                  variant="outlined"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide Preview' : 'Preview Quiz'}
                </Button>

                {/* AI Generation Actions */}
                {!isAIMode && quiz.questions.length === 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="contained"
                      onClick={quickAIGeneration}
                      disabled={generating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      {generating ? 'Generating...' : 'Quick AI Generate'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setShowAIGeneration(true)}
                      className="w-full flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      <Wand2 className="w-4 h-4" />
                      Custom AI Generate
                    </Button>
                  </div>
                )}

                {/* Add More Questions */}
                {quiz.questions.length > 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => setShowAIGeneration(true)}
                    className="w-full flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add More Questions
                  </Button>
                )}

                {/* Save Actions */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="contained"
                    onClick={() => saveQuiz('draft')}
                    disabled={saving || quiz.questions.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => saveQuiz('active')}
                    disabled={saving || quiz.questions.length === 0 || !quiz.title.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Publish Quiz
                  </Button>
                </div>
              </div>
            </Card>

            {/* Enhanced Tips & Best Practices */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Best Practices
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">AI-Generated Questions</p>
                    <p className="text-xs text-gray-600">All AI questions are fully editable and can be customized to your needs</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Answer Options</p>
                    <p className="text-xs text-gray-600">Each question has exactly 4 options with one correct answer</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Question Quality</p>
                    <p className="text-xs text-gray-600">Use clear, professional language and avoid ambiguous phrasing</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Preview & Test</p>
                    <p className="text-xs text-gray-600">Always preview your quiz before publishing to ensure quality</p>
                  </div>
                </div>
              </div>

              {quiz.questions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="text-xs text-blue-700 bg-blue-100 rounded-lg p-3">
                    <span className="font-medium">💡 Pro Tip:</span> Your {quiz.questions.length} questions are ready!
                    You can edit any question by clicking the "Edit" button or add more using AI generation.
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Quiz Preview</h2>
                  <Button
                    variant="outlined"
                    onClick={() => setShowPreview(false)}
                    className="flex items-center gap-2"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title || 'Untitled Quiz'}</h1>
                  <p className="text-gray-600 mb-4">{quiz.description || 'No description provided'}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {quiz.timeLimit} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {quiz.questions.length} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {quiz.totalPoints} points
                    </span>
                  </div>

                  {quiz.instructions && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                      <p className="text-blue-800">{quiz.instructions}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {quiz.questions.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No questions yet</h3>
                      <p className="text-gray-600">Add some questions to see the preview</p>
                    </div>
                  ) : (
                    quiz.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {question.question}
                              {question.required && <span className="text-red-500 ml-1">*</span>}
                            </h3>

                            {question.description && (
                              <p className="text-sm text-gray-600 mb-3 italic">{question.description}</p>
                            )}

                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <label key={optIndex} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`preview_question_${question.id}`}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    disabled
                                  />
                                  <span className="font-medium text-sm text-gray-700">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span className="text-gray-900">{option}</span>
                                  {question.correctAnswer === optIndex && (
                                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                  )}
                                </label>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                              <span>Points: {question.points}</span>
                              <span>Category: {questionCategories.find(cat => cat.value === question.category)?.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernQuizBuilder;
