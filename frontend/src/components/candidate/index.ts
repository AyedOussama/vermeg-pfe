// Export all candidate-related components
export { default as CandidateProfile } from './CandidateProfile';
export { default as CandidateProfileView } from './CandidateProfileView';
export { default as CandidateProfileEdit } from './CandidateProfileEdit';
export { default as CandidateProfileManager } from './CandidateProfileManager';
export { default as CandidateSettings } from './CandidateSettings';
export { default as JobSearch } from './JobSearch';
export { default as MyApplications } from './MyApplications';
export { default as Assessment } from './Assessment';

// Re-export types for convenience
export type {
  CandidateProfileData,
  PersonalInfoFormData,
  WorkExperienceFormData,
  EducationFormData,
  SkillFormData,
  CertificationFormData,
  LanguageFormData,
  PortfolioItemFormData,
  ProfileSection,
  ProfileViewMode,
  ProfilePrivacySettings
} from '@/types/candidateProfile';
