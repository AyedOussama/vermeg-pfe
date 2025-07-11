import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  Eye, 
  Star,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
  FileText,
  Award,
  TrendingUp,
  Filter,
  Search,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bookmark,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';

interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    profilePicture?: string;
    summary: string;
    experience: number;
    education: string;
    skills: string[];
    portfolio?: string;
  };
  status: 'submitted' | 'under_review' | 'technical_test' | 'hr_interview' | 'final_review' | 'accepted' | 'rejected';
  appliedDate: string;
  lastUpdate: string;
  technicalScore?: number;
  hrScore?: number;
  overallScore?: number;
  coverLetter?: string;
  documents: ApplicationDocument[];
  assessments: Assessment[];
  interviews: Interview[];
  feedback?: string;
  rating?: number;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface ApplicationDocument {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate';
  url: string;
  uploadedAt: string;
}

interface Assessment {
  id: string;
  type: 'technical' | 'hr';
  status: 'pending' | 'completed';
  score?: number;
  completedAt?: string;
}

interface Interview {
  id: string;
  type: 'technical' | 'hr' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledAt?: string;
  completedAt?: string;
  interviewer: string;
  feedback?: string;
  rating?: number;
}

interface ApplicationReviewProps {
  className?: string;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({ className = '' }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    jobId: '',
    priority: '',
    rating: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: '1',
        candidateId: 'cand-1',
        jobId: 'job-1',
        jobTitle: 'Senior Full Stack Developer',
        candidate: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+216 12 345 678',
          location: 'Tunis, Tunisia',
          summary: 'Experienced Full Stack Developer with 5+ years in React and Node.js',
          experience: 5,
          education: 'Master in Computer Science',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
          portfolio: 'https://johndoe.dev'
        },
        status: 'technical_test',
        appliedDate: '2024-01-10',
        lastUpdate: '2024-01-15',
        technicalScore: 85,
        overallScore: 82,
        priority: 'high',
        rating: 4,
        tags: ['experienced', 'full-stack'],
        documents: [
          {
            id: '1',
            name: 'John_Doe_Resume.pdf',
            type: 'resume',
            url: '/documents/resume1.pdf',
            uploadedAt: '2024-01-10'
          }
        ],
        assessments: [
          {
            id: '1',
            type: 'technical',
            status: 'completed',
            score: 85,
            completedAt: '2024-01-12'
          }
        ],
        interviews: [],
        coverLetter: 'I am excited to apply for the Senior Full Stack Developer position...'
      },
      {
        id: '2',
        candidateId: 'cand-2',
        jobId: 'job-1',
        jobTitle: 'Senior Full Stack Developer',
        candidate: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+216 98 765 432',
          location: 'Sfax, Tunisia',
          summary: 'Frontend specialist with strong React expertise and design background',
          experience: 3,
          education: 'Bachelor in Computer Science',
          skills: ['React', 'Vue.js', 'CSS', 'Figma', 'JavaScript']
        },
        status: 'hr_interview',
        appliedDate: '2024-01-08',
        lastUpdate: '2024-01-14',
        technicalScore: 78,
        hrScore: 88,
        overallScore: 83,
        priority: 'medium',
        rating: 4,
        tags: ['frontend', 'design'],
        documents: [
          {
            id: '2',
            name: 'Jane_Smith_Resume.pdf',
            type: 'resume',
            url: '/documents/resume2.pdf',
            uploadedAt: '2024-01-08'
          }
        ],
        assessments: [
          {
            id: '2',
            type: 'technical',
            status: 'completed',
            score: 78,
            completedAt: '2024-01-10'
          },
          {
            id: '3',
            type: 'hr',
            status: 'completed',
            score: 88,
            completedAt: '2024-01-13'
          }
        ],
        interviews: [
          {
            id: '1',
            type: 'hr',
            status: 'scheduled',
            scheduledAt: '2024-01-18',
            interviewer: 'Sarah Johnson'
          }
        ]
      },
      {
        id: '3',
        candidateId: 'cand-3',
        jobId: 'job-2',
        jobTitle: 'Product Manager',
        candidate: {
          firstName: 'Ahmed',
          lastName: 'Ben Ali',
          email: 'ahmed.benali@email.com',
          phone: '+216 55 123 456',
          location: 'Sousse, Tunisia',
          summary: 'Product Manager with strong analytical skills and agile experience',
          experience: 4,
          education: 'MBA in Business Administration',
          skills: ['Product Strategy', 'Agile', 'Analytics', 'Stakeholder Management']
        },
        status: 'final_review',
        appliedDate: '2024-01-05',
        lastUpdate: '2024-01-16',
        technicalScore: 88,
        hrScore: 85,
        overallScore: 86,
        priority: 'high',
        rating: 5,
        tags: ['product', 'leadership'],
        documents: [
          {
            id: '3',
            name: 'Ahmed_BenAli_Resume.pdf',
            type: 'resume',
            url: '/documents/resume3.pdf',
            uploadedAt: '2024-01-05'
          }
        ],
        assessments: [
          {
            id: '4',
            type: 'technical',
            status: 'completed',
            score: 88,
            completedAt: '2024-01-08'
          },
          {
            id: '5',
            type: 'hr',
            status: 'completed',
            score: 85,
            completedAt: '2024-01-12'
          }
        ],
        interviews: [
          {
            id: '2',
            type: 'technical',
            status: 'completed',
            completedAt: '2024-01-10',
            interviewer: 'Mike Johnson',
            rating: 4,
            feedback: 'Strong technical knowledge and good communication skills'
          },
          {
            id: '3',
            type: 'hr',
            status: 'completed',
            completedAt: '2024-01-14',
            interviewer: 'Sarah Johnson',
            rating: 5,
            feedback: 'Excellent cultural fit and leadership potential'
          }
        ],
        feedback: 'Excellent candidate with strong leadership potential and technical skills'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setFilteredApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter applications based on search criteria
  useEffect(() => {
    let filtered = applications.filter(app => {
      const matchesSearch = !filters.search || 
        app.candidate.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.candidate.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || app.status === filters.status;
      const matchesJob = !filters.jobId || app.jobId === filters.jobId;
      const matchesPriority = !filters.priority || app.priority === filters.priority;
      const matchesRating = !filters.rating || (app.rating && app.rating >= parseInt(filters.rating));

      return matchesSearch && matchesStatus && matchesJob && matchesPriority && matchesRating;
    });

    setFilteredApplications(filtered);
  }, [applications, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'technical_test': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hr_interview': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'final_review': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleApplicationAction = (applicationId: string, action: string) => {
    console.log(`${action} application:`, applicationId);
    // Implement application actions
  };

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search applications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="technical_test">Technical Test</option>
            <option value="hr_interview">HR Interview</option>
            <option value="final_review">Final Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={filters.jobId}
            onChange={(e) => setFilters(prev => ({ ...prev, jobId: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Jobs</option>
            <option value="job-1">Senior Full Stack Developer</option>
            <option value="job-2">Product Manager</option>
            <option value="job-3">UX/UI Designer</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
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
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.candidate.firstName} {application.candidate.lastName}
                    </h3>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(application.priority)}>
                      {application.priority}
                    </Badge>
                    {application.rating && renderStars(application.rating)}
                  </div>
                  
                  <p className="text-gray-600 mb-2">{application.jobTitle}</p>
                  <p className="text-gray-600 mb-3">{application.candidate.summary}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {application.candidate.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {application.candidate.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {application.candidate.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {application.candidate.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {application.candidate.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{application.candidate.skills.length - 5} more
                      </span>
                    )}
                  </div>
                  
                  {/* Scores */}
                  <div className="flex items-center gap-6 text-sm">
                    {application.technicalScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Technical:</span>
                        <Badge className={`${
                          application.technicalScore >= 80 ? 'bg-green-100 text-green-800' :
                          application.technicalScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.technicalScore}%
                        </Badge>
                      </div>
                    )}
                    {application.hrScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">HR:</span>
                        <Badge className={`${
                          application.hrScore >= 80 ? 'bg-green-100 text-green-800' :
                          application.hrScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.hrScore}%
                        </Badge>
                      </div>
                    )}
                    {application.overallScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Overall:</span>
                        <Badge className={`${
                          application.overallScore >= 80 ? 'bg-green-100 text-green-800' :
                          application.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.overallScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleApplicationSelect(application)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleApplicationAction(application.id, 'accept')}
                  className="text-green-600 border-green-600 hover:bg-green-50 flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Accept
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleApplicationAction(application.id, 'reject')}
                  className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {filters.search || filters.status || filters.jobId || filters.priority || filters.rating
              ? 'Try adjusting your filters to find applications.'
              : 'Applications will appear here once candidates start applying to your jobs.'}
          </p>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(a => ['submitted', 'under_review', 'technical_test', 'hr_interview', 'final_review'].includes(a.status)).length}
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
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === 'accepted').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {(applications.filter(a => a.overallScore)
                     .reduce((sum, app) => sum + (app.overallScore || 0), 0) / 
                  applications.filter(a => a.overallScore).length || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationReview;
