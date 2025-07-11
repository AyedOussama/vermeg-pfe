import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff,
  Flag,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  MapPin,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import JobApprovalSystem from './JobApprovalSystem';
import { SAMPLE_JOBS } from '@/data/dummyData';

interface PostedJob {
  id: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  status: 'active' | 'hidden' | 'flagged' | 'expired';
  publishedDate: string;
  applicationsCount: number;
  viewsCount: number;
  projectLeader: {
    name: string;
    email: string;
  };
  description: string;
  employmentType: string;
  level: string;
}

const JobsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'posted'>('approvals');
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    loadPostedJobs();
  }, []);

  const loadPostedJobs = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock posted jobs from published jobs
      const publishedJobs = SAMPLE_JOBS.filter(job => job.status === 'Published' || job.status === 'Active');
      
      const jobs: PostedJob[] = publishedJobs.map((job, index) => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        salary: job.salary,
        status: ['active', 'active', 'active', 'hidden', 'flagged'][index % 5] as any,
        publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationsCount: Math.floor(Math.random() * 50) + 5,
        viewsCount: Math.floor(Math.random() * 500) + 50,
        projectLeader: {
          name: job.projectLeader?.name || 'Unknown',
          email: job.projectLeader?.email || 'unknown@vermeg.com'
        },
        description: job.description,
        employmentType: job.employmentType,
        level: job.level
      }));

      setPostedJobs(jobs);
    } catch (error) {
      console.error('Error loading posted jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async (jobId: string, action: 'hide' | 'flag' | 'delete' | 'activate') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (action === 'delete') {
        setPostedJobs(prev => prev.filter(job => job.id !== jobId));
      } else {
        const newStatus = action === 'hide' ? 'hidden' : 
                         action === 'flag' ? 'flagged' : 
                         action === 'activate' ? 'active' : 'active';
        
        setPostedJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      }

      console.log(`Job ${jobId} ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
    }
  };

  const filteredPostedJobs = postedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.projectLeader.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'hidden': return 'bg-gray-100 text-gray-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'hidden': return <EyeOff className="w-4 h-4" />;
      case 'flagged': return <Flag className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600">
            Manage job approvals and published job listings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outlined" onClick={loadPostedJobs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outlined">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'approvals'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Job Approvals
          </button>
          <button
            onClick={() => setActiveTab('posted')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'posted'
                ? 'bg-purple-100 text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            Posted Jobs ({postedJobs.length})
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'approvals' ? (
        <JobApprovalSystem />
      ) : (
        <div className="space-y-6">
          {/* Filters for Posted Jobs */}
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                  <option value="flagged">Flagged</option>
                  <option value="expired">Expired</option>
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

          {/* Posted Jobs List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPostedJobs.length === 0 ? (
                <Card className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Posted Jobs Found</h3>
                  <p className="text-gray-600">
                    {searchTerm || filterStatus !== 'all' || filterDepartment !== 'all'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'No jobs have been published yet.'}
                  </p>
                </Card>
              ) : (
                filteredPostedJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                                <DollarSign className="w-4 h-4" />
                                {job.salary}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(job.status)} size="sm">
                              {getStatusIcon(job.status)}
                              <span className="ml-1 capitalize">{job.status}</span>
                            </Badge>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-gray-700">Published</div>
                            <div className="text-gray-900">{formatTimeAgo(job.publishedDate)}</div>
                            <div className="text-xs text-gray-600">{formatDate(job.publishedDate)}</div>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-blue-700">Applications</div>
                            <div className="text-xl font-bold text-blue-900">{job.applicationsCount}</div>
                            <div className="text-xs text-blue-600">Total received</div>
                          </div>

                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-green-700">Views</div>
                            <div className="text-xl font-bold text-green-900">{job.viewsCount}</div>
                            <div className="text-xs text-green-600">Page views</div>
                          </div>

                          <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-purple-700">Project Leader</div>
                            <div className="text-purple-900 font-medium">{job.projectLeader.name}</div>
                            <div className="text-xs text-purple-600">{job.projectLeader.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {job.employmentType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.level}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outlined"
                              size="small"
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Button>

                            {job.status === 'active' && (
                              <>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleJobAction(job.id, 'hide')}
                                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                                >
                                  <EyeOff className="w-4 h-4" />
                                  Hide
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleJobAction(job.id, 'flag')}
                                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                                >
                                  <Flag className="w-4 h-4" />
                                  Flag
                                </Button>
                              </>
                            )}

                            {job.status === 'hidden' && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleJobAction(job.id, 'activate')}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <Eye className="w-4 h-4" />
                                Activate
                              </Button>
                            )}

                            {job.status === 'flagged' && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleJobAction(job.id, 'activate')}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Resolve
                              </Button>
                            )}

                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleJobAction(job.id, 'delete')}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsManagement;
