import React from 'react';
import InterviewCalendar from '@/components/rh/InterviewCalendar';

const CalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <InterviewCalendar className="max-w-7xl mx-auto" />
    </div>
  );
};

export default CalendarPage;
