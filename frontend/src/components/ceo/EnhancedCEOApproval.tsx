// Enhanced CEO Approval Component for Job Workflow

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  MessageSquare,
  Clock,
  FileText,
  Users,
  Star,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Send,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Job, CEOApprovalData } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

interface EnhancedCEOApprovalProps {
  className?: string;
}

const EnhancedCEOApproval: React.FC<EnhancedCEOApprovalProps> = ({ className = '' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [decision, setDecision] = useState<'approve' | 'reject' | 'request_modifications' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load jobs pending CEO approval
  useEffect(() => {
    loadPendingJobs();
  }, []);

  const loadPendingJobs = async () => {
    setLoading(true);
    try {
      // For now, we'll filter from all jobs - in real implementation this would be a specific endpoint
      const allJobs = await mockWorkflowService.getMyJobs();
      const pendingJobs = allJobs.filter(job => job.status === 'pending_ceo_approval');
      setJobs(pendingJobs);
    } catch (error) {
      console.error('Error loading pending jobs:', error);
      toast.error('Failed to load pending jobs');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.projectLeader.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days since creation
  const getDaysSinceCreation = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle job selection for detailed review
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setDecision(null);
    setFeedback('');
  };

  // Handle CEO decision
  const handleDecision = async () => {
    if (!selectedJob || !decision) return;

    setSubmitting(true);
    try {
      const approvalData: CEOApprovalData = {
        jobId: selectedJob.id,
        decision,
        feedback: feedback.trim() || undefined,
        approvedAt: decision === 'approve' ? new Date().toISOString() : undefined,
        approvedBy: 'current-ceo-user'
      };

      // In real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const actionText = decision === 'approve' ? 'approved' : 
                        decision === 'reject' ? 'rejected' : 'sent back for modifications';
      
      toast.success(`Job ${actionText} successfully!`);
      
      // Reset state and reload jobs
      setSelectedJob(null);
      setDecision(null);
      setFeedback('');
      loadPendingJobs();
    } catch (error) {
      console.error('Error processing decision:', error);
      toast.error('Failed to process decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get decision button variant
  const getDecisionVariant = (decisionType: string) => {
    switch (decisionType) {
      case 'approve': return 'success';
      case 'reject': return 'destructive';
      case 'request_modifications': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Job Detail View
  if (selectedJob) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setSelectedJob(null)}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Approval Review</h1>
            <p className="text-gray-600">Review complete job package for final approval</p>
          </div>
        </div>

        {/* Job Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {selectedJob.department}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {selectedJob.projectLeader.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(selectedJob.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="warning">Pending CEO Approval</Badge>
              {selectedJob.urgent && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-4">{selectedJob.description}</p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Employment:</span>
              <p className="text-gray-600">{selectedJob.employmentType.replace('_', ' ')} • {selectedJob.level}</p>
            </div>
            
            <div className="text-sm">
              <span className="font-medium text-gray-700">Experience:</span>
              <p className="text-gray-600">{selectedJob.minExperience}+ years</p>
            </div>
            
            <div className="text-sm">
              <span className="font-medium text-gray-700">Salary:</span>
              <p className="text-gray-600">
                {selectedJob.displaySalary 
                  ? `${selectedJob.salaryRangeMin.toLocaleString()} - ${selectedJob.salaryRangeMax.toLocaleString()} ${selectedJob.currency}`
                  : 'Not disclosed'
                }
              </p>
            </div>
          </div>

          {/* Workflow Progress */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Workflow Progress</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Created by {selectedJob.projectLeader.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Enhanced by {selectedJob.hrManager?.name || 'HR Team'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span>Awaiting CEO approval</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Assessment Review */}
        {selectedJob.technicalQuiz && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Technical Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Questions:</span>
                <p className="text-gray-600">{selectedJob.technicalQuiz.questions.length}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Total Points:</span>
                <p className="text-gray-600">{selectedJob.technicalQuiz.totalPoints}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Time Limit:</span>
                <p className="text-gray-600">{selectedJob.technicalQuiz.timeLimit} minutes</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Passing Score:</span>
                <p className="text-gray-600">{selectedJob.technicalQuiz.passingScore}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Sample Questions:</h4>
              {selectedJob.technicalQuiz.questions.slice(0, 3).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">Q{index + 1}: {question.question}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600">
                    <span>Category: {question.category}</span>
                    <span>Difficulty: {question.difficulty}</span>
                    <span>Points: {question.points}</span>
                  </div>
                </div>
              ))}
              {selectedJob.technicalQuiz.questions.length > 3 && (
                <p className="text-sm text-gray-600">
                  +{selectedJob.technicalQuiz.questions.length - 3} more questions
                </p>
              )}
            </div>
          </Card>
        )}

        {/* HR Assessment Review */}
        {selectedJob.hrQuiz && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">HR Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Questions:</span>
                <p className="text-gray-600">{selectedJob.hrQuiz.questions.length}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Total Points:</span>
                <p className="text-gray-600">{selectedJob.hrQuiz.totalPoints}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Time Limit:</span>
                <p className="text-gray-600">{selectedJob.hrQuiz.timeLimit} minutes</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">Passing Score:</span>
                <p className="text-gray-600">{selectedJob.hrQuiz.passingScore}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Sample Questions:</h4>
              {selectedJob.hrQuiz.questions.slice(0, 2).map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">Q{index + 1}: {question.question}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600">
                    <span>Category: {question.category}</span>
                    <span>Type: {question.type}</span>
                    <span>Points: {question.points}</span>
                  </div>
                </div>
              ))}
              {selectedJob.hrQuiz.questions.length > 2 && (
                <p className="text-sm text-gray-600">
                  +{selectedJob.hrQuiz.questions.length - 2} more questions
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Decision Panel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">CEO Decision</h3>
          
          <div className="space-y-4">
            {/* Decision Options */}
            <div className="flex gap-3">
              <Button
                variant={decision === 'approve' ? 'contained' : 'outlined'}
                onClick={() => setDecision('approve')}
                className={`flex items-center gap-2 ${
                  decision === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
              
              <Button
                variant={decision === 'request_modifications' ? 'contained' : 'outlined'}
                onClick={() => setDecision('request_modifications')}
                className={`flex items-center gap-2 ${
                  decision === 'request_modifications' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Request Modifications
              </Button>
              
              <Button
                variant={decision === 'reject' ? 'contained' : 'outlined'}
                onClick={() => setDecision('reject')}
                className={`flex items-center gap-2 ${
                  decision === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'border-red-600 text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </div>

            {/* Feedback */}
            {decision && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {decision === 'approve' ? 'Approval Notes (Optional)' : 
                   decision === 'reject' ? 'Rejection Reason (Required)' : 
                   'Modification Requests (Required)'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    decision === 'approve' ? 'Any additional notes or congratulations...' :
                    decision === 'reject' ? 'Please explain why this job is being rejected...' :
                    'Please specify what modifications are needed...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required={decision !== 'approve'}
                />
              </div>
            )}

            {/* Submit Button */}
            {decision && (
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  onClick={handleDecision}
                  disabled={submitting || (decision !== 'approve' && !feedback.trim())}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Processing...' : `Confirm ${decision === 'approve' ? 'Approval' : decision === 'reject' ? 'Rejection' : 'Modification Request'}`}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Jobs Queue View
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEO Approval Queue</h1>
          <p className="text-gray-600">
            Review and approve job postings for publication
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {jobs.length} pending
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, department, or project leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Jobs Queue */}
      {filteredJobs.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No jobs found' : 'All caught up!'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'No jobs are currently pending CEO approval'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const daysWaiting = getDaysSinceCreation(job.createdAt);
            
            return (
              <Card key={job.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobSelect(job)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          {job.urgent && (
                            <Badge variant="destructive" size="sm">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job.projectLeader.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {daysWaiting} day{daysWaiting !== 1 ? 's' : ''} waiting
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job Description */}
                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    {/* Assessment Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {job.technicalQuiz && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">Technical Assessment</span>
                          </div>
                          <p className="text-sm text-blue-800">
                            {job.technicalQuiz.questions.length} questions • {job.technicalQuiz.totalPoints} points
                          </p>
                        </div>
                      )}
                      
                      {job.hrQuiz && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-orange-900">HR Assessment</span>
                          </div>
                          <p className="text-sm text-orange-800">
                            {job.hrQuiz.questions.length} questions • {job.hrQuiz.totalPoints} points
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="contained"
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                      >
                        <Eye className="w-4 h-4" />
                        Review & Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnhancedCEOApproval;
