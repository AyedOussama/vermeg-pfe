import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Award,
  Users,
  Edit,
  Save,
  X,
  Camera,
  Briefcase,
  GraduationCap,
  Globe,
  CheckCircle,
  Upload,
  Eye,
  Settings,
  BarChart3,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
  Target,
  Star,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { ProfilePhotoUpload } from '@/components/common/ProfilePhotoUpload';

interface ProjectLeaderProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  yearsInManagement: number;
  teamSize: number;
  technicalExpertise: string[];
  companyDivision: string;
  officeLocation: string;
  managerApprovalCode: string;
  professionalCertifications: string[];
  linkedinProfile: string;
  profilePicture?: string;
  bio?: string;
  joinedDate: string;
  lastUpdated: string;
  // Enhanced fields for better profile
  profileCompleteness: number;
  achievements: string[];
  currentProjects: number;
  completedProjects: number;
  teamSatisfactionScore: number;
  skills: { name: string; level: number }[];
  languages: string[];
  timezone: string;
  workingHours: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface ProjectLeaderProfileProps {
  mode?: 'view' | 'edit';
  onModeChange?: (mode: 'view' | 'edit') => void;
}

const ProjectLeaderProfile: React.FC<ProjectLeaderProfileProps> = ({
  mode = 'view',
  onModeChange
}) => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [profileData, setProfileData] = useState<ProjectLeaderProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProjectLeaderProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load profile data - in real app this would be an API call
    const loadProfileData = () => {
      if (!user) return;
      
      // Mock data based on user
      const mockProfileData: ProjectLeaderProfileData = {
        id: user.id,
        fullName: user.fullName || 'Michael Chen',
        email: user.email,
        phone: '+216 98 765 432',
        employeeId: 'PL001',
        department: 'Engineering',
        jobTitle: 'Senior Project Leader',
        yearsInManagement: 5,
        teamSize: 12,
        technicalExpertise: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes'],
        companyDivision: 'Software Development',
        officeLocation: 'Tunis, Tunisia',
        managerApprovalCode: 'MGR-2024-001',
        professionalCertifications: ['PMP', 'AWS Solutions Architect', 'Scrum Master'],
        linkedinProfile: 'https://linkedin.com/in/michael-chen',
        profilePicture: user.profile?.profilePicture || '/images/project-leader-avatar.jpg',
        bio: 'Experienced project leader with 5+ years in software development management. Passionate about building high-performing teams and delivering innovative solutions.',
        joinedDate: '2019-03-15',
        lastUpdated: new Date().toISOString(),
        // Enhanced fields
        profileCompleteness: 92,
        achievements: ['Led 15+ successful projects', 'Reduced delivery time by 30%', 'Mentored 8 junior developers', 'Implemented Agile practices'],
        currentProjects: 3,
        completedProjects: 47,
        teamSatisfactionScore: 4.8,
        skills: [
          { name: 'Project Management', level: 95 },
          { name: 'Team Leadership', level: 90 },
          { name: 'Agile/Scrum', level: 88 },
          { name: 'Technical Architecture', level: 85 },
          { name: 'Stakeholder Management', level: 92 }
        ],
        languages: ['English (Fluent)', 'French (Native)', 'Arabic (Native)'],
        timezone: 'GMT+1 (Central European Time)',
        workingHours: '9:00 AM - 6:00 PM',
        emergencyContact: {
          name: 'Sarah Chen',
          relationship: 'Spouse',
          phone: '+216 98 123 456'
        }
      };
      
      setProfileData(mockProfileData);
      setFormData(mockProfileData);
      setIsLoading(false);
    };

    loadProfileData();
  }, [user]);

  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  const handleEdit = () => {
    setIsEditing(true);
    onModeChange?.('edit');
  };

  const handleCancel = () => {
    setFormData(profileData || {});
    setIsEditing(false);
    onModeChange?.('view');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call to save profile data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedData = {
        ...profileData,
        ...formData,
        lastUpdated: new Date().toISOString()
      } as ProjectLeaderProfileData;

      setProfileData(updatedData);

      // Update auth context with the latest profile picture and other profile data
      if (updatedData.profilePicture) {
        updateUserProfile({
          profilePicture: updatedData.profilePicture,
          fullName: updatedData.fullName
        });
      }

      setIsEditing(false);
      onModeChange?.('view');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProjectLeaderProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: 'technicalExpertise' | 'professionalCertifications', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handlePhotoChange = (file: File | null, photoUrl?: string) => {
    if (photoUrl) {
      // Update the form data for the profile
      handleInputChange('profilePicture', photoUrl);

      // Immediately update the auth context to sync with navbar
      updateUserProfile({
        profilePicture: photoUrl
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-600">Unable to load profile data</p>
      </div>
    );
  }

  const currentData = isEditing ? formData : profileData;

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl p-8 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              {/* Enhanced Profile Photo */}
              <div className="relative">
                <ProfilePhotoUpload
                  currentPhoto={currentData.profilePicture}
                  onPhotoChange={handlePhotoChange}
                  size="large"
                  editable={isEditing}
                  className="ring-4 ring-white/20"
                />
                {!isEditing && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {isEditing ? 'Edit Profile' : currentData.fullName}
                </h1>
                <p className="text-green-100 text-lg mb-2">
                  {currentData.jobTitle} • {currentData.department}
                </p>
                <div className="flex items-center gap-4 text-green-100">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{currentData.teamSize} team members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{currentData.yearsInManagement} years experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{currentData.teamSatisfactionScore}/5.0 rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleEdit}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    variant="outlined"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    className="bg-white text-green-700 hover:bg-green-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Public View
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white text-green-700 hover:bg-green-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Completeness Bar */}
          {!isEditing && (
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completeness</span>
                <span className="text-sm font-bold">{currentData.profileCompleteness}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${currentData.profileCompleteness}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Dashboard */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Active
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentData.currentProjects}</h3>
            <p className="text-gray-600 text-sm">Current Projects</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Completed
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentData.completedProjects}</h3>
            <p className="text-gray-600 text-sm">Projects Delivered</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Team
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentData.teamSize}</h3>
            <p className="text-gray-600 text-sm">Team Members</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Rating
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{currentData.teamSatisfactionScore}/5.0</h3>
            <p className="text-gray-600 text-sm">Team Satisfaction</p>
          </div>
        </div>
      )}

      {/* Basic Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Basic Information
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <Input
                  value={currentData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 rounded-lg p-3">{currentData.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
              {isEditing ? (
                <Input
                  value={currentData.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Enter your job title"
                  className="w-full"
                />
              ) : (
                <p className="text-gray-900 font-medium bg-gray-50 rounded-lg p-3">{currentData.jobTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              {isEditing ? (
                <select
                  value={currentData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{currentData.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <p className="text-gray-900 bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                {currentData.employeeId}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
            {isEditing ? (
              <textarea
                value={currentData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your professional background, achievements, and goals..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed">
                {currentData.bio || 'No bio provided'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Work Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contact Information
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{currentData.email}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-auto">
                  Verified
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              {isEditing ? (
                <Input
                  value={currentData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                  icon={<Phone className="w-4 h-4" />}
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{currentData.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Location</label>
              {isEditing ? (
                <Input
                  value={currentData.officeLocation || ''}
                  onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                  placeholder="Enter your office location"
                  icon={<MapPin className="w-4 h-4" />}
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{currentData.officeLocation}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
              {isEditing ? (
                <Input
                  value={currentData.linkedinProfile || ''}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="Enter your LinkedIn URL"
                  icon={<Globe className="w-4 h-4" />}
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {currentData.linkedinProfile ? (
                    <a
                      href={currentData.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Work Schedule & Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Work Schedule & Preferences
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{currentData.timezone}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{currentData.workingHours}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
              <div className="flex flex-wrap gap-2">
                {currentData.languages?.map((language, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {currentData.emergencyContact && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{currentData.emergencyContact.name}</p>
                    <p className="text-gray-600">{currentData.emergencyContact.relationship}</p>
                    <p className="text-gray-900">{currentData.emergencyContact.phone}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Management Information & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Management Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Management Information
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years in Management</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={currentData.yearsInManagement || ''}
                    onChange={(e) => handleInputChange('yearsInManagement', parseInt(e.target.value) || 0)}
                    placeholder="Enter years"
                    min="0"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-2xl font-bold text-green-600">{currentData.yearsInManagement}</span>
                    <span className="text-gray-600 ml-1">years</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={currentData.teamSize || ''}
                    onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value) || 0)}
                    placeholder="Enter team size"
                    min="0"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-2xl font-bold text-blue-600">{currentData.teamSize}</span>
                    <span className="text-gray-600 ml-1">members</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Division</label>
              {isEditing ? (
                <Input
                  value={currentData.companyDivision || ''}
                  onChange={(e) => handleInputChange('companyDivision', e.target.value)}
                  placeholder="Enter your company division"
                />
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{currentData.companyDivision}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Joined Company</label>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {new Date(currentData.joinedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Competencies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Skills & Competencies
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {currentData.skills?.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                    <span className="text-sm text-gray-500">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Expertise & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Expertise */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Technical Expertise
            </h3>
          </div>

          <div className="p-6">
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Skills (comma-separated)
                </label>
                <textarea
                  value={currentData.technicalExpertise?.join(', ') || ''}
                  onChange={(e) => handleArrayFieldChange('technicalExpertise', e.target.value)}
                  placeholder="React, Node.js, Python, AWS, Docker..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {currentData.technicalExpertise?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1 text-sm font-medium"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {skill}
                  </Badge>
                )) || <span className="text-gray-500">No technical expertise listed</span>}
              </div>
            )}
          </div>
        </div>

        {/* Key Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Key Achievements
            </h3>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {currentData.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{achievement}</span>
                </div>
              )) || <span className="text-gray-500">No achievements listed</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Professional Certifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Professional Certifications
          </h3>
        </div>

        <div className="p-6">
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications (comma-separated)
              </label>
              <textarea
                value={currentData.professionalCertifications?.join(', ') || ''}
                onChange={(e) => handleArrayFieldChange('professionalCertifications', e.target.value)}
                placeholder="PMP, AWS Solutions Architect, Scrum Master..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentData.professionalCertifications?.map((cert, index) => (
                <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{cert}</h4>
                      <p className="text-xs text-emerald-600">Certified Professional</p>
                    </div>
                  </div>
                </div>
              )) || <span className="text-gray-500">No certifications listed</span>}
            </div>
          )}
        </div>
      </div>

      {/* Footer Information */}
      {!isEditing && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date(currentData.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Profile ID: {currentData.employeeId}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Profile
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {currentData.profileCompleteness}% Complete
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectLeaderProfile;
