import React from 'react';
import { Search, Sliders } from 'lucide-react';
import { Button } from '@/components/common/Button';

interface JobFiltersProps {
  formData: {
    search: string;
    location: string;
    department: string;
    position: string;
  };
  onInputChange: (e: { target: { name: string; value: string } }) => void;
  onFilter: () => void;
  onReset: () => void;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  errors: Record<string, string>;
  locations: string[];
  departments: string[];
  positionLevels: string[];
  employmentTypes: string[];
  experienceMin: number;
  setExperienceMin: (value: number) => void;
  selectedEmploymentTypes: string[];
  toggleEmploymentType: (type: string) => void;
  featuredOnly: boolean;
  setFeaturedOnly: (value: boolean) => void;
  remoteOnly: boolean;
  setRemoteOnly: (value: boolean) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  formData,
  onInputChange,
  onFilter,
  onReset,
  filterOpen,
  setFilterOpen,
  errors,
  locations,
  departments,
  positionLevels,
  employmentTypes,
  experienceMin,
  setExperienceMin,
  selectedEmploymentTypes,
  toggleEmploymentType,
  featuredOnly,
  setFeaturedOnly,
  remoteOnly,
  setRemoteOnly
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Find Your Dream Job
          </h3>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center text-gray-700 hover:text-red-600 transition-colors"
          >
            <Sliders className="w-5 h-5 mr-2" />
            <span className="font-medium">Advanced Filters</span>
          </button>
        </div>
        
        <div className="mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={formData.search}
                  onChange={onInputChange}
                  className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all
                    ${errors.search ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Job title, skills, or keywords..."
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.search && (
                <p className="text-red-500 text-xs mt-1">{errors.search}</p>
              )}
            </div>
            
            <div className="md:w-1/4">
              <select
                name="location"
                value={formData.location}
                onChange={onInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <Button
              onClick={onFilter}
              variant="contained"
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              icon={<Search className="w-5 h-5" />}
            >
              Search Jobs
            </Button>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Panel */}
      <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ${
        filterOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Department</h4>
              <select
                name="department"
                value={formData.department}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Position Level</h4>
              <select
                name="position"
                value={formData.position}
                onChange={onInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {positionLevels.map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Minimum Experience</h4>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={experienceMin}
                  onChange={(e) => setExperienceMin(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="ml-3 min-w-[60px] text-gray-700">{experienceMin}+ years</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Employment Type</h4>
              <div className="flex flex-wrap gap-2">
                {employmentTypes.map((type, index) => (
                  <button
                    key={index}
                    onClick={() => toggleEmploymentType(type)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      selectedEmploymentTypes.includes(type)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Job Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-700">Featured Jobs Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-700">Remote Jobs Only</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={onReset}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Reset Filters
            </button>
            <Button
              onClick={onFilter}
              variant="contained"
              className="ml-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;