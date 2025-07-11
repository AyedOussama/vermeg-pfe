import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Languages,
  Building,
  Shield,
  Settings,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { SAMPLE_HR_MANAGERS } from '@/data/dummyData';

interface HRProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  employeeId: string;
  hrDivision: string;
  yearsInHR: number;
  certifications: string[];
  specializations: string[];
  officeLocation: string;
  education: string;
  languages: string[];
  bio?: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    weeklyReports: boolean;
    candidateUpdates: boolean;
    systemAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'team' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
  };
}

interface HRProfileManagementProps {
  mode: 'view' | 'edit';
}

const HRProfileManagement: React.FC<HRProfileManagementProps> = ({ mode: initialMode = 'view' }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<HRProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'privacy'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find HR manager profile from dummy data
      const hrManager = SAMPLE_HR_MANAGERS.find(hr => hr.email === user?.email) || SAMPLE_HR_MANAGERS[0];
      
      const profileData: HRProfile = {
        id: hrManager.id,
        firstName: hrManager.firstName,
        lastName: hrManager.lastName,
        email: hrManager.email,
        phone: hrManager.phone || '+352-26-12-34-56',
        avatar: hrManager.avatar,
        employeeId: hrManager.employeeId || 'HR001',
        hrDivision: hrManager.hrDivision || 'Talent Acquisition',
        yearsInHR: hrManager.yearsInHR || 5,
        certifications: hrManager.certifications || ['SHRM-CP', 'PHR'],
        specializations: hrManager.specializations || ['Technical Recruitment', 'Behavioral Assessment'],
        officeLocation: hrManager.officeLocation || 'Luxembourg',
        education: hrManager.education || "Master's in Human Resources",
        languages: hrManager.languages || ['English', 'French'],
        bio: 'Experienced HR professional specializing in technical recruitment and behavioral assessment. Passionate about finding the right talent and creating positive candidate experiences.',
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          weeklyReports: true,
          candidateUpdates: true,
          systemAlerts: true
        },
        privacy: {
          profileVisibility: 'team',
          showEmail: true,
          showPhone: false,
          showLocation: true
        }
      };
      
      setProfile(profileData);
      setOriginalProfile({ ...profileData });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOriginalProfile({ ...profile });
      setMode('view');
      console.log('Profile saved:', profile);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setAvatarPreview(null);
    setMode('view');
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        if (profile) {
          setProfile({ ...profile, avatar: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addCertification = () => {
    if (profile) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, '']
      });
    }
  };

  const updateCertification = (index: number, value: string) => {
    if (profile) {
      const newCertifications = [...profile.certifications];
      newCertifications[index] = value;
      setProfile({
        ...profile,
        certifications: newCertifications
      });
    }
  };

  const removeCertification = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        certifications: profile.certifications.filter((_, i) => i !== index)
      });
    }
  };

  const addSpecialization = () => {
    if (profile) {
      setProfile({
        ...profile,
        specializations: [...profile.specializations, '']
      });
    }
  };

  const updateSpecialization = (index: number, value: string) => {
    if (profile) {
      const newSpecializations = [...profile.specializations];
      newSpecializations[index] = value;
      setProfile({
        ...profile,
        specializations: newSpecializations
      });
    }
  };

  const removeSpecialization = (index: number) => {
    if (profile) {
      setProfile({
        ...profile,
        specializations: profile.specializations.filter((_, i) => i !== index)
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">Unable to load profile information.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Profile' : 'HR Profile'}
          </h1>
          <p className="text-gray-600">
            {mode === 'edit' 
              ? 'Update your professional information and preferences'
              : 'Manage your HR profile and account settings'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'view' ? (
            <Button
              variant="contained"
              onClick={() => setMode('edit')}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 mr-2 inline" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preferences'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2 inline" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'privacy'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 mr-2 inline" />
            Privacy Settings
          </button>
        </div>
      </Card>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Basic Info */}
          <Card className="p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                  {(avatarPreview || profile.avatar) ? (
                    <img
                      src={avatarPreview || profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {mode === 'edit' && (
                  <label className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full cursor-pointer hover:bg-orange-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-gray-600 mb-2">{profile.hrDivision}</p>
              <Badge variant="outline" className="mb-4">
                {profile.employeeId}
              </Badge>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Building className="w-4 h-4" />
                  {profile.officeLocation}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {profile.yearsInHR} years in HR
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  {mode === 'edit' ? (
                    <Input
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      placeholder="First Name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  {mode === 'edit' ? (
                    <Input
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      placeholder="Last Name"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {mode === 'edit' ? (
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email Address"
                        className="flex-1"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {mode === 'edit' ? (
                      <Input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Phone Number"
                        className="flex-1"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {mode === 'edit' ? (
                      <Input
                        value={profile.officeLocation}
                        onChange={(e) => setProfile({ ...profile, officeLocation: e.target.value })}
                        placeholder="Office Location"
                        className="flex-1"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.officeLocation}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in HR
                  </label>
                  {mode === 'edit' ? (
                    <Input
                      type="number"
                      value={profile.yearsInHR}
                      onChange={(e) => setProfile({ ...profile, yearsInHR: parseInt(e.target.value) || 0 })}
                      placeholder="Years in HR"
                      min="0"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.yearsInHR} years</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {mode === 'edit' ? (
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                )}
              </div>
            </Card>

            {/* Professional Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HR Division
                  </label>
                  {mode === 'edit' ? (
                    <select
                      value={profile.hrDivision}
                      onChange={(e) => setProfile({ ...profile, hrDivision: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Talent Acquisition">Talent Acquisition</option>
                      <option value="Employee Development">Employee Development</option>
                      <option value="Compensation & Benefits">Compensation & Benefits</option>
                      <option value="Performance Management">Performance Management</option>
                      <option value="Employee Relations">Employee Relations</option>
                      <option value="HR Operations">HR Operations</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{profile.hrDivision}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  {mode === 'edit' ? (
                    <Input
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      placeholder="Education Background"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.education}</p>
                  )}
                </div>

                {/* Certifications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Certifications
                    </label>
                    {mode === 'edit' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addCertification}
                      >
                        <Award className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>

                  {mode === 'edit' ? (
                    <div className="space-y-2">
                      {profile.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={cert}
                            onChange={(e) => updateCertification(index, e.target.value)}
                            placeholder="Certification name"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specializations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Specializations
                    </label>
                    {mode === 'edit' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={addSpecialization}
                      >
                        <BookOpen className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>

                  {mode === 'edit' ? (
                    <div className="space-y-2">
                      {profile.specializations.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={spec}
                            onChange={(e) => updateSpecialization(index, e.target.value)}
                            placeholder="Specialization area"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => removeSpecialization(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        <Languages className="w-3 h-3 mr-1" />
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.emailNotifications}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, emailNotifications: e.target.checked }
                  })}
                  className="sr-only peer"
                  disabled={mode === 'view'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.smsNotifications}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, smsNotifications: e.target.checked }
                  })}
                  className="sr-only peer"
                  disabled={mode === 'view'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Weekly Reports</h4>
                <p className="text-sm text-gray-600">Receive weekly recruitment summary reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.weeklyReports}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, weeklyReports: e.target.checked }
                  })}
                  className="sr-only peer"
                  disabled={mode === 'view'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Candidate Updates</h4>
                <p className="text-sm text-gray-600">Get notified when candidates complete assessments</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.candidateUpdates}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, candidateUpdates: e.target.checked }
                  })}
                  className="sr-only peer"
                  disabled={mode === 'view'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">System Alerts</h4>
                <p className="text-sm text-gray-600">Receive system maintenance and update notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.preferences.systemAlerts}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, systemAlerts: e.target.checked }
                  })}
                  className="sr-only peer"
                  disabled={mode === 'view'}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Visibility
              </label>
              <select
                value={profile.privacy.profileVisibility}
                onChange={(e) => setProfile({
                  ...profile,
                  privacy: { ...profile.privacy, profileVisibility: e.target.value as any }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={mode === 'view'}
              >
                <option value="public">Public - Visible to all users</option>
                <option value="team">Team - Visible to team members only</option>
                <option value="private">Private - Visible to you only</option>
              </select>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Contact Information Visibility</h4>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Show Email Address</span>
                  <p className="text-sm text-gray-600">Allow others to see your email address</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.privacy.showEmail}
                    onChange={(e) => setProfile({
                      ...profile,
                      privacy: { ...profile.privacy, showEmail: e.target.checked }
                    })}
                    className="sr-only peer"
                    disabled={mode === 'view'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Show Phone Number</span>
                  <p className="text-sm text-gray-600">Allow others to see your phone number</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.privacy.showPhone}
                    onChange={(e) => setProfile({
                      ...profile,
                      privacy: { ...profile.privacy, showPhone: e.target.checked }
                    })}
                    className="sr-only peer"
                    disabled={mode === 'view'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Show Location</span>
                  <p className="text-sm text-gray-600">Allow others to see your office location</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.privacy.showLocation}
                    onChange={(e) => setProfile({
                      ...profile,
                      privacy: { ...profile.privacy, showLocation: e.target.checked }
                    })}
                    className="sr-only peer"
                    disabled={mode === 'view'}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HRProfileManagement;
