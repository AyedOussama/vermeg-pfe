import React from 'react';
import { Building, MapPin, Clock, DollarSign, ExternalLink, Star, Briefcase } from 'lucide-react';
// import { cn } from '@/utils/cn';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  salary?: string;
  posted: string;
  description: string;
  tags: string[];
  featured?: boolean;
  remote?: boolean;
  urgent?: boolean;
}

interface JobsListProps {
  jobs?: Job[];
  onJobClick?: (job: Job) => void;
  onViewAll?: () => void;
  className?: string;
  showFeaturedOnly?: boolean;
  limit?: number;
}

// Default jobs data
const defaultJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    salary: '45,000 - 65,000 TND',
    posted: '2 days ago',
    description: 'Join our dynamic engineering team to build cutting-edge fintech solutions using React, Node.js, and cloud technologies.',
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    featured: true,
    remote: true
  },
  {
    id: '2',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    salary: '40,000 - 55,000 TND',
    posted: '1 week ago',
    description: 'Help us scale our infrastructure and implement best practices for CI/CD, monitoring, and cloud deployment.',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    featured: true
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    salary: '35,000 - 50,000 TND',
    posted: '3 days ago',
    description: 'Create intuitive and beautiful user experiences for our financial software products.',
    tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    remote: true
  },
  {
    id: '4',
    title: 'Data Scientist',
    department: 'Analytics',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    salary: '50,000 - 70,000 TND',
    posted: '5 days ago',
    description: 'Analyze complex financial data and build machine learning models to drive business insights.',
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
    urgent: true
  }
];

export const JobsList: React.FC<JobsListProps> = ({
  jobs = defaultJobs,
  onJobClick,
  onViewAll,
  className,
  showFeaturedOnly = false,
  limit = 4
}) => {
  const filteredJobs = showFeaturedOnly ? jobs.filter(job => job.featured) : jobs;
  const displayJobs = limit ? filteredJobs.slice(0, limit) : filteredJobs;

  return (
    <section className={`py-16 bg-white ${className || ''}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-6">
            <Briefcase className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {showFeaturedOnly ? 'Featured Opportunities' : 'Career Opportunities'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover exciting career opportunities and join our innovative team
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayJobs.map((job, index) => (
            <div
              key={job.id}
              className="group bg-white border border-gray-200 rounded-xl hover:border-red-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => onJobClick?.(job)}
            >
              {/* Job Card Content */}
              <div className="p-6">
                {/* Header with Title and Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{job.department}</span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 ml-4">
                    {job.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </span>
                    )}
                    {job.remote && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Remote
                      </span>
                    )}
                    {job.urgent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{job.location}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{job.type}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium text-green-600">{job.salary}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md font-medium border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                  {job.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md font-medium border border-gray-200">
                      +{job.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{job.posted}</span>
                  <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        {onViewAll && (
          <div className="text-center mt-10">
            <button
              onClick={onViewAll}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              View All Positions
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {/* Empty State */}
        {displayJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No positions available
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
