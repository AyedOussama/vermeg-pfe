import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MyApplications from '@/components/candidate/MyApplications';
import JobSearchPage from './JobSearchPage';
import MyApplicationsPage from './MyApplicationsPage';
import MessagingPage from './MessagingPage';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';
import CandidateProfileManager from '@/components/candidate/CandidateProfileManager';
import AccountSettings from '@/components/settings/AccountSettings';
import UserDataDebug from '@/components/debug/UserDataDebug';

// Candidate Dashboard Layout
const CandidateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Candidate Dashboard Home
const CandidateDashboard: React.FC = () => {
  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600">Track your applications and discover new opportunities</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 01-7.5-7.5H5a9 9 0 109 9v5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Technical assessment completed for "Senior Developer"</span>
                <span className="text-xs text-gray-400">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Application submitted for "Product Manager"</span>
                <span className="text-xs text-gray-400">1 day ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Interview scheduled for "UX Designer" position</span>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Frontend Developer</h3>
                <p className="text-sm text-gray-600">Engineering • Tunis, Tunisia</p>
                <p className="text-sm text-green-600 font-medium">40,000 - 55,000 TND</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900">Full Stack Engineer</h3>
                <p className="text-sm text-gray-600">Engineering • Remote</p>
                <p className="text-sm text-green-600 font-medium">50,000 - 70,000 TND</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
};

// Application Status Page
const ApplicationStatus: React.FC = () => {
  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
          <p className="text-gray-600">Track the progress of your job applications</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Application status tracking interface will be implemented here.</p>
        </div>
      </div>
    </CandidateLayout>
  );
};

// Notifications Page
const Notifications: React.FC = () => {
  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your application progress</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Notifications interface will be implemented here.</p>
        </div>
      </div>
    </CandidateLayout>
  );
};

// Profile Page
const CandidateProfile: React.FC = () => {
  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your professional profile and documents</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Profile management interface will be implemented here.</p>
        </div>
      </div>
    </CandidateLayout>
  );
};

// Uploaded Documents Page
const UploadedDocuments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Uploaded Documents</h1>
        <p className="text-gray-600">Manage your CV, cover letters, and other documents</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
          <p className="text-gray-500 mb-4">Upload your CV and other documents to enhance your profile</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

// Application History Page
const ApplicationHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application History</h1>
        <p className="text-gray-600">View your complete application history and status updates</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No application history</h3>
          <p className="text-gray-500">Your application history will appear here once you start applying for jobs</p>
        </div>
      </div>
    </div>
  );
};

// Interview Schedule Page
const InterviewSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interview Schedule</h1>
        <p className="text-gray-600">Manage your upcoming interviews and view past interview history</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
          <p className="text-gray-500">Your interview schedule will appear here when you have upcoming interviews</p>
        </div>
      </div>
    </div>
  );
};

// Notifications Settings Page
const NotificationsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600">Customize how and when you receive notifications</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">New job opportunities</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Application status updates</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                <span className="ml-2 text-sm text-gray-700">Interview invitations</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Urgent updates</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Daily job alerts</span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Profile Page
const EditProfile: React.FC = () => {
  return (
    <CandidateLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your personal and professional information</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Profile editing interface will be implemented here.</p>
        </div>
      </div>
    </CandidateLayout>
  );
};

// Settings Page
const CandidateSettings: React.FC = () => {
  return <AccountSettings />;
};

// Help & Support Page
const HelpSupport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600">Get help with using the platform and find answers to common questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ</h3>
            <p className="text-gray-500 mb-4">Find answers to frequently asked questions</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              View FAQ
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-500 mb-4">Get in touch with our support team</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              Contact Us
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Guide</h3>
            <p className="text-gray-500 mb-4">Learn how to use all platform features</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
              Read Guide
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-gray-500 mb-4">Watch step-by-step video tutorials</p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Watch Videos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Candidate Routes Component
const CandidateRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CandidateDashboard />} />
      <Route path="/dashboard" element={<CandidateDashboard />} />
      <Route path="/search" element={
        <CandidateLayout>
          <JobSearchPage />
        </CandidateLayout>
      } />
      <Route path="/applications" element={
        <CandidateLayout>
          <MyApplicationsPage />
        </CandidateLayout>
      } />
      <Route path="/status" element={<ApplicationStatus />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/messages" element={
        <CandidateLayout>
          <MessagingPage />
        </CandidateLayout>
      } />
      <Route path="/profile" element={
        <CandidateLayout>
          <CandidateProfileManager />
        </CandidateLayout>
      } />
      <Route path="/profile/edit" element={
        <CandidateLayout>
          <CandidateProfileManager initialMode="edit" />
        </CandidateLayout>
      } />
      <Route path="/settings" element={<CandidateSettings />} />

      {/* Avatar menu routes */}
      <Route path="/documents" element={
        <CandidateLayout>
          <UploadedDocuments />
        </CandidateLayout>
      } />
      <Route path="/history" element={
        <CandidateLayout>
          <ApplicationHistory />
        </CandidateLayout>
      } />
      <Route path="/interviews" element={
        <CandidateLayout>
          <InterviewSchedule />
        </CandidateLayout>
      } />
      <Route path="/notifications-settings" element={
        <CandidateLayout>
          <NotificationsSettings />
        </CandidateLayout>
      } />

      {/* Help route - shared across roles */}
      <Route path="/help" element={
        <CandidateLayout>
          <HelpSupport />
        </CandidateLayout>
      } />

      <Route path="/debug" element={<UserDataDebug />} />
      <Route path="*" element={<Navigate to="/candidate/dashboard" replace />} />
    </Routes>
  );
};

export default CandidateRoutes;
