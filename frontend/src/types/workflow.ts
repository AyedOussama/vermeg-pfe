// Workflow Management Types for Recruitment Platform

import { Job, Application, TechnicalQuiz, HRQuiz } from './job';

// Workflow Stage Definitions
export type WorkflowStage = 
  | 'job_creation'           // Stage 1: Project Leader creates job
  | 'hr_enhancement'         // Stage 2: HR adds behavioral components
  | 'ceo_approval'          // Stage 3: CEO reviews and approves
  | 'public_application'    // Stage 4: Candidates apply and take assessments
  | 'project_leader_decision'; // Stage 5: Project Leader makes hiring decisions

// Notification Types
export interface WorkflowNotification {
  id: string;
  type: 'job_created' | 'hr_enhancement_required' | 'ceo_approval_required' | 'job_approved' | 'job_rejected' | 'application_received' | 'assessment_completed' | 'decision_required';
  title: string;
  message: string;
  recipientId: string;
  recipientRole: 'PROJECT_LEADER' | 'HR' | 'CEO';
  relatedJobId?: string;
  relatedApplicationId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

// Job Creation Data (Stage 1)
export interface JobCreationData {
  // Basic Information
  title: string;
  department: string;
  division?: string;
  location: string;
  workType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';
  
  // Compensation
  salaryRangeMin: number;
  salaryRangeMax: number;
  currency: 'TND' | 'USD' | 'EUR';
  displaySalary: boolean;
  
  // Requirements
  minExperience: number;
  maxExperience?: number;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  
  // Skills and Education
  skills: Array<{
    name: string;
    isRequired: boolean;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsRequired?: number;
  }>;
  requiredEducation: string[];
  preferredEducation?: string[];
  certifications?: string[];
  languages?: string[];
  
  // Job Settings
  numberOfPositions: number;
  applicationDeadline?: string;
  startDate?: string;
  urgent: boolean;
  featured: boolean;
  
  // Technical Assessment
  technicalQuiz: TechnicalQuiz;
}

// HR Enhancement Data (Stage 2)
export interface HREnhancementData {
  jobId: string;
  hrQuiz: HRQuiz;
  culturalFitCriteria: string[];
  behavioralCompetencies: string[];
  teamDynamicsAssessment: string;
  companyValuesAlignment: string[];
  additionalNotes?: string;
  enhancedAt: string;
  enhancedBy: string;
}

// CEO Approval Data (Stage 3)
export interface CEOApprovalData {
  jobId: string;
  decision: 'approve' | 'reject' | 'request_modifications';
  feedback?: string;
  requestedModifications?: Array<{
    section: 'job_details' | 'technical_quiz' | 'hr_quiz' | 'requirements';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  approvedAt?: string;
  approvedBy: string;
  nextReviewDate?: string;
}

// Application Submission Data (Stage 4)
export interface ApplicationSubmissionData {
  jobId: string;
  candidateId: string;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentLocation: string;
    dateOfBirth?: string;
  };
  
  // Professional Information
  professionalInfo: {
    currentPosition?: string;
    experience: number;
    education: string;
    expectedSalary?: string;
    availabilityToStart?: string;
    workPreference?: 'remote' | 'onsite' | 'hybrid';
    summary?: string;
  };
  
  // Application Content
  coverLetter?: string;
  additionalComments?: string;
  
  // Documents
  documents: Array<{
    type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript' | 'other';
    file: File;
    name: string;
  }>;
  
  // URLs
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
}

// Project Leader Decision Data (Stage 5)
export interface ProjectLeaderDecisionData {
  applicationId: string;
  decision: 'accept' | 'reject' | 'pending';
  feedback?: string;
  rating?: number;
  nextSteps?: string;
  interviewRequired?: boolean;
  interviewType?: 'technical' | 'hr' | 'final' | 'panel';
  expectedStartDate?: string;
  salaryOffer?: number;
  additionalBenefits?: string[];
  internalNotes?: string;
  decidedAt: string;
}

// Workflow Analytics
export interface WorkflowAnalytics {
  jobId: string;
  
  // Stage Metrics
  stageMetrics: {
    stage: WorkflowStage;
    startedAt: string;
    completedAt?: string;
    duration?: number; // in hours
    actor?: string;
  }[];
  
  // Application Metrics
  applicationMetrics: {
    totalApplications: number;
    technicalPassRate: number;
    hrPassRate: number;
    overallPassRate: number;
    averageApplicationScore: number;
    averageTimeToDecision: number; // in days
  };
  
  // Performance Metrics
  performanceMetrics: {
    timeToHREnhancement?: number; // in hours
    timeToCEOApproval?: number; // in hours
    timeToPublication?: number; // in hours
    totalWorkflowTime?: number; // in hours
  };
}

// Workflow State Management
export interface WorkflowState {
  currentStage: WorkflowStage;
  completedStages: WorkflowStage[];
  pendingActions: Array<{
    stage: WorkflowStage;
    actor: 'PROJECT_LEADER' | 'HR' | 'CEO';
    action: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  blockers?: Array<{
    stage: WorkflowStage;
    reason: string;
    resolvedBy?: string;
    resolvedAt?: string;
  }>;
}

// Export all workflow-related types
export type {
  WorkflowStage,
  WorkflowNotification,
  JobCreationData,
  HREnhancementData,
  CEOApprovalData,
  ApplicationSubmissionData,
  ProjectLeaderDecisionData,
  WorkflowAnalytics,
  WorkflowState
};
