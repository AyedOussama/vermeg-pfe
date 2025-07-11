import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import JobFilters from './JobFilters';
import JobCard from './JobCard';
import { Job } from '@/types/job';

interface CareersSectionProps {
  filteredJobs: Job[];
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
  onJobSelect: (job: Job) => void;
  setActiveSection: (section: string) => void;
}

const CareersSection: React.FC<CareersSectionProps> = ({
  filteredJobs,
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
  setRemoteOnly,
  onJobSelect,
  setActiveSection
}) => {
  return (
    <section id="careers" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Current Opportunities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find your perfect role and start making an impact in financial technology
          </p>
        </div>
        
        <JobFilters
          formData={formData}
          onInputChange={onInputChange}
          onFilter={onFilter}
          onReset={onReset}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          errors={errors}
          locations={locations}
          departments={departments}
          positionLevels={positionLevels}
          employmentTypes={employmentTypes}
          experienceMin={experienceMin}
          setExperienceMin={setExperienceMin}
          selectedEmploymentTypes={selectedEmploymentTypes}
          toggleEmploymentType={toggleEmploymentType}
          featuredOnly={featuredOnly}
          setFeaturedOnly={setFeaturedOnly}
          remoteOnly={remoteOnly}
          setRemoteOnly={setRemoteOnly}
        />
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-700">
            <span className="font-semibold">{filteredJobs.length}</span> opportunities found
          </p>
        </div>
        
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
            <Button
              onClick={onReset}
              variant="contained"
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredJobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                onSelect={onJobSelect}
                index={index}
              />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button 
            onClick={() => setActiveSection('careers')}
            variant="contained"
            className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            icon={<ArrowRight className="w-5 h-5" />}
          >
            View All Positions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CareersSection;