import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  MapPin,
  Building,
  DollarSign,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  department: string;
  location: string;
  salary: string;
  appliedDate: string;
  status: 'submitted' | 'under_review' | 'technical_test' | 'hr_interview' | 'final_review' | 'accepted' | 'rejected';
  lastUpdate: string;
  nextStep?: string;
  technicalTestScore?: number;
  hrInterviewScore?: number;
  feedback?: string;
  interviewDate?: string;
}

interface MyApplicationsProps {
  className?: string;
}

const MyApplications: React.FC<MyApplicationsProps> = ({ className = '' }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: 'job-1',
        jobTitle: 'Senior Full Stack Developer',
        company: 'Vermeg',
        department: 'Engineering',
        location: 'Tunis, Tunisia',
        salary: '45,000 - 65,000 TND',
        appliedDate: '2024-01-15',
        status: 'technical_test',
        lastUpdate: '2024-01-16',
        nextStep: 'Complete technical assessment by Jan 20',
        technicalTestScore: 85,
        interviewDate: '2024-01-22'
      },
      {
        id: '2',
        jobId: 'job-2',
        jobTitle: 'Product Manager',
        company: 'Vermeg',
        department: 'Product',
        location: 'Tunis, Tunisia',
        salary: '50,000 - 70,000 TND',
        appliedDate: '2024-01-10',
        status: 'hr_interview',
        lastUpdate: '2024-01-14',
        nextStep: 'HR interview scheduled for Jan 18',
        technicalTestScore: 92,
        hrInterviewScore: 88,
        interviewDate: '2024-01-18'
      },
      {
        id: '3',
        jobId: 'job-3',
        jobTitle: 'UX/UI Designer',
        company: 'Vermeg',
        department: 'Design',
        location: 'Tunis, Tunisia',
        salary: '35,000 - 50,000 TND',
        appliedDate: '2024-01-05',
        status: 'accepted',
        lastUpdate: '2024-01-12',
        technicalTestScore: 90,
        hrInterviewScore: 95,
        feedback: 'Excellent portfolio and strong design thinking skills. Welcome to the team!'
      },
      {
        id: '4',
        jobId: 'job-4',
        jobTitle: 'Backend Developer',
        company: 'Vermeg',
        department: 'Engineering',
        location: 'Remote',
        salary: '40,000 - 55,000 TND',
        appliedDate: '2024-01-01',
        status: 'rejected',
        lastUpdate: '2024-01-08',
        feedback: 'Thank you for your interest. While your skills are impressive, we decided to move forward with another candidate.'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'technical_test': return 'Technical Test';
      case 'hr_interview': return 'HR Interview';
      case 'final_review': return 'Final Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <FileText className="w-4 h-4" />;
      case 'under_review': return <Eye className="w-4 h-4" />;
      case 'technical_test': return <AlertCircle className="w-4 h-4" />;
      case 'hr_interview': return <MessageSquare className="w-4 h-4" />;
      case 'final_review': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['accepted', 'rejected'].includes(app.status);
    if (filter === 'completed') return ['accepted', 'rejected'].includes(app.status);
    return true;
  });

  const getProgressPercentage = (status: string) => {
    const statusOrder = ['submitted', 'under_review', 'technical_test', 'hr_interview', 'final_review', 'accepted'];
    const currentIndex = statusOrder.indexOf(status);
    if (status === 'rejected') return 100;
    return ((currentIndex + 1) / statusOrder.length) * 100;
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
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track your job applications and their progress</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Applications</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Applied</p>
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
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(a => !['accepted', 'rejected'].includes(a.status)).length}
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
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                  <Badge className={getStatusColor(application.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {getStatusLabel(application.status)}
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{application.department}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{application.location}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>{application.salary}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Application Progress</span>
                    <span>{Math.round(getProgressPercentage(application.status))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        application.status === 'rejected' ? 'bg-red-500' : 
                        application.status === 'accepted' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${getProgressPercentage(application.status)}%` }}
                    />
                  </div>
                </div>
                
                {/* Scores */}
                {(application.technicalTestScore || application.hrInterviewScore) && (
                  <div className="flex items-center gap-4 text-sm mb-3">
                    {application.technicalTestScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Technical:</span>
                        <Badge className={`${
                          application.technicalTestScore >= 80 ? 'bg-green-100 text-green-800' :
                          application.technicalTestScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.technicalTestScore}%
                        </Badge>
                      </div>
                    )}
                    {application.hrInterviewScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">HR Interview:</span>
                        <Badge className={`${
                          application.hrInterviewScore >= 80 ? 'bg-green-100 text-green-800' :
                          application.hrInterviewScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.hrInterviewScore}%
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Next Step */}
                {application.nextStep && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Next Step</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{application.nextStep}</p>
                  </div>
                )}
                
                {/* Feedback */}
                {application.feedback && (
                  <div className={`p-3 rounded-lg ${
                    application.status === 'accepted' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className={`w-4 h-4 ${
                        application.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                      }`} />
                      <span className={`text-sm font-medium ${
                        application.status === 'accepted' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Feedback
                      </span>
                    </div>
                    <p className={`text-sm ${
                      application.status === 'accepted' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {application.feedback}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedApplication(application)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
              Last updated: {new Date(application.lastUpdate).toLocaleDateString()}
              {application.interviewDate && (
                <span className="ml-4">
                  Interview: {new Date(application.interviewDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all' 
              ? "You haven't applied to any jobs yet." 
              : `No ${filter} applications found.`}
          </p>
          <Button variant="contained" className="bg-red-600 hover:bg-red-700">
            Browse Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
