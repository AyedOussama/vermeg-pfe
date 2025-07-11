import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EnhancedCreateJob from '@/components/project-leader/EnhancedCreateJob';
import MyJobsPage from './MyJobsPage';
import ProjectLeaderProfileManager from '@/components/project-leader/ProjectLeaderProfileManager';
import JobTemplates from '@/components/project-leader/JobTemplates';
import QuizBuilder from '@/components/project-leader/QuizBuilder';
import TeamManagement from '@/components/project-leader/TeamManagement';
import Analytics from '@/components/project-leader/Analytics';
import AccountSettings from '@/components/project-leader/AccountSettings';
import HelpSupport from '@/components/project-leader/HelpSupport';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';

// Project Leader Layout Component
const ProjectLeaderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Profile components using the new ProfileManager
const ProjectLeaderProfileView: React.FC = () => (
  <ProjectLeaderLayout>
    <ProjectLeaderProfileManager initialMode="view" />
  </ProjectLeaderLayout>
);

const ProjectLeaderProfileEdit: React.FC = () => (
  <ProjectLeaderLayout>
    <ProjectLeaderProfileManager initialMode="edit" />
  </ProjectLeaderLayout>
);

const JobTemplatesPage: React.FC = () => (
  <ProjectLeaderLayout>
    <JobTemplates />
  </ProjectLeaderLayout>
);

const QuizBuilderPage: React.FC = () => (
  <ProjectLeaderLayout>
    <QuizBuilder />
  </ProjectLeaderLayout>
);

const TeamManagementPage: React.FC = () => (
  <ProjectLeaderLayout>
    <TeamManagement />
  </ProjectLeaderLayout>
);

const AnalyticsPage: React.FC = () => (
  <ProjectLeaderLayout>
    <Analytics />
  </ProjectLeaderLayout>
);

const AccountSettingsPage: React.FC = () => (
  <ProjectLeaderLayout>
    <AccountSettings />
  </ProjectLeaderLayout>
);

const HelpSupportPage: React.FC = () => (
  <ProjectLeaderLayout>
    <HelpSupport />
  </ProjectLeaderLayout>
);

const ProjectLeaderNotificationsPage: React.FC = () => (
  <ProjectLeaderLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600">Stay updated with your projects and team activities</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New application for your job posting</p>
                <p className="text-xs text-gray-500 mt-1">Jane Smith applied for Senior React Developer position</p>
                <p className="text-xs text-gray-400 mt-1">30 minutes ago</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Job posting approved</p>
                <p className="text-xs text-gray-500 mt-1">Your Backend Developer job posting has been approved by HR</p>
                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Team member update</p>
                <p className="text-xs text-gray-500 mt-1">Alex Johnson completed the technical assessment review</p>
                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        </div>
      </div>
    </div>
  </ProjectLeaderLayout>
);



// Project Leader Routes Component
const ProjectLeaderRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Main navbar pages */}
      <Route path="/create-job" element={
        <ProjectLeaderLayout>
          <EnhancedCreateJob />
        </ProjectLeaderLayout>
      } />
      <Route path="/jobs" element={
        <ProjectLeaderLayout>
          <MyJobsPage />
        </ProjectLeaderLayout>
      } />

      {/* Avatar dropdown pages */}
      <Route path="/profile" element={<ProjectLeaderProfileView />} />
      <Route path="/profile/edit" element={<ProjectLeaderProfileEdit />} />
      <Route path="/templates" element={<JobTemplatesPage />} />
      <Route path="/quiz-builder" element={<QuizBuilderPage />} />
      <Route path="/team" element={<TeamManagementPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<AccountSettingsPage />} />
      <Route path="/notifications" element={<ProjectLeaderNotificationsPage />} />
      <Route path="/help" element={<HelpSupportPage />} />

      {/* Default redirect to create-job (first main navbar item) */}
      <Route path="/" element={<Navigate to="/project-leader/create-job" replace />} />
      <Route path="*" element={<Navigate to="/project-leader/create-job" replace />} />
    </Routes>
  );
};

export default ProjectLeaderRoutes;
