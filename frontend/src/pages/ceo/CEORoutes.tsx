import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ApprovalsQueue from '@/components/ceo/ApprovalsQueue';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';
import EnhancedCEODashboard from '@/components/ceo/EnhancedCEODashboard';
import JobsManagement from '@/components/ceo/JobsManagement';
import UserManagementInterface from '@/components/ceo/UserManagementInterface';
import SystemAnalyticsDashboard from '@/components/ceo/SystemAnalyticsDashboard';

// CEO Dashboard Layout
const CEOLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// CEO Dashboard Home
const CEODashboard: React.FC = () => {
  return (
    <CEOLayout>
      <EnhancedCEODashboard />
    </CEOLayout>
  );
};

// User Management Page
const UserManagement: React.FC = () => {
  return (
    <CEOLayout>
      <UserManagementInterface />
    </CEOLayout>
  );
};

// System Analytics Page
const SystemAnalytics: React.FC = () => {
  return (
    <CEOLayout>
      <SystemAnalyticsDashboard />
    </CEOLayout>
  );
};

// Jobs Management Page
const JobsManagementPage: React.FC = () => {
  return (
    <CEOLayout>
      <JobsManagement />
    </CEOLayout>
  );
};

// Platform Settings Page
const PlatformSettings: React.FC = () => {
  return (
    <CEOLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600">Configure platform-wide settings and policies</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Platform settings interface will be implemented here.</p>
        </div>
      </div>
    </CEOLayout>
  );
};

// CEO Profile Page
const CEOProfile: React.FC = () => {
  return (
    <CEOLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Profile</h1>
          <p className="text-gray-600">Manage your executive profile and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Profile management interface will be implemented here.</p>
        </div>
      </div>
    </CEOLayout>
  );
};

// CEO Notifications Page
const CEONotifications: React.FC = () => {
  return (
    <CEOLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Notifications</h1>
          <p className="text-gray-600">Stay informed about critical business updates and system alerts</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System Alert: High Application Volume</p>
                  <p className="text-xs text-gray-500 mt-1">Application volume increased by 150% this week</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Monthly Report Available</p>
                  <p className="text-xs text-gray-500 mt-1">Q4 hiring analytics report is ready for review</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Budget Approval Required</p>
                  <p className="text-xs text-gray-500 mt-1">New hiring budget proposal awaiting your approval</p>
                  <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <p className="text-sm text-gray-500">All notifications reviewed</p>
            </div>
          </div>
        </div>
      </div>
    </CEOLayout>
  );
};

// CEO Routes Component
const CEORoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/ceo/jobs" replace />} />
      <Route path="/dashboard" element={<CEODashboard />} />
      <Route path="/jobs" element={<JobsManagementPage />} />
      <Route path="/jobs/:jobId" element={<JobsManagementPage />} />
      <Route path="/approvals" element={<JobsManagementPage />} />
      <Route path="/approvals/:jobId" element={<JobsManagementPage />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/analytics" element={<SystemAnalytics />} />
      <Route path="/settings" element={<PlatformSettings />} />
      <Route path="/notifications" element={<CEONotifications />} />
      <Route path="/profile" element={<CEOProfile />} />
      <Route path="/config" element={<PlatformSettings />} />
      <Route path="/advanced" element={<PlatformSettings />} />
      <Route path="/tools" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/ceo/jobs" replace />} />
    </Routes>
  );
};

export default CEORoutes;
