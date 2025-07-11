// Enhanced Public Job Listings Component

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Users, 
  Star,
  Eye,
  ArrowRight,
  Calendar,
  Building
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Job, JobFilter } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

interface EnhancedJobListingsProps {
  className?: string;
  onJobSelect?: (job: Job) => void;
}

const EnhancedJobListings: React.FC<EnhancedJobListingsProps> = ({
  className = '',
  onJobSelect
}) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Partial<JobFilter>>({
    search: '',
    location: '',
    department: '',
    workType: [],
    employmentType: [],
    level: [],
    salaryMin: 0,
    salaryMax: 0,
    currency: 'TND',
    featuredOnly: false,
    urgentOnly: false,
    sortBy: 'newest'
  });

  // Load public jobs
  useEffect(() => {
    loadJobs();
  }, [filters, currentPage]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const result = await mockWorkflowService.getPublicJobs({
        ...filters,
        page: currentPage
      });
      
      setJobs(result.jobs);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  // Update filter
  const updateFilter = (key: keyof JobFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days since posting
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  // Handle job click
  const handleJobClick = (job: Job) => {
    if (onJobSelect) {
      onJobSelect(job);
    } else {
      // Navigate to job details page using React Router
      navigate(`/jobs/${job.id}`);
    }
  };

  // Department options
  const departmentOptions = [
    'All Departments',
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Operations',
    'Human Resources',
    'Finance',
    'Customer Success'
  ];

  // Location options
  const locationOptions = [
    'All Locations',
    'Tunis, Tunisia',
    'Sfax, Tunisia',
    'Sousse, Tunisia',
    'Ariana, Tunisia',
    'Remote',
    'Paris, France',
    'London, UK',
    'Dubai, UAE'
  ];

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
        <p className="text-gray-600 text-lg">
          Discover exciting opportunities and join our growing team
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search jobs by title, skills, or keywords..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-12 text-lg py-3"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <select
                value={filters.department || ''}
                onChange={(e) => updateFilter('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locationOptions.map(loc => (
                  <option key={loc} value={loc === 'All Locations' ? '' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="salary_high">Highest Salary</option>
                <option value="salary_low">Lowest Salary</option>
                <option value="relevance">Most Relevant</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filters.featuredOnly ? 'contained' : 'outlined'}
                size="small"
                onClick={() => updateFilter('featuredOnly', !filters.featuredOnly)}
                className="flex items-center gap-1"
              >
                <Star className="w-4 h-4" />
                Featured
              </Button>
              
              <Button variant="outlined" size="small" className="flex items-center gap-1">
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${totalCount} job${totalCount !== 1 ? 's' : ''} found`}
        </p>
        
        {jobs.some(job => job.featured) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Featured positions available</span>
          </div>
        )}
      </div>

      {/* Job Listings */}
      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or check back later for new opportunities
          </p>
          <Button
            variant="outlined"
            onClick={() => {
              setFilters({
                search: '',
                location: '',
                department: '',
                workType: [],
                employmentType: [],
                level: [],
                salaryMin: 0,
                salaryMax: 0,
                currency: 'TND',
                featuredOnly: false,
                urgentOnly: false,
                sortBy: 'newest'
              });
            }}
          >
            Clear All Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500"
              onClick={() => handleJobClick(job)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        {job.featured && (
                          <Badge variant="warning" size="sm" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </Badge>
                        )}
                        {job.urgent && (
                          <Badge variant="destructive" size="sm">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.employmentType.replace('_', ' ')} • {job.level}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Posted {getDaysAgo(job.publishedAt || job.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {job.displaySalary && (
                        <p className="text-lg font-semibold text-green-600 mb-1">
                          {job.salaryRangeMin.toLocaleString()} - {job.salaryRangeMax.toLocaleString()} {job.currency}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {job.applicationsCount} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {job.viewsCount} views
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-600">
                        {job.minExperience}+ years
                        {job.maxExperience && ` (up to ${job.maxExperience})`}
                      </p>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Work Type:</span>
                      <p className="text-gray-600 capitalize">{job.workType}</p>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Positions:</span>
                      <p className="text-gray-600">{job.numberOfPositions} available</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {skill.name}
                          </Badge>
                        ))}
                        {job.skills.length > 6 && (
                          <Badge variant="outline" size="sm">
                            +{job.skills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Assessment Info */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {job.technicalQuiz && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span>Technical Assessment ({job.technicalQuiz.questions.length} questions)</span>
                      </div>
                    )}
                    {job.hrQuiz && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-orange-500" />
                        <span>HR Assessment ({job.hrQuiz.questions.length} questions)</span>
                      </div>
                    )}
                  </div>

                  {/* Application Deadline */}
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        Application deadline: {formatDate(job.applicationDeadline)}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="contained"
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to application page using React Router
                          navigate(`/apply/${job.id}`);
                        }}
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outlined"
                        size="small"
                        className="flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Job ID: {job.id}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(totalCount / 10)}
          </span>
          
          <Button
            variant="outlined"
            size="small"
            disabled={currentPage >= Math.ceil(totalCount / 10)}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedJobListings;
