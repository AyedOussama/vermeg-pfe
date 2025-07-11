import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  Send,
  Pause,
  Play,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search,
  MoreVertical,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { Input } from '@/components/common/Input';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  status: 'draft' | 'pending_hr' | 'hr_completed' | 'pending_approval' | 'approved' | 'published' | 'paused' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  remote: boolean;
  urgent: boolean;
  estimatedHires: number;
  applicationsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
  technicalQuestions: number;
  hrQuestions: number;
  averageApplicationScore?: number;
}

interface JobManagementProps {
  className?: string;
}

const JobManagement: React.FC<JobManagementProps> = ({ className = '' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: ''
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Full Stack Developer',
        department: 'Engineering',
        location: 'Tunis, Tunisia',
        type: 'Full-time',
        salary: '45,000 - 65,000 TND',
        description: 'Join our dynamic engineering team to build cutting-edge fintech solutions.',
        requirements: ['5+ years experience', 'React expertise', 'Node.js proficiency'],
        skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
        status: 'published',
        priority: 'high',
        remote: true,
        urgent: false,
        estimatedHires: 2,
        applicationsCount: 45,
        viewsCount: 234,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
        publishedAt: '2024-01-12',
        technicalQuestions: 8,
        hrQuestions: 5,
        averageApplicationScore: 78.5
      },
      {
        id: '2',
        title: 'Product Manager',
        department: 'Product',
        location: 'Tunis, Tunisia',
        type: 'Full-time',
        salary: '50,000 - 70,000 TND',
        description: 'Lead product strategy and development for our financial software solutions.',
        requirements: ['3+ years PM experience', 'Agile methodology'],
        skills: ['Product Strategy', 'Agile', 'Analytics'],
        status: 'hr_completed',
        priority: 'medium',
        remote: false,
        urgent: false,
        estimatedHires: 1,
        applicationsCount: 23,
        viewsCount: 156,
        createdAt: '2024-01-08',
        updatedAt: '2024-01-14',
        technicalQuestions: 6,
        hrQuestions: 7,
        averageApplicationScore: 82.1
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        salary: '35,000 - 50,000 TND',
        description: 'Create intuitive and beautiful user experiences.',
        requirements: ['Portfolio required', 'Figma proficiency'],
        skills: ['Figma', 'User Research', 'Prototyping'],
        status: 'pending_approval',
        priority: 'medium',
        remote: true,
        urgent: false,
        estimatedHires: 1,
        applicationsCount: 67,
        viewsCount: 289,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-13',
        technicalQuestions: 5,
        hrQuestions: 4,
        averageApplicationScore: 85.3
      },
      {
        id: '4',
        title: 'Backend Developer',
        department: 'Engineering',
        location: 'Tunis, Tunisia',
        type: 'Contract',
        salary: '40,000 - 55,000 TND',
        description: 'Develop robust backend services and APIs.',
        requirements: ['3+ years backend experience', 'Java/Spring Boot'],
        skills: ['Java', 'Spring Boot', 'PostgreSQL'],
        status: 'draft',
        priority: 'urgent',
        remote: false,
        urgent: true,
        estimatedHires: 1,
        applicationsCount: 0,
        viewsCount: 0,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        technicalQuestions: 10,
        hrQuestions: 0
      }
    ];

    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter jobs based on search criteria
  useEffect(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = !filters.search || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(filters.search.toLowerCase()));
      
      const matchesStatus = !filters.status || job.status === filters.status;
      const matchesPriority = !filters.priority || job.priority === filters.priority;
      const matchesType = !filters.type || job.type === filters.type;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_hr': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hr_completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_approval': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_hr': return 'Pending HR';
      case 'hr_completed': return 'HR Complete';
      case 'pending_approval': return 'Pending Approval';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const handleJobAction = (jobId: string, action: string) => {
    console.log(`${action} job:`, jobId);
    // Implement job actions
  };

  const handleBulkAction = (action: string) => {
    console.log(`${action} jobs:`, Array.from(selectedJobs));
    // Implement bulk actions
  };

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(jobId)) {
        newSelected.delete(jobId);
      } else {
        newSelected.add(jobId);
      }
      return newSelected;
    });
  };

  const selectAllJobs = () => {
    if (selectedJobs.size === filteredJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(filteredJobs.map(job => job.id)));
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage your job postings and track their performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="contained"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search jobs..."
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
            <option value="draft">Draft</option>
            <option value="pending_hr">Pending HR</option>
            <option value="hr_completed">HR Complete</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedJobs.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedJobs.size} job{selectedJobs.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('pause')}
                className="flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('publish')}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Publish
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Jobs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.size === filteredJobs.length && filteredJobs.length > 0}
                    onChange={selectAllJobs}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.has(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                    />
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                          <PriorityBadge
                            priority={job.priority as any}
                            size="small"
                            variant="glass"
                          />
                          {job.urgent && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{job.department}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {job.salary}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{job.applicationsCount}</div>
                      <div className="text-gray-500">{job.viewsCount} views</div>
                      {job.averageApplicationScore && (
                        <div className="text-gray-500">
                          Avg: {job.averageApplicationScore.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900">
                        Tech: {job.technicalQuestions} Q
                      </div>
                      <div className="text-gray-500">
                        HR: {job.hrQuestions} Q
                      </div>
                      <div className="text-gray-500">
                        Target: {job.estimatedHires} hire{job.estimatedHires !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleJobAction(job.id, 'view')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleJobAction(job.id, 'edit')}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      
                      {job.status === 'published' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJobAction(job.id, 'pause')}
                          className="flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          Pause
                        </Button>
                      ) : job.status === 'paused' ? (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJobAction(job.id, 'publish')}
                          className="flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleJobAction(job.id, 'publish')}
                          className="flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Publish
                        </Button>
                      )}
                      
                      <div className="relative">
                        <Button
                          variant="outlined"
                          size="small"
                          className="flex items-center gap-1"
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            {filters.search || filters.status || filters.priority || filters.type
              ? 'Try adjusting your filters to find jobs.'
              : 'Get started by creating your first job posting.'}
          </p>
          <Button
            variant="contained"
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </Button>
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
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.status === 'published').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {(jobs.filter(j => j.averageApplicationScore)
                     .reduce((sum, job) => sum + (job.averageApplicationScore || 0), 0) / 
                  jobs.filter(j => j.averageApplicationScore).length || 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobManagement;
