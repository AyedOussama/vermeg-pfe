// Enhanced Application Review Component for Project Leader

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Star,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Download,
  Filter,
  Search,
  Users,
  TrendingUp,
  Brain
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Application, ApplicationFilter, ProjectLeaderDecisionData, Interview } from '@/types/job';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { aiReviewService, AIReviewResponse } from '@/services/aiReviewService';
import { interviewService } from '@/services/interviewService';
import { messagingService } from '@/services/messagingService';
import AIReviewModal from '@/components/modals/AIReviewModal';
import InterviewSchedulingModal from '@/components/rh/InterviewSchedulingModal';
import { toast } from 'react-toastify';

interface EnhancedApplicationReviewProps {
  className?: string;
}

const EnhancedApplicationReview: React.FC<EnhancedApplicationReviewProps> = ({ className = '' }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [decision, setDecision] = useState<'accept' | 'reject' | 'pending' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<Partial<ApplicationFilter>>({
    search: '',
    status: [],
    sortBy: 'newest'
  });

  // Interview scheduling state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [applicationForInterview, setApplicationForInterview] = useState<Application | null>(null);

  // AI Review state
  const [showAIReviewModal, setShowAIReviewModal] = useState(false);
  const [aiReview, setAIReview] = useState<AIReviewResponse | null>(null);
  const [aiReviewLoading, setAIReviewLoading] = useState(false);
  const [currentReviewApplication, setCurrentReviewApplication] = useState<Application | null>(null);

  // Load applications
  useEffect(() => {
    loadApplications();
  }, [filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const result = await mockWorkflowService.getApplicationsForReview(filters);
      setApplications(result.applications);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // Handle application selection
  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
    setDecision(null);
    setFeedback('');
    setRating(0);
  };

  // Handle decision submission
  const handleDecisionSubmit = async () => {
    if (!selectedApplication || !decision) return;

    setSubmitting(true);
    try {
      const decisionData: ProjectLeaderDecisionData = {
        applicationId: selectedApplication.id,
        decision,
        feedback: feedback.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        decidedAt: new Date().toISOString()
      };

      await mockWorkflowService.makeProjectLeaderDecision(decisionData);

      const actionText = decision === 'accept' ? 'accepted' :
                        decision === 'reject' ? 'rejected' : 'marked as pending';

      toast.success(`Application ${actionText} successfully!`);

      // If accepted, show interview scheduling option
      if (decision === 'accept') {
        setApplicationForInterview(selectedApplication);
        setShowInterviewModal(true);

        // Create conversation for messaging
        await messagingService.createConversationForApplication({
          applicationId: selectedApplication.id,
          candidateId: selectedApplication.candidateId,
          candidateName: `${selectedApplication.candidate.firstName} ${selectedApplication.candidate.lastName}`,
          rhUserId: 'current-rh-user', // This should come from auth context
          rhUserName: 'HR Team',
          jobTitle: selectedApplication.jobTitle
        });
      }

      // Reset state and reload applications
      setSelectedApplication(null);
      setDecision(null);
      setFeedback('');
      setRating(0);
      loadApplications();
    } catch (error) {
      console.error('Error processing decision:', error);
      toast.error('Failed to process decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle AI Review
  const handleAIReview = async (application: Application) => {
    setCurrentReviewApplication(application);
    setAIReviewLoading(true);
    setShowAIReviewModal(true);
    setAIReview(null);

    try {
      const review = await aiReviewService.generateReview(application);
      setAIReview(review);
      toast.success('AI review generated successfully!');
    } catch (error) {
      console.error('Error generating AI review:', error);
      toast.error('Failed to generate AI review. Please try again.');
      setShowAIReviewModal(false);
    } finally {
      setAIReviewLoading(false);
    }
  };

  const handleCloseAIReview = () => {
    setShowAIReviewModal(false);
    setAIReview(null);
    setCurrentReviewApplication(null);
    setAIReviewLoading(false);
  };

  // Handle interview scheduling
  const handleInterviewScheduled = (interview: Interview) => {
    toast.success('Interview scheduled successfully! Candidate has been notified.');
    setShowInterviewModal(false);
    setApplicationForInterview(null);
    loadApplications();
  };

  const handleCloseInterviewModal = () => {
    setShowInterviewModal(false);
    setApplicationForInterview(null);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'secondary';
      case 'technical_review': return 'info';
      case 'hr_review': return 'info';
      case 'under_review': return 'warning';
      case 'interview_scheduled': return 'info';
      case 'interview_completed': return 'warning';
      case 'pending_decision': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      case 'withdrawn': return 'secondary';
      default: return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days since application
  const getDaysAgo = (dateString: string) => {
    const applied = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Application Detail View
  if (selectedApplication) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setSelectedApplication(null)}
            className="flex items-center gap-1"
          >
            ← Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
            <p className="text-gray-600">Review candidate application and make hiring decision</p>
          </div>
        </div>

        {/* Application Overview */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {selectedApplication.candidate.profilePicture ? (
                  <img 
                    src={selectedApplication.candidate.profilePicture} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedApplication.candidate.firstName} {selectedApplication.candidate.lastName}
                </h2>
                <p className="text-gray-600 mb-2">{selectedApplication.candidate.currentPosition}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {selectedApplication.candidate.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedApplication.candidate.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedApplication.candidate.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant={getStatusVariant(selectedApplication.status)} className="mb-2">
                {selectedApplication.status.replace('_', ' ')}
              </Badge>
              <p className="text-sm text-gray-600">
                Applied {getDaysAgo(selectedApplication.appliedAt)} days ago
              </p>
              {selectedApplication.overallScore && (
                <p className="text-lg font-semibold text-green-600">
                  Overall Score: {selectedApplication.overallScore.toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Experience:</span>
              <p className="text-gray-600">{selectedApplication.candidate.experience} years</p>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Education:</span>
              <p className="text-gray-600">{selectedApplication.candidate.education}</p>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Expected Salary:</span>
              <p className="text-gray-600">{selectedApplication.candidate.expectedSalary || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        {/* Assessment Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Assessment */}
          {selectedApplication.technicalAssessment && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Technical Assessment</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedApplication.technicalAssessment.score}/{selectedApplication.technicalAssessment.maxScore} 
                    ({selectedApplication.technicalAssessment.percentage?.toFixed(1)}%)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={selectedApplication.technicalAssessment.passed ? 'success' : 'destructive'}>
                    {selectedApplication.technicalAssessment.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Spent:</span>
                  <span className="text-sm text-gray-900">
                    {selectedApplication.technicalAssessment.timeSpent} minutes
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      selectedApplication.technicalAssessment.passed ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedApplication.technicalAssessment.percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* HR Assessment */}
          {selectedApplication.hrAssessment && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">HR Assessment</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Score:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedApplication.hrAssessment.score}/{selectedApplication.hrAssessment.maxScore} 
                    ({selectedApplication.hrAssessment.percentage?.toFixed(1)}%)
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={selectedApplication.hrAssessment.passed ? 'success' : 'destructive'}>
                    {selectedApplication.hrAssessment.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Time Spent:</span>
                  <span className="text-sm text-gray-900">
                    {selectedApplication.hrAssessment.timeSpent} minutes
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      selectedApplication.hrAssessment.passed ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedApplication.hrAssessment.percentage}%` }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Documents */}
        {selectedApplication.documents && selectedApplication.documents.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="space-y-3">
              {selectedApplication.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-600">
                        {doc.type.replace('_', ' ')} • {(doc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="outlined" size="small" className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cover Letter */}
        {selectedApplication.coverLetter && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
          </Card>
        )}

        {/* Decision Panel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Decision</h3>
          
          <div className="space-y-4">
            {/* Decision Options */}
            <div className="flex gap-3">
              <Button
                variant={decision === 'accept' ? 'contained' : 'outlined'}
                onClick={() => setDecision('accept')}
                className={`flex items-center gap-2 ${
                  decision === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Accept
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
              
              <Button
                variant={decision === 'pending' ? 'contained' : 'outlined'}
                onClick={() => setDecision('pending')}
                className={`flex items-center gap-2 ${
                  decision === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Mark as Pending
              </Button>
            </div>

            {/* Rating */}
            {decision && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {decision && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback {decision === 'reject' ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    decision === 'accept' ? 'Congratulations message and next steps...' :
                    decision === 'reject' ? 'Please explain the reason for rejection...' :
                    'Additional notes about this candidate...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required={decision === 'reject'}
                />
              </div>
            )}

            {/* Submit Button */}
            {decision && (
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  onClick={handleDecisionSubmit}
                  disabled={submitting || (decision === 'reject' && !feedback.trim())}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  {submitting ? 'Processing...' : `Confirm ${decision === 'accept' ? 'Acceptance' : decision === 'reject' ? 'Rejection' : 'Pending Status'}`}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Applications List View
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600">
            Review candidate applications and make hiring decisions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {applications.length} applications
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by candidate name, email, or position..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Highest Score</option>
              <option value="score_low">Lowest Score</option>
              <option value="name">Name A-Z</option>
            </select>
            
            <Button variant="outlined" size="small" className="flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No applications to review</h3>
          <p className="text-gray-600">
            Applications will appear here once candidates complete their assessments
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const daysAgo = getDaysAgo(application.appliedAt);
            
            return (
              <Card 
                key={application.id} 
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleApplicationSelect(application)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {application.candidate.profilePicture ? (
                        <img 
                          src={application.candidate.profilePicture} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.candidate.firstName} {application.candidate.lastName}
                          </h3>
                          <p className="text-gray-600">{application.candidate.currentPosition}</p>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={getStatusVariant(application.status)} className="mb-1">
                            {application.status.replace('_', ' ')}
                          </Badge>
                          {application.overallScore && (
                            <p className="text-sm font-semibold text-green-600">
                              Score: {application.overallScore.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {application.candidate.experience} years exp.
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.candidate.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {daysAgo} day{daysAgo !== 1 ? 's' : ''} ago
                        </span>
                      </div>

                      {/* Assessment Summary */}
                      <div className="flex items-center gap-4 mb-3">
                        {application.technicalAssessment && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-4 h-4 text-blue-500" />
                            <span className={`${application.technicalAssessment.passed ? 'text-green-600' : 'text-red-600'}`}>
                              Technical: {application.technicalAssessment.percentage?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {application.hrAssessment && (
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="w-4 h-4 text-orange-500" />
                            <span className={`${application.hrAssessment.passed ? 'text-green-600' : 'text-red-600'}`}>
                              HR: {application.hrAssessment.percentage?.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="contained"
                          size="small"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplicationSelect(application);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review Application
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAIReview(application);
                          }}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          Review with AI
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* AI Review Modal */}
      <AIReviewModal
        isOpen={showAIReviewModal}
        onClose={handleCloseAIReview}
        review={aiReview}
        candidateName={currentReviewApplication ?
          `${currentReviewApplication.candidate.firstName} ${currentReviewApplication.candidate.lastName}` :
          ''
        }
        jobTitle={currentReviewApplication?.jobTitle || ''}
        isLoading={aiReviewLoading}
      />

      {/* Interview Scheduling Modal */}
      {applicationForInterview && (
        <InterviewSchedulingModal
          isOpen={showInterviewModal}
          onClose={handleCloseInterviewModal}
          application={applicationForInterview}
          onInterviewScheduled={handleInterviewScheduled}
        />
      )}
    </div>
  );
};

export default EnhancedApplicationReview;
