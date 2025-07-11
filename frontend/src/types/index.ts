// types/index.ts - Main type exports for the recruitment platform

// Re-export all job and application related types
export * from './job';
export * from './workflow';
export * from './auth';
export * from './user';
export * from './candidateProfile';
export * from './common';
export * from './navigation';
export * from './api';

// Legacy interfaces for backward compatibility
export interface NavItem {
  id: string;
  label: string;
}

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export interface FormData {
  search: string;
  location: string;
  department: string;
  position: string;
}

export interface ModalStates {
  showCandidateModal: boolean;
  showInternalModal: boolean;
  selectedJob: Job | null;
}

export interface UIStates {
  isSignup: boolean;
  showPassword: boolean;
  isAuthenticated: boolean;
  selectedCountryCode: string;
  showCountryDropdown: boolean;
  mobileMenuOpen: boolean;
  filterOpen: boolean;
}

export interface FilterCriteria {
  experienceMin: number;
  selectedEmploymentTypes: string[];
  featuredOnly: boolean;
  remoteOnly: boolean;
}

export interface InternalFormData {
  username: string;
  password: string;
  role: string;
}

export interface CandidateFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onApply: () => void;
  isAuthenticated: boolean;
}



export interface CandidateModalProps {
  isSignup: boolean;
  showPassword: boolean;
  selectedCountryCode: string;
  countryCodes: CountryCode[];
  showCountryDropdown: boolean;
  onToggleSignup: () => void;
  onTogglePassword: () => void;
  onSelectCountryCode: (code: string) => void;
  onToggleCountryDropdown: () => void;
  onAuthenticate: () => void;
}

export interface InternalModalProps {
  onSubmit: (formData: InternalFormData) => void;
}