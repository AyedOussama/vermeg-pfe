import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  User, 
  Briefcase, 
  GraduationCap,
  Star,
  Award,
  Languages,
  FolderOpen,
  Calendar,
  MapPin,
  Building,
  Globe,
  Github,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { TextArea } from '@/components/common/TextArea';
import { Select } from '@/components/common/Select';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Alert } from '@/components/common/Alert';
import { ProfilePhotoUpload } from '@/components/common/ProfilePhotoUpload';
import { useAuth } from '@/context/AuthContext';
import {
  CandidateProfileData,
  PersonalInfoFormData,
  WorkExperienceFormData,
  EducationFormData,
  SkillFormData,
  CertificationFormData,
  LanguageFormData,
  PortfolioItemFormData,
  ProfileSection
} from '@/types/candidateProfile';
import { cn } from '@/utils/cn';

// Validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  dateOfBirth: z.string().optional(),
  summary: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  personalWebsite: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  currentPosition: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  expectedSalaryRange: z.string().optional(),
  availabilityToStart: z.string().optional(),
  workPreference: z.enum(['remote', 'onsite', 'hybrid']).optional(),
});

const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  achievements: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  gpa: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  honors: z.array(z.string()).optional(),
  relevantCoursework: z.array(z.string()).optional(),
});

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  category: z.enum(['Technical', 'Soft', 'Language', 'Tool', 'Framework', 'Other']),
  yearsOfExperience: z.number().min(0).optional(),
});

interface CandidateProfileEditProps {
  profileData?: CandidateProfileData;
  onSave: (data: Partial<CandidateProfileData>) => Promise<void>;
  onCancel: () => void;
  onProfilePictureUpload?: (file: File) => Promise<void>;
  className?: string;
}

const CandidateProfileEdit: React.FC<CandidateProfileEditProps> = ({
  profileData,
  onSave,
  onCancel,
  onProfilePictureUpload,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(profileData?.profilePicture || null);

  const { updateUserProfile } = useAuth();

  // Update profile photo URL when profileData changes
  useEffect(() => {
    if (profileData?.profilePicture) {
      setProfilePhotoUrl(profileData.profilePicture);
    }
  }, [profileData?.profilePicture]);

  // Update profile photo URL when upload is successful
  useEffect(() => {
    if (profileData?.profilePicture && profileData.profilePicture !== profilePhotoUrl) {
      setProfilePhotoUrl(profileData.profilePicture);
    }
  }, [profileData?.profilePicture, profilePhotoUrl]);

  // Personal Info Form
  const personalForm = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: profileData?.firstName || '',
      lastName: profileData?.lastName || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      location: profileData?.location || '',
      dateOfBirth: profileData?.dateOfBirth || '',
      summary: profileData?.summary || '',
      linkedinUrl: profileData?.linkedinUrl || '',
      portfolioUrl: profileData?.portfolioUrl || '',
      githubUrl: profileData?.githubUrl || '',
      personalWebsite: profileData?.personalWebsite || '',
      currentPosition: profileData?.currentPosition || '',
      yearsOfExperience: profileData?.yearsOfExperience || 0,
      expectedSalaryRange: profileData?.expectedSalaryRange || '',
      availabilityToStart: profileData?.availabilityToStart || '',
      workPreference: profileData?.workPreference || 'hybrid',
    }
  });

  // Experience Form
  const experienceForm = useForm({
    defaultValues: {
      experience: profileData?.experience || []
    }
  });
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = 
    useFieldArray({
      control: experienceForm.control,
      name: 'experience'
    });

  // Education Form
  const educationForm = useForm({
    defaultValues: {
      education: profileData?.education || []
    }
  });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = 
    useFieldArray({
      control: educationForm.control,
      name: 'education'
    });

  // Skills Form
  const skillsForm = useForm({
    defaultValues: {
      skills: profileData?.skills || []
    }
  });
  const { fields: skillsFields, append: appendSkill, remove: removeSkill } = 
    useFieldArray({
      control: skillsForm.control,
      name: 'skills'
    });

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Star },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen }
  ] as const;

  const handleProfilePhotoChange = async (file: File | null, photoUrl?: string) => {
    setProfilePhoto(file);
    if (file && onProfilePictureUpload) {
      try {
        // Upload the file using the provided upload handler
        await onProfilePictureUpload(file);
        // The upload handler should update the profile data, which will update profilePhotoUrl
        // But we also need to update it locally for immediate feedback
        if (photoUrl) {
          setProfilePhotoUrl(photoUrl);
        }
      } catch (error) {
        console.error('Failed to upload profile picture:', error);
        setError('Failed to upload profile picture. Please try again.');
      }
    } else if (photoUrl) {
      setProfilePhotoUrl(photoUrl);
    } else {
      setProfilePhotoUrl(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate current section
      let isValid = true;
      let sectionData = {};

      switch (activeSection) {
        case 'personal':
          const personalResult = await personalForm.trigger();
          if (!personalResult) {
            isValid = false;
            break;
          }
          sectionData = {
            ...personalForm.getValues(),
            profilePicture: profilePhotoUrl // Include profile photo URL
          };

          // Update user profile in auth context for immediate navbar update
          if (profilePhotoUrl) {
            updateUserProfile({ profilePicture: profilePhotoUrl });
          }
          break;
        case 'experience':
          sectionData = { experience: experienceForm.getValues().experience };
          break;
        case 'education':
          sectionData = { education: educationForm.getValues().education };
          break;
        case 'skills':
          sectionData = { skills: skillsForm.getValues().skills };
          break;
        // Add other sections as needed
      }

      if (!isValid) {
        setError('Please fix the validation errors before saving.');
        return;
      }

      await onSave(sectionData);
      setSuccess('Profile section saved successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const skillLevelOptions = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];

  const skillCategoryOptions = [
    { value: 'Technical', label: 'Technical' },
    { value: 'Soft', label: 'Soft Skills' },
    { value: 'Language', label: 'Programming Language' },
    { value: 'Tool', label: 'Tool' },
    { value: 'Framework', label: 'Framework' },
    { value: 'Other', label: 'Other' }
  ];

  const employmentTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const workPreferenceOptions = [
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              onClick={onCancel}
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Navigation */}
      <Card className="p-4">
        <nav className="flex space-x-1 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as ProfileSection)}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  activeSection === section.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </Card>

      {/* Content Sections */}
      {activeSection === 'personal' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <form className="space-y-6">
            {/* Profile Photo */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Photo</h3>
              <div className="flex justify-center">
                <ProfilePhotoUpload
                  currentPhoto={profilePhotoUrl || undefined}
                  onPhotoChange={handleProfilePhotoChange}
                  size="large"
                  editable={true}
                />
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...personalForm.register('firstName')}
                  error={personalForm.formState.errors.firstName?.message}
                  required
                />
                <Input
                  label="Last Name"
                  {...personalForm.register('lastName')}
                  error={personalForm.formState.errors.lastName?.message}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...personalForm.register('email')}
                  error={personalForm.formState.errors.email?.message}
                  required
                />
                <Input
                  label="Phone Number"
                  {...personalForm.register('phone')}
                  error={personalForm.formState.errors.phone?.message}
                  placeholder="+216 12 345 678"
                />
                <Input
                  label="Location"
                  {...personalForm.register('location')}
                  error={personalForm.formState.errors.location?.message}
                  placeholder="City, Country"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  {...personalForm.register('dateOfBirth')}
                  error={personalForm.formState.errors.dateOfBirth?.message}
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Summary</h3>
              <TextArea
                label="Summary"
                {...personalForm.register('summary')}
                error={personalForm.formState.errors.summary?.message}
                placeholder="Write a brief summary about yourself, your experience, and career goals..."
                rows={4}
              />
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Current Position"
                  {...personalForm.register('currentPosition')}
                  error={personalForm.formState.errors.currentPosition?.message}
                  placeholder="e.g., Senior Software Developer"
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  {...personalForm.register('yearsOfExperience', { valueAsNumber: true })}
                  error={personalForm.formState.errors.yearsOfExperience?.message}
                  min="0"
                />
                <Input
                  label="Expected Salary Range"
                  {...personalForm.register('expectedSalaryRange')}
                  error={personalForm.formState.errors.expectedSalaryRange?.message}
                  placeholder="e.g., 50,000 - 70,000 TND"
                />
                <Input
                  label="Availability to Start"
                  {...personalForm.register('availabilityToStart')}
                  error={personalForm.formState.errors.availabilityToStart?.message}
                  placeholder="e.g., Immediately, 2 weeks notice"
                />
                <Select
                  label="Work Preference"
                  options={workPreferenceOptions}
                  {...personalForm.register('workPreference')}
                  error={!!personalForm.formState.errors.workPreference}
                  helperText={personalForm.formState.errors.workPreference?.message}
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="LinkedIn URL"
                  {...personalForm.register('linkedinUrl')}
                  error={personalForm.formState.errors.linkedinUrl?.message}
                  placeholder="https://linkedin.com/in/yourprofile"
                  icon={<Linkedin className="w-4 h-4" />}
                />
                <Input
                  label="GitHub URL"
                  {...personalForm.register('githubUrl')}
                  error={personalForm.formState.errors.githubUrl?.message}
                  placeholder="https://github.com/yourusername"
                  icon={<Github className="w-4 h-4" />}
                />
                <Input
                  label="Portfolio URL"
                  {...personalForm.register('portfolioUrl')}
                  error={personalForm.formState.errors.portfolioUrl?.message}
                  placeholder="https://yourportfolio.com"
                  icon={<Globe className="w-4 h-4" />}
                />
                <Input
                  label="Personal Website"
                  {...personalForm.register('personalWebsite')}
                  error={personalForm.formState.errors.personalWebsite?.message}
                  placeholder="https://yourwebsite.com"
                  icon={<Globe className="w-4 h-4" />}
                />
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Experience Section */}
      {activeSection === 'experience' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
            <Button
              variant="outlined"
              size="small"
              onClick={() => appendExperience({
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                location: '',
                employmentType: 'full-time',
                achievements: [],
                technologies: []
              })}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Experience
            </Button>
          </div>

          <div className="space-y-6">
            {experienceFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => removeExperience(index)}
                    icon={<Trash2 className="w-4 h-4" />}
                    color="error"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Company"
                    {...experienceForm.register(`experience.${index}.company`)}
                    required
                  />
                  <Input
                    label="Position"
                    {...experienceForm.register(`experience.${index}.position`)}
                    required
                  />
                  <Input
                    label="Location"
                    {...experienceForm.register(`experience.${index}.location`)}
                    required
                  />
                  <Select
                    label="Employment Type"
                    options={employmentTypeOptions}
                    {...experienceForm.register(`experience.${index}.employmentType`)}
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    {...experienceForm.register(`experience.${index}.startDate`)}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    {...experienceForm.register(`experience.${index}.endDate`)}
                    disabled={experienceForm.watch(`experience.${index}.current`)}
                  />
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...experienceForm.register(`experience.${index}.current`)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">I currently work here</span>
                  </label>
                </div>

                <div className="mt-4">
                  <TextArea
                    label="Description"
                    {...experienceForm.register(`experience.${index}.description`)}
                    placeholder="Describe your role, responsibilities, and achievements..."
                    rows={3}
                    required
                  />
                </div>
              </div>
            ))}

            {experienceFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No work experience added yet.</p>
                <p className="text-sm">Click "Add Experience" to get started.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Education Section */}
      {activeSection === 'education' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Education</h2>
            <Button
              variant="outlined"
              size="small"
              onClick={() => appendEducation({
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                gpa: '',
                description: '',
                location: '',
                honors: [],
                relevantCoursework: []
              })}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Education
            </Button>
          </div>

          <div className="space-y-6">
            {educationFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => removeEducation(index)}
                    icon={<Trash2 className="w-4 h-4" />}
                    color="error"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Institution"
                    {...educationForm.register(`education.${index}.institution`)}
                    required
                  />
                  <Input
                    label="Degree"
                    {...educationForm.register(`education.${index}.degree`)}
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                  <Input
                    label="Field of Study"
                    {...educationForm.register(`education.${index}.field`)}
                    placeholder="e.g., Computer Science"
                    required
                  />
                  <Input
                    label="Location"
                    {...educationForm.register(`education.${index}.location`)}
                    placeholder="City, Country"
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    {...educationForm.register(`education.${index}.startDate`)}
                    required
                  />
                  <Input
                    label="End Date"
                    type="date"
                    {...educationForm.register(`education.${index}.endDate`)}
                    required
                  />
                  <Input
                    label="GPA"
                    {...educationForm.register(`education.${index}.gpa`)}
                    placeholder="e.g., 3.8/4.0"
                  />
                </div>

                <div className="mt-4">
                  <TextArea
                    label="Description"
                    {...educationForm.register(`education.${index}.description`)}
                    placeholder="Additional details about your education..."
                    rows={2}
                  />
                </div>
              </div>
            ))}

            {educationFields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2">No education information added yet.</p>
                <p className="text-sm">Click "Add Education" to get started.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Skills Section */}
      {activeSection === 'skills' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
            <Button
              variant="outlined"
              size="small"
              onClick={() => appendSkill({
                name: '',
                level: 'Beginner',
                category: 'Technical',
                yearsOfExperience: 0
              })}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Skill
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">Skill {index + 1}</h3>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => removeSkill(index)}
                    icon={<Trash2 className="w-3 h-3" />}
                    color="error"
                    className="!p-1"
                  >
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    label="Skill Name"
                    {...skillsForm.register(`skills.${index}.name`)}
                    placeholder="e.g., React, JavaScript"
                    required
                  />
                  <Select
                    label="Level"
                    options={skillLevelOptions}
                    {...skillsForm.register(`skills.${index}.level`)}
                  />
                  <Select
                    label="Category"
                    options={skillCategoryOptions}
                    {...skillsForm.register(`skills.${index}.category`)}
                  />
                  <Input
                    label="Years of Experience"
                    type="number"
                    {...skillsForm.register(`skills.${index}.yearsOfExperience`, { valueAsNumber: true })}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          {skillsFields.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Star className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">No skills added yet.</p>
              <p className="text-sm">Click "Add Skill" to get started.</p>
            </div>
          )}
        </Card>
      )}

      {/* Placeholder for other sections */}
      {['certifications', 'languages', 'portfolio'].includes(activeSection) && (
        <Card className="p-6">
          <div className="text-center py-8 text-gray-500">
            <div className="mx-auto h-12 w-12 text-gray-300">
              {activeSection === 'certifications' && <Award className="w-full h-full" />}
              {activeSection === 'languages' && <Languages className="w-full h-full" />}
              {activeSection === 'portfolio' && <FolderOpen className="w-full h-full" />}
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900 capitalize">{activeSection}</h3>
            <p className="mt-1 text-sm">This section is coming soon.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CandidateProfileEdit;
