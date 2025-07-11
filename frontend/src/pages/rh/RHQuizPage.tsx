import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Brain,
  FileText,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical,
  Copy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { toast } from 'react-toastify';

interface HRQuiz {
  id: string;
  title: string;
  description: string;
  department: string;
  totalQuestions: number;
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  creationMethod: 'manual' | 'ai';
}

interface RHQuizPageProps {
  className?: string;
}

const RHQuizPage: React.FC<RHQuizPageProps> = ({ className = '' }) => {
  const [quizzes, setQuizzes] = useState<HRQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockQuizzes: HRQuiz[] = [
        {
          id: 'quiz-1',
          title: 'Communication Skills Assessment',
          description: 'Evaluate candidate communication and interpersonal skills',
          department: 'General',
          totalQuestions: 12,
          totalPoints: 120,
          timeLimit: 45,
          passingScore: 70,
          status: 'active',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:20:00Z',
          createdBy: 'HR Manager',
          usageCount: 25,
          tags: ['communication', 'interpersonal', 'soft-skills'],
          difficulty: 'intermediate',
          creationMethod: 'manual'
        },
        {
          id: 'quiz-2',
          title: 'Team Collaboration Evaluation',
          description: 'AI-generated assessment for teamwork and collaboration skills',
          department: 'Engineering',
          totalQuestions: 15,
          totalPoints: 150,
          timeLimit: 60,
          passingScore: 75,
          status: 'active',
          createdAt: '2024-01-18T09:15:00Z',
          updatedAt: '2024-01-18T09:15:00Z',
          createdBy: 'AI Assistant',
          usageCount: 18,
          tags: ['teamwork', 'collaboration', 'leadership'],
          difficulty: 'advanced',
          creationMethod: 'ai'
        },
        {
          id: 'quiz-3',
          title: 'Cultural Fit Assessment',
          description: 'Assess alignment with company values and culture',
          department: 'All Departments',
          totalQuestions: 10,
          totalPoints: 100,
          timeLimit: 30,
          passingScore: 65,
          status: 'draft',
          createdAt: '2024-01-22T11:15:00Z',
          updatedAt: '2024-01-22T11:15:00Z',
          createdBy: 'HR Specialist',
          usageCount: 0,
          tags: ['culture', 'values', 'fit'],
          difficulty: 'beginner',
          creationMethod: 'manual'
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

  const handleCreateManual = () => {
    // Navigate to manual quiz builder
    window.location.href = '/rh/quiz/create/manual';
  };



  const handleEditQuiz = (quizId: string) => {
    window.location.href = `/rh/quiz/edit/${quizId}`;
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
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
        usageCount: 0
      };

      setQuizzes(prev => [duplicatedQuiz, ...prev]);
      toast.success('Quiz duplicated successfully');
    } catch (error) {
      console.error('Error duplicating quiz:', error);
      toast.error('Failed to duplicate quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || quiz.status === filterStatus;
    
    return matchesSearch && matchesFilter;
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

  const getCreationMethodIcon = (method: string) => {
    return method === 'ai' ? <Brain className="w-4 h-4" /> : <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Management</h1>
          <p className="text-lg text-gray-600">Create and manage your HR assessment quizzes</p>
        </div>

        {/* Create New Quiz Button */}
        <div className="mb-8">
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateManual}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create New Quiz</span>
          </Button>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.filter(q => q.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizzes.reduce((sum, quiz) => sum + quiz.usageCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <div className="space-y-4">
          {filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first quiz to get started'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button
                  variant="contained"
                  onClick={handleCreateManual}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Create Your First Quiz
                </Button>
              )}
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                    <Badge
                      variant={getStatusColor(quiz.status)}
                      className="px-3 py-1 text-sm font-medium"
                    >
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditQuiz(quiz.id)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50 px-4 py-2"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setQuizToDelete(quiz.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50 px-4 py-2"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{quiz.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{quiz.totalQuestions} Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span>{quiz.timeLimit} Minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span>{quiz.totalPoints} Points</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Used {quiz.usageCount} times</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {quiz.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {quiz.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{quiz.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Created by {quiz.createdBy}
                  </div>
                </div>
              </div>
            ))
          )}
      </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Quiz</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete this quiz? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setQuizToDelete(null);
                  }}
                  className="flex-1 py-3"
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => quizToDelete && handleDeleteQuiz(quizToDelete)}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3"
                >
                  Delete Quiz
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RHQuizPage;
