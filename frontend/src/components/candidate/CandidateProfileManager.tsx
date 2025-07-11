import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CandidateProfileView from './CandidateProfileView';
import CandidateProfileEdit from './CandidateProfileEdit';
import { candidateService } from '@/services/candidateService';
import { CandidateProfileData, ProfileViewMode } from '@/types/candidateProfile';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

interface CandidateProfileManagerProps {
  candidateId?: string;
  initialMode?: ProfileViewMode;
  className?: string;
}

const CandidateProfileManager: React.FC<CandidateProfileManagerProps> = ({
  candidateId,
  initialMode = 'view',
  className = ''
}) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateUserProfile } = useAuth();
  
  // Get mode from URL params or use initial mode
  const mode = (searchParams.get('mode') as ProfileViewMode) || initialMode;
  
  const [profileData, setProfileData] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get complete profile first, fallback to basic profile
        let profile: CandidateProfileData;
        try {
          profile = await candidateService.getCompleteProfile();
        } catch (completeProfileError) {
          // Fallback to basic profile and transform it
          const basicProfile = await candidateService.getProfile();
          profile = {
            ...basicProfile,
            location: '',
            dateOfBirth: '',
            summary: '',
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
            profileCompleteness: 0,
            isPublic: true
          };
        }
        
        setProfileData(profile);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [candidateId]);

  // Handle mode changes
  const handleModeChange = (newMode: ProfileViewMode) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newMode === 'edit') {
      newSearchParams.set('mode', 'edit');
    } else {
      newSearchParams.delete('mode');
    }
    setSearchParams(newSearchParams);
  };

  // Handle edit mode
  const handleEdit = () => {
    handleModeChange('edit');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    handleModeChange('view');
  };

  // Handle save profile
  const handleSaveProfile = async (updatedData: Partial<CandidateProfileData>) => {
    try {
      setSaving(true);
      setError(null);

      // Update the profile data
      await candidateService.updateCompleteProfile(updatedData);
      
      // Refresh the profile data
      const updatedProfile = await candidateService.getCompleteProfile();
      setProfileData(updatedProfile);
      
      // Show success notification
      addNotification('Profile Updated', 'Profile updated successfully!', {
        type: 'success'
      });

      // Switch back to view mode
      handleModeChange('view');
      
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.message || 'Failed to save profile changes');
      
      // Show error notification
      addNotification('Profile Update Failed', 'Failed to save profile changes. Please try again.', {
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle file uploads
  const handleResumeUpload = async (file: File) => {
    try {
      setSaving(true);
      const response = await candidateService.uploadResume(file, (progress) => {
        // You could show upload progress here
        console.log(`Upload progress: ${progress}%`);
      });
      
      // Update profile data with new resume
      if (profileData) {
        setProfileData({
          ...profileData,
          resume: response.file
        });
      }
      
      addNotification('Resume Uploaded', 'Resume uploaded successfully!', {
        type: 'success'
      });
    } catch (err: any) {
      console.error('Failed to upload resume:', err);
      addNotification('Resume Upload Failed', 'Failed to upload resume. Please try again.', {
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      setSaving(true);
      const response = await candidateService.uploadProfilePicture(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });

      // Update profile data with new profile picture
      if (profileData) {
        const updatedProfileData = {
          ...profileData,
          profilePicture: response.file.url
        };
        setProfileData(updatedProfileData);

        // Also save the profile picture to the backend
        await candidateService.updateCompleteProfile({
          profilePicture: response.file.url
        });

        // Update the user profile in auth context to sync with navbar
        updateUserProfile({
          profilePicture: response.file.url
        });
      }

      addNotification('Profile Picture Updated', 'Profile picture updated successfully!', {
        type: 'success'
      });
    } catch (err: any) {
      console.error('Failed to upload profile picture:', err);
      addNotification('Profile Picture Update Failed', 'Failed to upload profile picture. Please try again.', {
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Error state
  if (error && !profileData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate component based on mode
  return (
    <div className={className}>
      {error && (
        <Alert type="error" className="mb-4" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {mode === 'edit' ? (
        <CandidateProfileEdit
          profileData={profileData || undefined}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          onProfilePictureUpload={handleProfilePictureUpload}
        />
      ) : (
        <CandidateProfileView
          candidateId={candidateId}
          profileData={profileData || undefined}
          editable={true}
          onEdit={handleEdit}
          onProfilePictureUpload={handleProfilePictureUpload}
        />
      )}
    </div>
  );
};

export default CandidateProfileManager;
