import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare, 
  User, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface JobApproval {
  id: string;
  title: string;
  department: string;
  projectLeader: {
    name: string;
    email: string;
  };
  rhReviewer: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  technicalQuestions: number;
  hrQuestions: number;
  estimatedHires: number;
  budget: string;
  comments?: string;
}

interface ApprovalsQueueProps {
  className?: string;
}

const ApprovalsQueue: React.FC<ApprovalsQueueProps> = ({ className = '' }) => {
  const [approvals, setApprovals] = useState<JobApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<JobApproval | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockApprovals: JobApproval[] = [
      {
        id: '1',
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        projectLeader: { name: 'John Smith', email: 'john.smith@vermeg.com' },
        rhReviewer: { name: 'Sarah Johnson', email: 'sarah.johnson@vermeg.com' },
        status: 'pending',
        submittedDate: '2024-01-15',
        priority: 'high',
        description: 'Join our dynamic engineering team to build cutting-edge fintech solutions using React, Node.js, and cloud technologies.',
        technicalQuestions: 8,
        hrQuestions: 5,
        estimatedHires: 2,
        budget: '45,000 - 65,000 TND'
      },
      {
        id: '2',
        title: 'Product Manager',
        department: 'Product',
        projectLeader: { name: 'Mike Wilson', email: 'mike.wilson@vermeg.com' },
        rhReviewer: { name: 'Lisa Chen', email: 'lisa.chen@vermeg.com' },
        status: 'pending',
        submittedDate: '2024-01-14',
        priority: 'medium',
        description: 'Lead product strategy and development for our financial software solutions.',
        technicalQuestions: 6,
        hrQuestions: 7,
        estimatedHires: 1,
        budget: '50,000 - 70,000 TND'
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        department: 'Design',
        projectLeader: { name: 'Emma Davis', email: 'emma.davis@vermeg.com' },
        rhReviewer: { name: 'Tom Brown', email: 'tom.brown@vermeg.com' },
        status: 'approved',
        submittedDate: '2024-01-13',
        priority: 'medium',
        description: 'Create intuitive and beautiful user experiences for our financial applications.',
        technicalQuestions: 5,
        hrQuestions: 4,
        estimatedHires: 1,
        budget: '35,000 - 50,000 TND'
      }
    ];

    setTimeout(() => {
      setApprovals(mockApprovals);
      setLoading(false);
    }, 1000);
  }, []);

  const handleApprove = async (id: string, comments?: string) => {
    try {
      // API call to approve job posting
      setApprovals(prev => prev.map(approval => 
        approval.id === id 
          ? { ...approval, status: 'approved' as const, comments }
          : approval
      ));
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const handleReject = async (id: string, comments: string) => {
    try {
      // API call to reject job posting
      setApprovals(prev => prev.map(approval => 
        approval.id === id 
          ? { ...approval, status: 'rejected' as const, comments }
          : approval
      ));
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredApprovals = approvals.filter(approval => {
    const matchesFilter = filter === 'all' || approval.status === filter;
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Approvals Queue</h1>
          <p className="text-gray-600">Review and approve job postings before publication</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {approvals.filter(a => a.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {approvals.filter(a => a.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {approvals.filter(a => a.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{approvals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                  <Badge className={getPriorityColor(approval.priority)}>
                    {approval.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(approval.status)}>
                    {approval.status.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-3">{approval.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Department:</span> {approval.department}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> {approval.budget}
                  </div>
                  <div>
                    <span className="font-medium">Est. Hires:</span> {approval.estimatedHires}
                  </div>
                  <div>
                    <span className="font-medium">Questions:</span> {approval.technicalQuestions + approval.hrQuestions}
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Project Leader: {approval.projectLeader.name}</span>
                    <span>HR Reviewer: {approval.rhReviewer.name}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(approval.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedApproval(approval)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </Button>
                
                {approval.status === 'pending' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleApprove(approval.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReject(approval.id, 'Rejected by CEO')}
                      className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {approval.comments && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Comments</span>
                </div>
                <p className="text-sm text-gray-600">{approval.comments}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No approvals found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No job approvals available at the moment.' 
              : `No ${filter} job approvals found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalsQueue;
