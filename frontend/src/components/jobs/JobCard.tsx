import React from 'react';
import {
  Building, MapPin, Briefcase, DollarSign, Clock8,
  CheckCircle2, Globe, Clock, ExternalLink, Star, Eye
} from 'lucide-react';
import { Job } from '@/types/job';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
  onApply?: (job: Job) => void;
  index: number;
}

const JobCard: React.FC<JobCardProps> = ({ job, onSelect, onApply, index }) => {
  const formatSalary = (salary: string) => {
    // Extract numbers from salary string and format them
    const numbers = salary.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return `${numbers[0]},000 - ${numbers[1]},000 TND`;
    }
    return salary;
  };

  const getTimeAgo = (posted: string) => {
    // Simple time ago calculation
    if (posted.includes('day')) return posted;
    return posted;
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-red-200 border border-gray-200 overflow-hidden group animate-fade-in relative"
      style={{animationDelay: `${index * 100}ms`}}
    >
      <div className="p-6">
        {/* Header with title and badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors cursor-pointer">
                {job.title}
              </h3>
              {job.featured && (
                <Badge
                  variant="secondary"
                  className="bg-red-50 text-red-600 border-red-200 flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </Badge>
              )}
              {job.remote && (
                <Badge
                  variant="primary"
                  className="bg-blue-50 text-blue-600 border-blue-200"
                >
                  Remote
                </Badge>
              )}
            </div>

            {/* Department */}
            <div className="flex items-center text-gray-600 mb-3">
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">{job.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location, Type, and Salary */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{job.type || job.employmentType || 'Full-time'}</span>
          </div>
          <div className="flex items-center text-green-600 font-medium">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>{formatSalary(job.salary)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium hover:bg-gray-200 transition-colors"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{getTimeAgo(job.posted)}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outlined"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(job);
              }}
              className="text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>

            {onApply && (
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(job);
                }}
                className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;