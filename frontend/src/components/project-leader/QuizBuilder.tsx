import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Save,
  Play,
  Search,
  Filter,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  FileText,
  Code,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface Question {
  id: string;
  type: 'multiple_choice' | 'text' | 'code' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit?: number; // in minutes
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'behavioral' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number; // in minutes
  isPublic: boolean;
  usageCount: number;
  createdDate: string;
  lastUsed?: string;
  questions: Question[];
  tags: string[];
}

const QuizBuilder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Mock data for quizzes
  const quizzes: Quiz[] = [
    {
      id: 'quiz-001',
      title: 'React Fundamentals Assessment',
      description: 'Comprehensive quiz covering React basics, hooks, and state management',
      category: 'technical',
      difficulty: 'medium',
      totalQuestions: 15,
      totalPoints: 150,
      timeLimit: 45,
      isPublic: true,
      usageCount: 25,
      createdDate: '2024-01-15',
      lastUsed: '2024-06-15',
      tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the purpose of useEffect hook in React?',
          options: ['State management', 'Side effects', 'Event handling', 'Rendering'],
          correctAnswer: 'Side effects',
          points: 10,
          difficulty: 'medium',
          category: 'React Hooks',
          timeLimit: 3
        }
      ]
    },
    {
      id: 'quiz-002',
      title: 'Node.js Backend Development',
      description: 'Assessment for Node.js, Express, and database integration skills',
      category: 'technical',
      difficulty: 'hard',
      totalQuestions: 20,
      totalPoints: 200,
      timeLimit: 60,
      isPublic: false,
      usageCount: 12,
      createdDate: '2024-02-20',
      lastUsed: '2024-06-10',
      tags: ['Node.js', 'Express', 'MongoDB', 'API'],
      questions: []
    },
    {
      id: 'quiz-003',
      title: 'Problem Solving & Logic',
      description: 'General problem-solving and logical thinking assessment',
      category: 'general',
      difficulty: 'medium',
      totalQuestions: 10,
      totalPoints: 100,
      timeLimit: 30,
      isPublic: true,
      usageCount: 18,
      createdDate: '2024-03-10',
      lastUsed: '2024-06-12',
      tags: ['Logic', 'Problem Solving', 'Algorithms'],
      questions: []
    }
  ];

  // Filter and sort quizzes
  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(term) ||
        quiz.description.toLowerCase().includes(term) ||
        quiz.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === categoryFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === difficultyFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUsed || b.createdDate).getTime() - new Date(a.lastUsed || a.createdDate).getTime();
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        default:
          return 0;
      }
    });

    return filtered;
  }, [quizzes, searchTerm, categoryFilter, difficultyFilter, sortBy]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-red-100 text-red-800';
      case 'behavioral': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return <CheckCircle className="w-4 h-4" />;
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'true_false': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'general', label: 'General' }
  ];

  const difficultyOptions = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Used' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
          <p className="text-gray-600">Create and manage technical assessment quizzes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outlined" size="small">
            <Copy className="w-4 h-4 mr-2" />
            Import Quiz
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.reduce((sum, quiz) => sum + quiz.totalQuestions, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.reduce((sum, quiz) => sum + quiz.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(quizzes.reduce((sum, quiz) => sum + quiz.timeLimit, 0) / quizzes.length)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          />
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="space-y-4">
        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Quiz Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {quiz.description}
                    </p>
                  </div>
                </div>

                {/* Quiz Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`text-xs ${getCategoryColor(quiz.category)}`}>
                    {quiz.category}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                  {quiz.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>

                {/* Quiz Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{quiz.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{quiz.timeLimit} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{quiz.totalPoints} points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{quiz.usageCount} uses</span>
                  </div>
                </div>

                {/* Quiz Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {quiz.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" size="small" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {quiz.tags.length > 3 && (
                    <Badge variant="outline" size="small" className="text-xs">
                      +{quiz.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Last Used */}
                <div className="text-xs text-gray-500 mb-4">
                  {quiz.lastUsed
                    ? `Last used ${formatDate(quiz.lastUsed)}`
                    : `Created ${formatDate(quiz.createdDate)}`
                  }
                </div>

                {/* Quiz Actions */}
                <div className="flex gap-2">
                  <Button size="small" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Play className="w-3 h-3 mr-1" />
                    Use Quiz
                  </Button>
                  <Button variant="outlined" size="small">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="outlined" size="small">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outlined" size="small">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="outlined" size="small" className="text-red-600 border-red-300">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'
                ? "No quizzes match your current filters"
                : "You haven't created any quizzes yet"
              }
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;
