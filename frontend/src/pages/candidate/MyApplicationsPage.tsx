import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Eye, FileText, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Select } from '@/components/common/Select';
import { SAMPLE_APPLICATIONS, SAMPLE_JOBS, getUserById, getJobById } from '@/data/dummyData';
import { useAuth } from '@/context/AuthContext';

const MyApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Get user's applications
  const userApplications = useMemo(() => {
    if (!user) return [];
    return SAMPLE_APPLICATIONS.filter(app => app.candidateId === user.id);
  }, [user]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    let filtered = userApplications;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase().replace(' ', '_') === statusFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'job':
          const jobA = getJobById(a.jobId);
          const jobB = getJobById(b.jobId);
          return (jobA?.title || '').localeCompare(jobB?.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [userApplications, statusFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <Clock className="w-4 h-4" />;
      case 'Technical Review':
      case 'HR Review':
      case 'Under Review':
        return <Eye className="w-4 h-4" />;
      case 'Interview Scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'secondary';
      case 'Technical Review':
      case 'HR Review':
      case 'Under Review':
        return 'warning';
      case 'Interview Scheduled':
        return 'info';
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'technical_review', label: 'Technical Review' },
    { value: 'hr_review', label: 'HR Review' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date Applied' },
    { value: 'status', label: 'Status' },
    { value: 'job', label: 'Job Title' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track the progress of your job applications</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{userApplications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {userApplications.filter(app => 
                  ['Technical Review', 'HR Review', 'Under Review', 'Interview Scheduled'].includes(app.status)
                ).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-gray-900">
                {userApplications.filter(app => app.interviewScheduled).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {userApplications.length > 0 
                  ? Math.round((userApplications.filter(app => app.status === 'Accepted').length / userApplications.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            <Select
              label="Filter by Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48"
            />
            <Select
              label="Sort by"
              options={sortOptions}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outlined" size="small">
              Export
            </Button>
            <Button size="small">
              Apply to New Job
            </Button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => {
            const job = getJobById(application.jobId);
            if (!job) return null;

            return (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {job.department} • {job.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Applied: {formatDate(application.submitDate)}</span>
                      <span>Updated: {formatDate(application.lastUpdated)}</span>
                      {application.interviewDate && (
                        <span className="text-green-600 font-medium">
                          Interview: {formatDate(application.interviewDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={getStatusColor(application.status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(application.status)}
                      {application.status}
                    </Badge>
                  </div>
                </div>

                {/* Scores */}
                {(application.technicalScore || application.hrScore) && (
                  <div className="flex gap-6 mb-4">
                    {application.technicalScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Technical Score:</span>
                        <Badge variant={application.technicalScore >= 80 ? 'success' : application.technicalScore >= 60 ? 'warning' : 'error'}>
                          {application.technicalScore}/100
                        </Badge>
                      </div>
                    )}
                    {application.hrScore && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">HR Score:</span>
                        <Badge variant={application.hrScore >= 80 ? 'success' : application.hrScore >= 60 ? 'warning' : 'error'}>
                          {application.hrScore}/100
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {application.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Feedback:</p>
                        <p className="text-sm text-gray-600">{application.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    {application.status === 'Interview Scheduled' && (
                      <Button size="small" className="bg-green-600 hover:bg-green-700">
                        Join Interview
                      </Button>
                    )}
                    {application.documents.length > 0 && (
                      <Button variant="outlined" size="small">
                        View Documents ({application.documents.length})
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Application ID: {application.id}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? "You haven't applied to any jobs yet" 
                : `No applications with status: ${statusOptions.find(opt => opt.value === statusFilter)?.label}`
              }
            </p>
            <Button>
              Browse Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;
