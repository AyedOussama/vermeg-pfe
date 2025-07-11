export interface User {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  roles: string[];
  enabled: boolean;
  phone?: string;
  department?: string;
  userType: 'CANDIDATE' | 'INTERNAL';
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile; // Extended profile data
}

export interface UserProfile {
  phone?: string;
  dateOfBirth?: string;
  currentLocation?: string;
  educationLevel?: string;
  yearsOfExperience?: string;
  coverLetter?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  preferredJobCategories?: string[];
  expectedSalaryRange?: string;
  availabilityToStart?: string;
  workPreference?: 'remote' | 'onsite' | 'hybrid';
  currentPosition?: string;
  summary?: string;
  profilePicture?: string;
  resume?: {
    id: string;
    filename: string;
    url: string;
    uploadedAt: string;
    size: number;
  };
  experience?: any[];
  education?: any[];
  skills?: any[];
  certifications?: any[];
  languages?: any[];
  portfolio?: any[];
  preferredLocations?: string[];
  profileCompleteness?: number;
  isPublic?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CandidateRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  dateOfBirth?: string;
  preferredCategories?: string[];
  cvFile: File;
}

export interface ProjectLeaderRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  yearsInManagement: number;
  teamSizeResponsibility: number;
  technicalExpertiseAreas: string[];
  companyDivision: string;
  officeLocation: string;
  managerApprovalCode: string;
  professionalCertifications: string[];
  linkedinUrl?: string;
}

export interface RHRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  employeeId: string;
  hrDepartmentDivision: string;
  yearsInHRExperience: number;
  hrCertifications: string[];
  specializationAreas: string[];
  officeLocation: string;
  managerApprovalCode: string;
  professionalLicenseNumber: string;
  educationalBackground: string;
  languagesSpoken: string[];
}

export interface InternalLoginData {
  username: string;
  password: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  roles?: string[];
  expiresIn?: number;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'RH'
  | 'PROJECT_LEADER'
  | 'CEO'
  | 'CANDIDATE';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginCandidate: (data: CandidateRegistrationData) => Promise<void>;
  loginInternal: (data: InternalLoginData) => Promise<void>;
  register: (data: CandidateRegistrationData) => Promise<void>;
  registerProjectLeader: (data: ProjectLeaderRegistrationData) => Promise<void>;
  registerRH: (data: RHRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
}