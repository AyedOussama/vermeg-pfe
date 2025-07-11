// Enhanced My Jobs Component with Workflow Status

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Job, JobStatus, JobFilter } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

interface EnhancedMyJobsProps {
  className?: string;
}

const EnhancedMyJobs: React.FC<EnhancedMyJobsProps> = ({ className = '' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'status'>('newest');

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const filters: Partial<JobFilter> = {
        search: searchTerm || undefined,
        sortBy: sortBy === 'newest' ? 'newest' : sortBy === 'oldest' ? 'oldest' : 'relevance'
      };
      
      const jobsData = await mockWorkflowService.getMyJobs(filters);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Get status badge variant and icon
  const getStatusInfo = (status: JobStatus) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary' as const, icon: Edit, text: 'Draft' };
      case 'pending_hr_enhancement':
        return { variant: 'warning' as const, icon: Clock, text: 'Pending HR Enhancement' };
      case 'hr_enhancement_complete':
        return { variant: 'info' as const, icon: CheckCircle, text: 'HR Enhancement Complete' };
      case 'pending_ceo_approval':
        return { variant: 'warning' as const, icon: Clock, text: 'Pending CEO Approval' };
      case 'approved':
        return { variant: 'success' as const, icon: CheckCircle, text: 'Approved' };
      case 'published':
        return { variant: 'success' as const, icon: CheckCircle, text: 'Published' };
      case 'paused':
        return { variant: 'warning' as const, icon: AlertCircle, text: 'Paused' };
      case 'closed':
        return { variant: 'secondary' as const, icon: XCircle, text: 'Closed' };
      case 'rejected':
        return { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' };
      case 'archived':
        return { variant: 'secondary' as const, icon: XCircle, text: 'Archived' };
      default:
        return { variant: 'secondary' as const, icon: AlertCircle, text: status };
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

  // Get workflow progress percentage
  const getWorkflowProgress = (status: JobStatus) => {
    const progressMap: Record<JobStatus, number> = {
      'draft': 10,
      'pending_hr_enhancement': 25,
      'hr_enhancement_complete': 50,
      'pending_ceo_approval': 75,
      'approved': 90,
      'published': 100,
      'paused': 75,
      'closed': 100,
      'rejected': 0,
      'archived': 100
    };
    return progressMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600">Manage your job postings and track their progress through the workflow</p>
        </div>
        
        <Button
          variant="contained"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          onClick={() => window.location.href = '/project-leader/create-job'}
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_hr_enhancement">Pending HR Enhancement</option>
              <option value="hr_enhancement_complete">HR Enhancement Complete</option>
              <option value="pending_ceo_approval">Pending CEO Approval</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No jobs found' : 'No jobs created yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first job posting to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="contained"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => window.location.href = '/project-leader/create-job'}
            >
              Create Your First Job
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const StatusIcon = statusInfo.icon;
            const progress = getWorkflowProgress(job.status);
            
            return (
              <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
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
                            <Calendar className="w-4 h-4" />
                            Created {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.text}
                        </Badge>
                        
                        <Button variant="ghost" size="small">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {job.displaySalary 
                            ? `${job.salaryRangeMin.toLocaleString()} - ${job.salaryRangeMax.toLocaleString()} ${job.currency}`
                            : 'Salary not disclosed'
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{job.applicationsCount} applications</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{job.viewsCount} views</span>
                      </div>
                    </div>

                    {/* Workflow Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Workflow Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            job.status === 'rejected' ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Job Tags */}
                    {job.tags && job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button variant="outlined" size="small" className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View Details
                      </Button>
                      
                      {(job.status === 'draft' || job.status === 'rejected') && (
                        <Button variant="outlined" size="small" className="flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      )}
                      
                      {job.status === 'published' && (
                        <Button variant="outlined" size="small" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          View Applications
                        </Button>
                      )}
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

export default EnhancedMyJobs;
