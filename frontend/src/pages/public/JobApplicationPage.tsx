// Public Job Application Page

import React from 'react';
import EnhancedJobApplication from '@/components/public/EnhancedJobApplication';

const JobApplicationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EnhancedJobApplication />
      </div>
    </div>
  );
};

export default JobApplicationPage;
