import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Search, 
  Filter, 
  MoreVertical,
  Clock,
  Users,
  Award,
  FileText,
  Settings,
  Download,
  Upload,
  Star,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
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
  id: string;
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number;
  averageScore?: number;
  tags: string[];
  isTemplate: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface QuizManagementProps {
  className?: string;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ className = '' }) => {
  const [quizzes, setQuizzes] = useState<HRQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockQuizzes: HRQuiz[] = [
        {
          id: 'quiz-1',
          title: 'Senior Developer Behavioral Assessment',
          description: 'Comprehensive behavioral evaluation for senior developer positions',
          department: 'Engineering',
          jobTitle: 'Senior Full Stack Developer',
          totalQuestions: 12,
          totalPoints: 120,
          timeLimit: 45,
          passingScore: 75,
          questions: [],
          status: 'active',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
          createdBy: 'HR Manager',
          usageCount: 25,
          averageScore: 82,
          tags: ['behavioral', 'leadership', 'communication'],
          isTemplate: false,
          difficulty: 'intermediate'
        },
        {
          id: 'quiz-2',
          title: 'Cultural Fit Assessment Template',
          description: 'General cultural fit evaluation template for all positions',
          department: 'All',
          totalQuestions: 8,
          totalPoints: 80,
          timeLimit: 30,
          passingScore: 70,
          questions: [],
          status: 'active',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-18T16:45:00Z',
          createdBy: 'HR Manager',
          usageCount: 45,
          averageScore: 78,
          tags: ['cultural-fit', 'values', 'teamwork'],
          isTemplate: true,
          difficulty: 'beginner'
        },
        {
          id: 'quiz-3',
          title: 'Leadership Potential Evaluation',
          description: 'Assessment for identifying leadership potential in candidates',
          department: 'Management',
          totalQuestions: 15,
          totalPoints: 150,
          timeLimit: 60,
          passingScore: 80,
          questions: [],
          status: 'draft',
          createdAt: '2024-01-22T11:15:00Z',
          updatedAt: '2024-01-22T11:15:00Z',
          createdBy: 'HR Manager',
          usageCount: 0,
          tags: ['leadership', 'management', 'decision-making'],
          isTemplate: false,
          difficulty: 'advanced'
        }
      ];

      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    // Navigate to quiz builder
    window.location.href = '/rh/quiz/create';
  };

  const handleEditQuiz = (quizId: string) => {
    // Navigate to quiz editor
    window.location.href = `/rh/quiz/edit/${quizId}`;
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      // API call to delete quiz
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      toast.success('Quiz deleted successfully');
      setShowDeleteModal(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz');
    }
  };

  const handleDuplicateQuiz = async (quiz: HRQuiz) => {
    try {
      const duplicatedQuiz: HRQuiz = {
        ...quiz,
        id: `quiz-${Date.now()}`,
        title: `${quiz.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        averageScore: undefined
      };

      setQuizzes(prev => [duplicatedQuiz, ...prev]);
      toast.success('Quiz duplicated successfully');
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      toast.error('Failed to duplicate quiz');
    }
  };

  const handleStatusChange = async (quizId: string, newStatus: 'draft' | 'active' | 'archived') => {
    try {
      setQuizzes(prev => prev.map(quiz => 
        quiz.id === quizId 
          ? { ...quiz, status: newStatus, updatedAt: new Date().toISOString() }
          : quiz
      ));
      toast.success(`Quiz ${newStatus === 'active' ? 'activated' : newStatus === 'archived' ? 'archived' : 'saved as draft'} successfully`);
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update quiz status');
    }
  };

  const handleBulkDelete = async () => {
    try {
      setQuizzes(prev => prev.filter(quiz => !selectedQuizzes.includes(quiz.id)));
      setSelectedQuizzes([]);
      toast.success(`${selectedQuizzes.length} quiz(es) deleted successfully`);
    } catch (error) {
      console.error('Error deleting quizzes:', error);
      toast.error('Failed to delete quizzes');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = searchTerm === '' || 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || quiz.department === departmentFilter;
    const matchesDifficulty = difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most-used':
        return b.usageCount - a.usageCount;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <AlertCircle className="w-4 h-4" />;
      case 'archived': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600">Create, edit, and manage HR assessment quizzes</p>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedQuizzes.length > 0 && (
            <Button
              variant="outlined"
              onClick={handleBulkDelete}
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedQuizzes.length})
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={handleCreateQuiz}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.filter(q => q.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.reduce((sum, q) => sum + q.usageCount, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(quizzes.filter(q => q.averageScore).reduce((sum, q) => sum + (q.averageScore || 0), 0) / quizzes.filter(q => q.averageScore).length) || 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search quizzes by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Management">Management</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-used">Most Used</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Quiz List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || difficultyFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first quiz to get started'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && departmentFilter === 'all' && difficultyFilter === 'all' && (
              <Button
                variant="contained"
                onClick={handleCreateQuiz}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Your First Quiz
              </Button>
            )}
          </Card>
        ) : (
          filteredQuizzes.map(quiz => (
            <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedQuizzes.includes(quiz.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuizzes(prev => [...prev, quiz.id]);
                      } else {
                        setSelectedQuizzes(prev => prev.filter(id => id !== quiz.id));
                      }
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                      {quiz.isTemplate && (
                        <Badge variant="info" className="text-xs">
                          Template
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{quiz.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={getStatusColor(quiz.status)} className="flex items-center gap-1">
                        {getStatusIcon(quiz.status)}
                        {quiz.status.toUpperCase()}
                      </Badge>

                      <Badge variant={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty.toUpperCase()}
                      </Badge>

                      <Badge variant="default">
                        {quiz.department}
                      </Badge>

                      {quiz.jobTitle && (
                        <Badge variant="default">
                          {quiz.jobTitle}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {quiz.totalQuestions} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        {quiz.totalPoints} points
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.timeLimit} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Used {quiz.usageCount} times
                      </div>
                      {quiz.averageScore && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {quiz.averageScore}% avg score
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {quiz.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(quiz.updatedAt).toLocaleDateString()}</span>
                      <span>By: {quiz.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDuplicateQuiz(quiz)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>

                  <div className="relative group">
                    <Button
                      variant="outlined"
                      size="small"
                      className="flex items-center gap-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <div className="py-1">
                        <button
                          onClick={() => window.open(`/rh/quiz/preview/${quiz.id}`, '_blank')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>

                        {quiz.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(quiz.id, 'active')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Activate
                          </button>
                        )}

                        {quiz.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(quiz.id, 'archived')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Archive
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setQuizToDelete(quiz.id);
                            setShowDeleteModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizManagement;
