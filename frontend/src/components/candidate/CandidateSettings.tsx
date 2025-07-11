import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2,
  Download,
  Upload,
  Globe,
  Smartphone,
  Lock,
  Key,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

interface NotificationSettings {
  emailNotifications: {
    jobAlerts: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    marketingEmails: boolean;
  };
  pushNotifications: {
    jobMatches: boolean;
    applicationStatus: boolean;
    messages: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'recruiters_only';
  showSalaryExpectations: boolean;
  allowContactFromRecruiters: boolean;
  showLastActive: boolean;
  dataProcessingConsent: boolean;
}

interface CandidateSettingsProps {
  className?: string;
}

const CandidateSettings: React.FC<CandidateSettingsProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'security' | 'data'>('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+216 12 345 678',
    location: 'Tunis, Tunisia',
    timezone: 'Africa/Tunis',
    language: 'en'
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: {
      jobAlerts: true,
      applicationUpdates: true,
      interviewReminders: true,
      marketingEmails: false
    },
    pushNotifications: {
      jobMatches: true,
      applicationStatus: true,
      messages: true
    },
    frequency: 'immediate'
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'recruiters_only',
    showSalaryExpectations: true,
    allowContactFromRecruiters: true,
    showLastActive: false,
    dataProcessingConsent: true
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', profileData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password changed');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    try {
      // API call to update notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Notifications updated:', notifications);
    } catch (error) {
      console.error('Error updating notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    setLoading(true);
    try {
      // API call to update privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Privacy settings updated:', privacy);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      // API call to export data
      console.log('Exporting data...');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // API call to delete account
        console.log('Deleting account...');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Account', icon: <Download className="w-4 h-4" /> }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Africa/Tunis">Africa/Tunis</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  variant="contained"
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(notifications.emailNotifications).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            emailNotifications: {
                              ...prev.emailNotifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Push Notifications */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Push Notifications
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(notifications.pushNotifications).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotifications(prev => ({
                            ...prev,
                            pushNotifications: {
                              ...prev.pushNotifications,
                              [key]: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Notification Frequency</h3>
                  <div className="space-y-2">
                    {['immediate', 'daily', 'weekly'].map((freq) => (
                      <label key={freq} className="flex items-center">
                        <input
                          type="radio"
                          name="frequency"
                          value={freq}
                          checked={notifications.frequency === freq}
                          onChange={(e) => setNotifications(prev => ({ ...prev, frequency: e.target.value as any }))}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-gray-700 capitalize">{freq}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  variant="contained"
                  onClick={handleNotificationUpdate}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Privacy Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="public">Public - Visible to everyone</option>
                    <option value="recruiters_only">Recruiters Only - Visible to verified recruiters</option>
                    <option value="private">Private - Not visible in searches</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'showSalaryExpectations', label: 'Show salary expectations to recruiters' },
                    { key: 'allowContactFromRecruiters', label: 'Allow recruiters to contact me directly' },
                    { key: 'showLastActive', label: 'Show when I was last active' },
                    { key: 'dataProcessingConsent', label: 'Allow data processing for job matching' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between">
                      <span className="text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={privacy[key as keyof PrivacySettings] as boolean}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  variant="contained"
                  onClick={handlePrivacyUpdate}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </Button>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <div className="space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Enable 2FA</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Data & Account */}
          {activeTab === 'data' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Data & Account Management</h2>
              
              <div className="space-y-6">
                {/* Data Export */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Export Your Data</h3>
                  <p className="text-gray-600 mb-4">
                    Download a copy of all your data including profile information, applications, and activity history.
                  </p>
                  <Button
                    variant="outlined"
                    onClick={handleDataExport}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>

                {/* Account Deletion */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Delete Account
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 text-sm">
                      <strong>Warning:</strong> This action cannot be undone. All your data, applications, and account information will be permanently deleted.
                    </p>
                  </div>
                  <Button
                    variant="outlined"
                    onClick={handleAccountDeletion}
                    className="text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateSettings;
