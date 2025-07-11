// Enhanced types for candidate profile management

export interface CandidateProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  summary?: string;
  profilePicture?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  
  // Professional Information
  currentPosition?: string;
  yearsOfExperience?: number;
  expectedSalaryRange?: string;
  availabilityToStart?: string;
  workPreference?: 'remote' | 'onsite' | 'hybrid';
  
  // Resume/CV
  resume?: ResumeFile;
  
  // Professional Sections
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
  portfolio: PortfolioItem[];
  
  // Preferences
  preferredJobCategories: string[];
  preferredLocations: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  profileCompleteness?: number;
  isPublic?: boolean;
}

export interface ResumeFile {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  type: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  achievements?: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
  location?: string;
  honors?: string[];
  relevantCoursework?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Tool' | 'Framework' | 'Other';
  yearsOfExperience?: number;
  endorsed?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  description?: string;
  skills?: string[];
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  certificationLevel?: string;
  certificationName?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  technologies: string[];
  type: 'Project' | 'Publication' | 'Award' | 'Presentation' | 'Other';
  startDate?: string;
  endDate?: string;
  role?: string;
  achievements?: string[];
}

// Form data types for editing
export interface PersonalInfoFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  currentPosition?: string;
  yearsOfExperience?: number;
  expectedSalaryRange?: string;
  availabilityToStart?: string;
  workPreference?: 'remote' | 'onsite' | 'hybrid';
}

export interface WorkExperienceFormData {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  achievements?: string[];
  technologies?: string[];
}

export interface EducationFormData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
  location?: string;
  honors?: string[];
  relevantCoursework?: string[];
}

export interface SkillFormData {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Tool' | 'Framework' | 'Other';
  yearsOfExperience?: number;
}

export interface CertificationFormData {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
  description?: string;
  skills?: string[];
}

export interface LanguageFormData {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
  certificationLevel?: string;
  certificationName?: string;
}

export interface PortfolioItemFormData {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  technologies: string[];
  type: 'Project' | 'Publication' | 'Award' | 'Presentation' | 'Other';
  startDate?: string;
  endDate?: string;
  role?: string;
  achievements?: string[];
}

// API response types
export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: CandidateProfileData;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file: ResumeFile;
}

// Validation schemas
export interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  completeness: number;
}

// Profile section types for navigation
export type ProfileSection = 
  | 'personal' 
  | 'experience' 
  | 'education' 
  | 'skills' 
  | 'certifications' 
  | 'languages' 
  | 'portfolio' 
  | 'preferences';

// Profile view modes
export type ProfileViewMode = 'view' | 'edit';

// Profile privacy settings
export interface ProfilePrivacySettings {
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSalaryExpectations: boolean;
  allowRecruiterContact: boolean;
}
