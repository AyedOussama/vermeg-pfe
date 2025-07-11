import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EnhanceJobPage from './EnhanceJobPage';
import RHApplicationsPage from './RHApplicationsPage';
import RHQuizPage from './RHQuizPage';
import MessagingPage from './MessagingPage';
import CalendarPage from './CalendarPage';
import InterviewManagementPage from './InterviewManagementPage';

import DynamicNavbar from '@/components/navigation/DynamicNavbar';

import ModernQuizBuilder from '@/components/rh/ModernQuizBuilder';
import CleanQuizBuilder from '@/components/rh/CleanQuizBuilder';
import BehavioralAssessmentLibrary from '@/components/rh/BehavioralAssessmentLibrary';
import HRProfileManagement from '@/components/rh/HRProfileManagement';

import PipelineManagementDashboard from '@/components/rh/PipelineManagementDashboard';

// RH Dashboard Layout
const RHLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicNavbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
};



// RH Quiz Management Page
const RHQuizManagement: React.FC = () => {
  return (
    <RHLayout>
      <RHQuizPage />
    </RHLayout>
  );
};

// HR Quiz Builder Page (for creating/editing)
const HRQuizBuilder: React.FC = () => {
  return (
    <CleanQuizBuilder />
  );
};

// Job Reviews Page
const JobReviews: React.FC = () => {
  return (
    <RHLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Reviews</h1>
          <p className="text-gray-600">Review and enhance job postings with HR perspective</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Job reviews interface will be implemented here.</p>
        </div>
      </div>
    </RHLayout>
  );
};

// HR Analytics Page
const HRAnalytics: React.FC = () => {
  return (
    <RHLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Analytics</h1>
          <p className="text-gray-600">Human resources metrics and insights</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">HR analytics dashboard will be implemented here.</p>
        </div>
      </div>
    </RHLayout>
  );
};

// HR Settings Page
const HRSettings: React.FC = () => {
  return (
    <RHLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Settings</h1>
          <p className="text-gray-600">Configure HR processes and preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">HR settings interface will be implemented here.</p>
        </div>
      </div>
    </RHLayout>
  );
};



// RH Profile Page
const RHProfile: React.FC = () => {
  return (
    <RHLayout>
      <HRProfileManagement mode="view" />
    </RHLayout>
  );
};

// RH Profile Edit Page
const RHProfileEdit: React.FC = () => {
  return (
    <RHLayout>
      <HRProfileManagement mode="edit" />
    </RHLayout>
  );
};

// RH Notifications Page
const RHNotifications: React.FC = () => {
  return (
    <RHLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with application progress and system updates</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New application received</p>
                  <p className="text-xs text-gray-500 mt-1">John Doe applied for Senior Developer position</p>
                  <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Job posting approved</p>
                  <p className="text-xs text-gray-500 mt-1">Frontend Developer position has been approved and published</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Interview scheduled</p>
                  <p className="text-xs text-gray-500 mt-1">Interview scheduled with Sarah Johnson for tomorrow at 2 PM</p>
                  <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-gray-500">You're all caught up!</p>
            </div>
          </div>
        </div>
      </div>
    </RHLayout>
  );
};

// Assessment Library Page
const AssessmentLibraryPage: React.FC = () => {
  return (
    <RHLayout>
      <BehavioralAssessmentLibrary />
    </RHLayout>
  );
};

// Pipeline Management Page
const PipelineManagementPage: React.FC = () => {
  return (
    <RHLayout>
      <PipelineManagementDashboard />
    </RHLayout>
  );
};

// RH Applications Page
const RHApplicationsPageWithLayout: React.FC = () => {
  return (
    <RHLayout>
      <RHApplicationsPage />
    </RHLayout>
  );
};

// RH Messaging Page
const RHMessagingPage: React.FC = () => {
  return (
    <RHLayout>
      <MessagingPage />
    </RHLayout>
  );
};

// RH Calendar Page
const RHCalendarPage: React.FC = () => {
  return (
    <RHLayout>
      <CalendarPage />
    </RHLayout>
  );
};

// RH Interview Management Page
const RHInterviewManagementPage: React.FC = () => {
  return (
    <RHLayout>
      <InterviewManagementPage />
    </RHLayout>
  );
};





// RH Routes Component
const RHRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<RHApplicationsPageWithLayout />} />
      <Route path="/applications" element={<RHApplicationsPageWithLayout />} />

      <Route path="/enhance-job/:jobId" element={<EnhanceJobPage />} />
      <Route path="/quiz" element={<RHQuizManagement />} />
      <Route path="/quiz/create/manual" element={<HRQuizBuilder />} />
      <Route path="/quiz/create/ai" element={<HRQuizBuilder />} />
      <Route path="/quiz/edit/:quizId" element={<HRQuizBuilder />} />
      <Route path="/assessments" element={<AssessmentLibraryPage />} />
      <Route path="/pipeline" element={<PipelineManagementPage />} />
      <Route path="/reviews" element={<JobReviews />} />
      <Route path="/analytics" element={<HRAnalytics />} />
      <Route path="/settings" element={<HRSettings />} />
      <Route path="/messages" element={<RHMessagingPage />} />
      <Route path="/calendar" element={<RHCalendarPage />} />
      <Route path="/interviews" element={<RHInterviewManagementPage />} />
      <Route path="/notifications" element={<RHNotifications />} />

      <Route path="/profile" element={<RHProfile />} />
      <Route path="/profile/edit" element={<RHProfileEdit />} />
      <Route path="*" element={<Navigate to="/rh/applications" replace />} />
    </Routes>
  );
};

export default RHRoutes;
