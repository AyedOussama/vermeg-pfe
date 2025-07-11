import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  User,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Award,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Send,
  Edit,
  Download,
  Filter,
  Search,
  RefreshCw,
  Target,
  Users,
  BarChart3
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { PriorityBadge, ImpactBadge } from '@/components/common/PriorityBadge';
import { SAMPLE_JOBS, SAMPLE_PROJECT_LEADERS, SAMPLE_HR_MANAGERS } from '@/data/dummyData';

interface JobApproval {
  id: string;
  job: any;
  projectLeader: any;
  hrManager: any;
  submittedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedImpact: 'low' | 'medium' | 'high';
  hrEnhancements: {
    questionsAdded: number;
    assessmentTime: number;
    culturalFitCriteria: string[];
    behavioralCompetencies: string[];
  };
  technicalAssessment: {
    questionsCount: number;
    difficulty: string;
    estimatedTime: number;
  };
  budgetImpact: number;
  timelineImpact: string;
}

interface ApprovalDecision {
  jobId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  comments: string;
  conditions?: string[];
}

const JobApprovalSystem: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<JobApproval[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobApproval | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<ApprovalDecision>({
    jobId: '',
    decision: 'approve',
    comments: '',
    conditions: []
  });

  useEffect(() => {
    loadApprovalData();
  }, []);

  useEffect(() => {
    if (jobId && pendingApprovals.length > 0) {
      const job = pendingApprovals.find(approval => approval.id === jobId);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [jobId, pendingApprovals]);

  const loadApprovalData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock approval data from jobs pending CEO approval
      const pendingJobs = SAMPLE_JOBS.filter(job => job.status === 'CEO_Approval' || job.status === 'HR_Review');
      
      const approvals: JobApproval[] = pendingJobs.map((job, index) => {
        const projectLeader = SAMPLE_PROJECT_LEADERS.find(pl => pl.id === job.createdBy);
        const hrManager = SAMPLE_HR_MANAGERS[index % SAMPLE_HR_MANAGERS.length];
        
        return {
          id: job.id,
          job,
          projectLeader,
          hrManager,
          submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as any,
          estimatedImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          hrEnhancements: {
            questionsAdded: 8 + Math.floor(Math.random() * 7),
            assessmentTime: 30 + Math.floor(Math.random() * 30),
            culturalFitCriteria: ['Team collaboration', 'Innovation mindset', 'Customer focus'],
            behavioralCompetencies: ['Communication', 'Problem-solving', 'Leadership potential']
          },
          technicalAssessment: {
            questionsCount: job.technicalQuiz?.questions?.length || 12,
            difficulty: job.level || 'intermediate',
            estimatedTime: job.technicalQuiz?.timeLimit || 60
          },
          budgetImpact: 75000 + Math.floor(Math.random() * 50000),
          timelineImpact: '2-3 weeks to fill'
        };
      });

      setPendingApprovals(approvals);
      
      if (!selectedJob && approvals.length > 0) {
        setSelectedJob(approvals[0]);
      }
    } catch (error) {
      console.error('Error loading approval data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async (jobApproval: JobApproval, decisionType: 'approve' | 'reject' | 'request_changes') => {
    setDecision({
      jobId: jobApproval.id,
      decision: decisionType,
      comments: '',
      conditions: []
    });
    setShowDecisionModal(true);
  };

  const submitDecision = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Decision submitted:', decision);
      
      // Update local state
      setPendingApprovals(prev => prev.filter(approval => approval.id !== decision.jobId));
      
      if (selectedJob?.id === decision.jobId) {
        const remaining = pendingApprovals.filter(approval => approval.id !== decision.jobId);
        setSelectedJob(remaining.length > 0 ? remaining[0] : null);
      }
      
      setShowDecisionModal(false);
      setDecision({ jobId: '', decision: 'approve', comments: '', conditions: [] });
    } catch (error) {
      console.error('Error submitting decision:', error);
    }
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = approval.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.projectLeader?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || approval.priority === filterPriority;
    const matchesDepartment = filterDepartment === 'all' || approval.job.department === filterDepartment;
    
    return matchesSearch && matchesPriority && matchesDepartment;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-purple-100 text-purple-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Approval Center</h1>
          <p className="text-gray-600">
            Review and approve HR-enhanced job postings for publication
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pendingApprovals.length} pending
          </Badge>
          
          <Button variant="outlined" onClick={loadApprovalData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outlined">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by job title, department, or project leader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Queue */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Pending Approvals ({filteredApprovals.length})
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredApprovals.length === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">All Caught Up!</h3>
                  <p className="text-sm text-gray-600">No pending job approvals at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApprovals.map((approval) => (
                    <div
                      key={approval.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedJob?.id === approval.id ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                      }`}
                      onClick={() => setSelectedJob(approval)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {approval.job.title}
                        </h3>
                        <PriorityBadge
                          priority={approval.priority as any}
                          size="small"
                          variant="glass"
                        />
                      </div>

                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {approval.job.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {approval.projectLeader?.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(approval.submittedAt)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <ImpactBadge
                          impact={approval.estimatedImpact as any}
                          size="small"
                          variant="glass"
                        />
                        <span className="text-xs font-medium text-gray-900">
                          {formatCurrency(approval.budgetImpact)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Job Details */}
        <div className="lg:col-span-2">
          {selectedJob ? (
            <div className="space-y-6">
              {/* Job Overview */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedJob.job.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {selectedJob.job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {selectedJob.job.salary}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <PriorityBadge
                      priority={selectedJob.priority as any}
                      size="medium"
                      variant="glass"
                    />
                    <ImpactBadge
                      impact={selectedJob.estimatedImpact as any}
                      size="medium"
                      variant="glass"
                    />
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{selectedJob.job.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Project Leader</div>
                    <div className="text-gray-900">{selectedJob.projectLeader?.name}</div>
                    <div className="text-xs text-gray-600">{selectedJob.projectLeader?.email}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">HR Manager</div>
                    <div className="text-gray-900">{selectedJob.hrManager?.name}</div>
                    <div className="text-xs text-gray-600">{selectedJob.hrManager?.email}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Timeline</div>
                    <div className="text-gray-900">{selectedJob.timelineImpact}</div>
                    <div className="text-xs text-gray-600">Estimated to fill</div>
                  </div>
                </div>
              </Card>

              {/* Assessment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Assessment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Questions Count:</span>
                      <span className="font-medium">{selectedJob.technicalAssessment.questionsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Difficulty Level:</span>
                      <Badge variant="outline">{selectedJob.technicalAssessment.difficulty}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estimated Time:</span>
                      <span className="font-medium">{selectedJob.technicalAssessment.estimatedTime} min</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Enhancements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">HR Questions Added:</span>
                      <span className="font-medium">{selectedJob.hrEnhancements.questionsAdded}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Assessment Time:</span>
                      <span className="font-medium">{selectedJob.hrEnhancements.assessmentTime} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cultural Criteria:</span>
                      <span className="font-medium">{selectedJob.hrEnhancements.culturalFitCriteria.length}</span>
                    </div>
                  </div>
                </Card>
              </div>



              {/* HR Enhancement Details */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Enhancement Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Cultural Fit Criteria</h4>
                    <div className="space-y-2">
                      {selectedJob.hrEnhancements.culturalFitCriteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{criteria}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Behavioral Competencies</h4>
                    <div className="space-y-2">
                      {selectedJob.hrEnhancements.behavioralCompetencies.map((competency, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-700">{competency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Decision Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Decision</h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="contained"
                    onClick={() => handleApprovalDecision(selectedJob, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Publish
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => handleApprovalDecision(selectedJob, 'request_changes')}
                    className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Request Changes
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => handleApprovalDecision(selectedJob, 'reject')}
                    className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Job to Review</h3>
              <p className="text-gray-600">
                Choose a job from the approval queue to view details and make a decision.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {decision.decision === 'approve' && 'Approve Job Posting'}
                {decision.decision === 'reject' && 'Reject Job Posting'}
                {decision.decision === 'request_changes' && 'Request Changes'}
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments {decision.decision !== 'approve' && '*'}
                </label>
                <textarea
                  value={decision.comments}
                  onChange={(e) => setDecision({ ...decision, comments: e.target.value })}
                  placeholder={
                    decision.decision === 'approve'
                      ? 'Optional comments for the team...'
                      : 'Please provide detailed feedback...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {decision.decision === 'approve' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Conditions (Optional)
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">Require monthly progress reports</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">Budget approval required for offers above range</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                      <span className="ml-2 text-sm text-gray-700">Final candidate approval by CEO</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => setShowDecisionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={submitDecision}
                disabled={decision.decision !== 'approve' && !decision.comments.trim()}
                className={
                  decision.decision === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : decision.decision === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApprovalSystem;
