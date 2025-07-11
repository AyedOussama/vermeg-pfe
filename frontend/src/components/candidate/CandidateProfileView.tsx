import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Download,
  Edit,
  Star,
  Clock,
  Building,
  BookOpen,
  Languages,
  Trophy,
  FolderOpen,
  Eye,
  EyeOff,
  Camera
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { CandidateProfileData, ProfileSection } from '@/types/candidateProfile';
import { cn } from '@/utils/cn';

interface CandidateProfileViewProps {
  candidateId?: string;
  profileData?: CandidateProfileData;
  editable?: boolean;
  onEdit?: () => void;
  onProfilePictureUpload?: (file: File) => Promise<void>;
  className?: string;
}

const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  candidateId,
  profileData,
  editable = true,
  onEdit,
  onProfilePictureUpload,
  className = ''
}) => {
  const [profile, setProfile] = useState<CandidateProfileData | null>(profileData || null);
  const [loading, setLoading] = useState(!profileData);
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update profile when profileData prop changes
  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setLoading(false);
    }
  }, [profileData]);

  // Load profile data from API if not provided
  useEffect(() => {
    if (!profileData && candidateId) {
      const loadProfile = async () => {
        try {
          setLoading(true);
          console.log('🔍 Loading profile for candidate:', candidateId);

          // Import candidateService dynamically to avoid circular dependencies
          const { candidateService } = await import('../../services/candidateService');
          const profileData = await candidateService.getCompleteProfile();

          console.log('✅ Profile loaded successfully:', profileData);
          setProfile(profileData);
        } catch (error) {
          console.error('❌ Error loading profile:', error);
          // Set a minimal profile structure on error
          setProfile({
            id: candidateId,
            firstName: 'Unknown',
            lastName: 'User',
            email: 'unknown@example.com',
            phone: '',
            location: '',
            dateOfBirth: '',
            summary: 'Unable to load profile. Please try again.',
            profilePicture: '',
            linkedinUrl: '',
            portfolioUrl: '',
            githubUrl: '',
            personalWebsite: '',
            currentPosition: '',
            yearsOfExperience: 0,
            expectedSalaryRange: '',
            availabilityToStart: '',
            workPreference: 'hybrid',
            resume: undefined,
            experience: [],
            education: [],
            skills: [],
            certifications: [],
            languages: [],
            portfolio: [],
            preferredJobCategories: [],
            preferredLocations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profileCompleteness: 0,
            isPublic: false
          });
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }
  }, [candidateId, profileData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No profile found</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load candidate profile.</p>
      </div>
    );
  }

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen }
  ] as const;

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Handle profile picture upload
  const handleProfilePictureClick = () => {
    if (editable && onProfilePictureUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onProfilePictureUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      try {
        setIsUploadingPhoto(true);
        await onProfilePictureUpload(file);

        // Update local profile state with new photo URL
        const newPhotoUrl = URL.createObjectURL(file);
        if (profile) {
          setProfile({
            ...profile,
            profilePicture: newPhotoUrl
          });
          setImageError(false); // Reset image error state
        }
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
        alert('Failed to upload profile picture. Please try again.');
      } finally {
        setIsUploadingPhoto(false);
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50', className)}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <div
                className={`w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40 shadow-2xl relative overflow-hidden group ${
                  editable && onProfilePictureUpload ? 'cursor-pointer hover:border-white/60 hover:shadow-3xl transition-all duration-300' : ''
                }`}
                onClick={handleProfilePictureClick}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full"></div>

                {/* Profile Image or Default Avatar */}
                {profile.profilePicture && !imageError ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile Picture"
                    className="w-full h-full rounded-full object-cover relative z-10"
                    onError={() => {
                      console.error('Failed to load profile image:', profile.profilePicture);
                      setImageError(true);
                    }}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center text-white/90">
                    <User className="w-12 h-12 lg:w-16 lg:h-16 mb-1" />
                    {editable && onProfilePictureUpload && (
                      <span className="text-xs lg:text-sm font-medium opacity-80">Click to upload</span>
                    )}
                  </div>
                )}

                {/* Upload Overlay */}
                {editable && onProfilePictureUpload && !isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-20">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center">
                      <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-white mb-1" />
                      <span className="text-xs text-white font-medium">Change Photo</span>
                    </div>
                  </div>
                )}

                {/* Loading Overlay */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-2 border-white border-t-transparent"></div>
                      <span className="text-xs text-white mt-2 font-medium">Uploading...</span>
                    </div>
                  </div>
                )}

                {/* Camera Icon Indicator */}
                {editable && onProfilePictureUpload && !isUploadingPhoto && (
                  <div className="absolute bottom-1 right-1 lg:bottom-2 lg:right-2 bg-blue-500 text-white rounded-full p-1.5 lg:p-2 shadow-lg hover:bg-blue-600 transition-colors duration-200 z-20">
                    <Camera className="w-3 h-3 lg:w-4 lg:h-4" />
                  </div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Profile Completeness Badge */}
              {profile.profileCompleteness && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                  {profile.profileCompleteness}%
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.currentPosition && (
                  <p className="text-xl lg:text-2xl text-blue-100 font-medium">
                    {profile.currentPosition}
                  </p>
                )}
              </div>

              {profile.summary && (
                <p className="text-lg text-blue-50 leading-relaxed max-w-3xl">
                  {profile.summary}
                </p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>{showPrivateInfo ? profile.email : '••••••@••••.com'}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    <span>{showPrivateInfo ? profile.phone : '+••• •• ••• •••'}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{profile.yearsOfExperience} years experience</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {editable && onEdit && (
                  <Button
                    onClick={onEdit}
                    variant="secondary"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
                <Button
                  onClick={() => setShowPrivateInfo(!showPrivateInfo)}
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                >
                  {showPrivateInfo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPrivateInfo ? 'Hide' : 'Show'} Contact
                </Button>
                {profile.resume && (
                  <Button
                    variant="outline"
                    className="bg-transparent border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </Button>
                )}
              </div>

              {/* Social Links */}
              {(profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl) && (
                <div className="flex gap-4 pt-2">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as ProfileSection)}
                  className={cn(
                    'flex items-center px-6 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 min-w-fit',
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeSection === 'personal' && (
          <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Personal Information</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    Basic Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-blue-100">
                      <span className="text-gray-600 font-medium">Full Name</span>
                      <span className="text-gray-900 font-semibold">{profile.firstName} {profile.lastName}</span>
                    </div>
                    {profile.dateOfBirth && (
                      <div className="flex items-center justify-between py-3 border-b border-blue-100">
                        <span className="text-gray-600 font-medium">Date of Birth</span>
                        <span className="text-gray-900">{formatDate(profile.dateOfBirth)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600 font-medium">Location</span>
                      <span className="text-gray-900">{profile.location || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 text-green-600 mr-2" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    {profile.expectedSalaryRange && (
                      <div className="flex items-center justify-between py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Expected Salary</span>
                        <span className="text-gray-900 font-semibold">{profile.expectedSalaryRange}</span>
                      </div>
                    )}
                    {profile.availabilityToStart && (
                      <div className="flex items-center justify-between py-3 border-b border-green-100">
                        <span className="text-gray-600 font-medium">Availability</span>
                        <span className="text-gray-900">{profile.availabilityToStart}</span>
                      </div>
                    )}
                    {profile.workPreference && (
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">Work Preference</span>
                        <span className="text-gray-900 capitalize">{profile.workPreference}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {profile.preferredJobCategories.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-purple-600 mr-2" />
                  Preferred Job Categories
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.preferredJobCategories.map((category, index) => (
                    <Badge
                      key={index}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm font-medium"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Experience Section */}
        {activeSection === 'experience' && (
          <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Work Experience</h2>
            </div>

            {profile.experience.length > 0 ? (
              <div className="space-y-8">
                {profile.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    {/* Timeline line */}
                    {index < profile.experience.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-green-400 to-emerald-400"></div>
                    )}

                    <div className="flex gap-6">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Building className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.position}</h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Building className="w-4 h-4 mr-2" />
                              <span className="font-semibold">{exp.company}</span>
                              <span className="mx-3">•</span>
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{exp.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)}
                                </span>
                              </div>
                              <Badge className="bg-green-100 text-green-800 capitalize">
                                {exp.employmentType.replace('-', ' ')}
                              </Badge>
                              {exp.isCurrent && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  Current Position
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{exp.description}</p>

                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Technologies Used:</h4>
                            <div className="flex flex-wrap gap-2">
                              {exp.technologies.map((tech, index) => (
                                <Badge
                                  key={index}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs px-3 py-1"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Work Experience</h3>
                <p className="text-gray-500">Add your work experience to showcase your professional journey.</p>
              </div>
            )}
          </Card>
        )}

        {/* Education Section */}
        {activeSection === 'education' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
          {profile.education.length > 0 ? (
            <div className="space-y-6">
              {profile.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                      <div className="flex items-center text-gray-600 mt-1">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        <span className="font-medium">{edu.institution}</span>
                        {edu.location && (
                          <>
                            <span className="mx-2">•</span>
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{edu.location}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                        {edu.gpa && (
                          <>
                            <span className="mx-2">•</span>
                            <span>GPA: {edu.gpa}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">Field of Study: {edu.field}</p>

                      {edu.description && (
                        <p className="text-gray-700 mt-3">{edu.description}</p>
                      )}

                      {edu.honors && edu.honors.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Honors & Awards:</h4>
                          <div className="flex flex-wrap gap-1">
                            {edu.honors.map((honor, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                                {honor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Relevant Coursework:</h4>
                          <div className="flex flex-wrap gap-1">
                            {edu.relevantCoursework.map((course, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{course}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No education information added yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* Skills Section */}
      {activeSection === 'skills' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
          {profile.skills.length > 0 ? (
            <div className="space-y-6">
              {['Technical', 'Soft', 'Language', 'Tool', 'Framework', 'Other'].map((category) => {
                const categorySkills = profile.skills.filter(skill => skill.category === category);
                if (categorySkills.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">{category} Skills</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySkills.map((skill) => (
                        <div key={skill.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <Badge className={getSkillLevelColor(skill.level)}>
                              {skill.level}
                            </Badge>
                          </div>
                          {skill.yearsOfExperience && (
                            <p className="text-sm text-gray-600">
                              {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''} experience
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No skills added yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* Certifications Section */}
      {activeSection === 'certifications' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
          {profile.certifications.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <p className="text-gray-600 mt-1">{cert.issuer}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Issued: {formatDate(cert.issueDate)}</span>
                        {cert.expiryDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Expires: {formatDate(cert.expiryDate)}</span>
                          </>
                        )}
                      </div>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Credential ID: {cert.credentialId}
                        </p>
                      )}
                      {cert.description && (
                        <p className="text-gray-700 mt-2 text-sm">{cert.description}</p>
                      )}
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {cert.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Award className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No certifications added yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* Languages Section */}
      {activeSection === 'languages' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages</h2>
          {profile.languages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.languages.map((lang) => (
                <div key={lang.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{lang.name}</h3>
                    <Badge
                      className={
                        lang.proficiency === 'Native' ? 'bg-green-100 text-green-800' :
                        lang.proficiency === 'Fluent' ? 'bg-blue-100 text-blue-800' :
                        lang.proficiency === 'Conversational' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {lang.proficiency}
                    </Badge>
                  </div>
                  {lang.certificationLevel && (
                    <p className="text-sm text-gray-600">
                      Level: {lang.certificationLevel}
                    </p>
                  )}
                  {lang.certificationName && (
                    <p className="text-sm text-gray-600">
                      Certification: {lang.certificationName}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Languages className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No languages added yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* Portfolio Section */}
      {activeSection === 'portfolio' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio</h2>
          {profile.portfolio.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {profile.portfolio.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{item.description}</p>

                      {item.role && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Role:</span> {item.role}
                        </p>
                      )}

                      {(item.startDate || item.endDate) && (
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>
                            {item.startDate && formatDate(item.startDate)}
                            {item.startDate && item.endDate && ' - '}
                            {item.endDate && formatDate(item.endDate)}
                          </span>
                        </div>
                      )}

                      {item.achievements && item.achievements.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Achievements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {item.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {item.technologies.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Technologies:</h4>
                          <div className="flex flex-wrap gap-1">
                            {item.technologies.map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  {item.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No portfolio items added yet.</p>
            </div>
          )}
        </Card>
      )}
      </div>
    </div>
  );
};

export default CandidateProfileView;
