import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Download, 
  Star,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  FileText,
  Send
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';

interface Candidate {
  id: string;
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
  applications: Application[];
  rating?: number;
  notes?: string;
  status: 'active' | 'hired' | 'rejected' | 'on_hold';
  lastActive: string;
  joinedDate: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under_review' | 'technical_test' | 'hr_interview' | 'final_review' | 'accepted' | 'rejected';
  appliedDate: string;
  technicalScore?: number;
  hrScore?: number;
  interviewDate?: string;
  feedback?: string;
}

interface CandidateManagementProps {
  className?: string;
}

const CandidateManagement: React.FC<CandidateManagementProps> = ({ className = '' }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: '',
    experience: '',
    rating: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockCandidates: Candidate[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+216 12 345 678',
        location: 'Tunis, Tunisia',
        summary: 'Experienced Full Stack Developer with 5+ years in React and Node.js',
        experience: 5,
        education: 'Master in Computer Science',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        rating: 4.5,
        status: 'active',
        lastActive: '2024-01-15',
        joinedDate: '2024-01-10',
        applications: [
          {
            id: '1',
            jobId: 'job-1',
            jobTitle: 'Senior Full Stack Developer',
            department: 'Engineering',
            status: 'hr_interview',
            appliedDate: '2024-01-10',
            technicalScore: 85,
            hrScore: 78,
            interviewDate: '2024-01-18'
          }
        ]
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@email.com',
        phone: '+216 98 765 432',
        location: 'Sfax, Tunisia',
        summary: 'Creative UX/UI Designer with expertise in user research and prototyping',
        experience: 3,
        education: 'Bachelor in Design',
        skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
        rating: 4.8,
        status: 'active',
        lastActive: '2024-01-14',
        joinedDate: '2024-01-08',
        applications: [
          {
            id: '2',
            jobId: 'job-2',
            jobTitle: 'UX/UI Designer',
            department: 'Design',
            status: 'technical_test',
            appliedDate: '2024-01-08',
            technicalScore: 92
          }
        ]
      },
      {
        id: '3',
        firstName: 'Ahmed',
        lastName: 'Ben Ali',
        email: 'ahmed.benali@email.com',
        phone: '+216 55 123 456',
        location: 'Sousse, Tunisia',
        summary: 'Product Manager with strong analytical skills and agile experience',
        experience: 4,
        education: 'MBA in Business Administration',
        skills: ['Product Strategy', 'Agile', 'Analytics', 'Stakeholder Management'],
        rating: 4.2,
        status: 'hired',
        lastActive: '2024-01-12',
        joinedDate: '2024-01-05',
        applications: [
          {
            id: '3',
            jobId: 'job-3',
            jobTitle: 'Product Manager',
            department: 'Product',
            status: 'accepted',
            appliedDate: '2024-01-05',
            technicalScore: 88,
            hrScore: 85,
            feedback: 'Excellent candidate with strong leadership potential'
          }
        ]
      }
    ];

    setTimeout(() => {
      setCandidates(mockCandidates);
      setFilteredCandidates(mockCandidates);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter candidates based on search criteria
  useEffect(() => {
    let filtered = candidates.filter(candidate => {
      const matchesSearch = !filters.search || 
        candidate.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = !filters.status || candidate.status === filters.status;
      
      const matchesDepartment = !filters.department || 
        candidate.applications.some(app => app.department === filters.department);
      
      const matchesExperience = !filters.experience || 
        candidate.experience >= parseInt(filters.experience);
      
      const matchesRating = !filters.rating || 
        (candidate.rating && candidate.rating >= parseFloat(filters.rating));

      return matchesSearch && matchesStatus && matchesDepartment && matchesExperience && matchesRating;
    });

    setFilteredCandidates(filtered);
  }, [candidates, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'hired': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApplicationStatusColor = (status: string) => {
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
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleScheduleInterview = (candidateId: string, applicationId: string) => {
    console.log('Schedule interview for candidate:', candidateId, 'application:', applicationId);
    // Navigate to interview scheduling
  };

  const handleSendMessage = (candidateId: string) => {
    console.log('Send message to candidate:', candidateId);
    // Open messaging interface
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
          <h1 className="text-2xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Review and manage candidate profiles and applications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search candidates..."
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
            <option value="active">Active</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="on_hold">On Hold</option>
          </select>
          
          <select
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
          
          <select
            value={filters.experience}
            onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Any Experience</option>
            <option value="0">Entry Level (0-1 years)</option>
            <option value="2">Mid Level (2-4 years)</option>
            <option value="5">Senior Level (5+ years)</option>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Hired</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter(c => c.status === 'hired').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Process</p>
              <p className="text-2xl font-bold text-gray-900">
                {candidates.filter(c => c.applications.some(app => 
                  ['under_review', 'technical_test', 'hr_interview', 'final_review'].includes(app.status)
                )).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {candidate.profilePicture ? (
                    <img 
                      src={candidate.profilePicture} 
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
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status.replace('_', ' ')}
                    </Badge>
                    {candidate.rating && renderStars(candidate.rating)}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{candidate.summary}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {candidate.phone}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {candidate.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {candidate.experience} years exp.
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {candidate.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{candidate.skills.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  {/* Applications */}
                  <div className="space-y-2">
                    {candidate.applications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{application.jobTitle}</span>
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {application.status.replace('_', ' ')}
                          </Badge>
                          {application.technicalScore && (
                            <span className="text-sm text-gray-600">
                              Tech: {application.technicalScore}%
                            </span>
                          )}
                          {application.hrScore && (
                            <span className="text-sm text-gray-600">
                              HR: {application.hrScore}%
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {application.status === 'hr_interview' && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleScheduleInterview(candidate.id, application.id)}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Schedule
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleCandidateSelect(candidate)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleSendMessage(candidate.id)}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find candidates.
          </p>
        </Card>
      )}
    </div>
  );
};

export default CandidateManagement;
