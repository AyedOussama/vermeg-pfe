import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Star,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import JobCard from '@/components/jobs/JobCard';
import { Job } from '@/types/job';

interface JobSearchFilters {
  keyword: string;
  location: string;
  department: string;
  type: string;
  salaryMin: string;
  salaryMax: string;
  experience: string;
  remote: boolean;
  featured: boolean;
}

interface JobSearchProps {
  className?: string;
}

const JobSearch: React.FC<JobSearchProps> = ({ className = '' }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'salary'>('relevance');
  
  const [filters, setFilters] = useState<JobSearchFilters>({
    keyword: '',
    location: '',
    department: '',
    type: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    remote: false,
    featured: false
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
        description: 'Join our dynamic engineering team to build cutting-edge fintech solutions using React, Node.js, and cloud technologies.',
        skills: [
          { name: 'React', isRequired: true },
          { name: 'Node.js', isRequired: true },
          { name: 'TypeScript', isRequired: false },
          { name: 'AWS', isRequired: false }
        ],
        posted: '2 days ago',
        featured: true,
        remote: true,
        urgent: false,
        minExperience: 5,
        employmentType: 'Full-time'
      },
      {
        id: '2',
        title: 'Product Manager',
        department: 'Product',
        location: 'Tunis, Tunisia',
        type: 'Full-time',
        salary: '50,000 - 70,000 TND',
        description: 'Lead product strategy and development for our financial software solutions.',
        skills: [
          { name: 'Product Strategy', isRequired: true },
          { name: 'Agile', isRequired: true },
          { name: 'Analytics', isRequired: false }
        ],
        posted: '1 week ago',
        featured: false,
        remote: false,
        urgent: false,
        minExperience: 3,
        employmentType: 'Full-time'
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        department: 'Design',
        location: 'Remote',
        type: 'Full-time',
        salary: '35,000 - 50,000 TND',
        description: 'Create intuitive and beautiful user experiences for our financial applications.',
        skills: [
          { name: 'Figma', isRequired: true },
          { name: 'User Research', isRequired: true },
          { name: 'Prototyping', isRequired: false }
        ],
        posted: '3 days ago',
        featured: true,
        remote: true,
        urgent: false,
        minExperience: 2,
        employmentType: 'Full-time'
      },
      {
        id: '4',
        title: 'Backend Developer',
        department: 'Engineering',
        location: 'Tunis, Tunisia',
        type: 'Contract',
        salary: '40,000 - 55,000 TND',
        description: 'Develop robust backend services and APIs for our financial platform.',
        skills: [
          { name: 'Java', isRequired: true },
          { name: 'Spring Boot', isRequired: true },
          { name: 'PostgreSQL', isRequired: false }
        ],
        posted: '5 days ago',
        featured: false,
        remote: false,
        urgent: true,
        minExperience: 3,
        employmentType: 'Contract'
      },
      {
        id: '5',
        title: 'DevOps Engineer',
        department: 'Engineering',
        location: 'Hybrid',
        type: 'Full-time',
        salary: '48,000 - 68,000 TND',
        description: 'Manage cloud infrastructure and deployment pipelines for our applications.',
        skills: [
          { name: 'Docker', isRequired: true },
          { name: 'Kubernetes', isRequired: true },
          { name: 'AWS', isRequired: false }
        ],
        posted: '1 day ago',
        featured: false,
        remote: true,
        urgent: false,
        minExperience: 4,
        employmentType: 'Full-time'
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
      const matchesKeyword = !filters.keyword || 
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.skills.some(skill => skill.name.toLowerCase().includes(filters.keyword.toLowerCase()));
      
      const matchesLocation = !filters.location || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesDepartment = !filters.department || job.department === filters.department;
      const matchesType = !filters.type || job.type === filters.type;
      const matchesRemote = !filters.remote || job.remote;
      const matchesFeatured = !filters.featured || job.featured;
      
      const matchesExperience = !filters.experience || 
        (job.minExperience && job.minExperience <= parseInt(filters.experience));

      return matchesKeyword && matchesLocation && matchesDepartment && 
             matchesType && matchesRemote && matchesFeatured && matchesExperience;
    });

    // Sort jobs
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime());
    } else if (sortBy === 'salary') {
      filtered.sort((a, b) => {
        const aSalary = parseInt(a.salary.split(' - ')[1].replace(/[^\d]/g, ''));
        const bSalary = parseInt(b.salary.split(' - ')[1].replace(/[^\d]/g, ''));
        return bSalary - aSalary;
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, filters, sortBy]);

  const handleFilterChange = (key: keyof JobSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      department: '',
      type: '',
      salaryMin: '',
      salaryMax: '',
      experience: '',
      remote: false,
      featured: false
    });
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
      } else {
        newSaved.add(jobId);
      }
      return newSaved;
    });
  };

  const handleJobSelect = (job: Job) => {
    console.log('Selected job:', job);
    // Navigate to job details
  };

  const handleJobApply = (job: Job) => {
    console.log('Apply to job:', job);
    // Navigate to application form
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
      {/* Search Header */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-12 md:w-64"
              />
            </div>
            <Button
              variant="contained"
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('remote', !filters.remote)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.remote
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Remote
              </button>
              <button
                onClick={() => handleFilterChange('featured', !filters.featured)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.featured
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Featured
              </button>
            </div>

            {(filters.keyword || filters.location || filters.department || filters.type || filters.remote || filters.featured) && (
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Any Experience</option>
                <option value="0">Entry Level (0-1 years)</option>
                <option value="2">Mid Level (2-4 years)</option>
                <option value="5">Senior Level (5+ years)</option>
                <option value="8">Lead Level (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredJobs.length} Jobs Found
          </h2>
          <p className="text-gray-600">
            {filters.keyword && `Results for "${filters.keyword}"`}
            {filters.location && ` in ${filters.location}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Results */}
      {filteredJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button
            variant="outlined"
            onClick={clearFilters}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job, index) => (
            <div key={job.id} className="relative">
              <JobCard
                job={job}
                onSelect={handleJobSelect}
                onApply={handleJobApply}
                index={index}
              />
              
              {/* Save Job Button */}
              <button
                onClick={() => toggleSaveJob(job.id)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                {savedJobs.has(job.id) ? (
                  <BookmarkCheck className="w-5 h-5 text-red-600" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400 hover:text-red-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredJobs.length > 0 && (
        <div className="text-center">
          <Button
            variant="outlined"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Load More Jobs
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
