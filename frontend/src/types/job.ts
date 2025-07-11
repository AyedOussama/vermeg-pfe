// Enhanced Job and Application Types for Complete Workflow

export interface JobSkill {
  name: string;
  isRequired: boolean;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  description: string;
  yearsRequired?: number;
}

// Technical Quiz Types
export interface TechnicalQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'code' | 'scenario';
  category: 'programming' | 'system_design' | 'algorithms' | 'database' | 'frameworks' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  timeLimit?: number; // in minutes
  explanation?: string;
  codeTemplate?: string; // for code questions
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

export interface TechnicalQuiz {
  id: string;
  title: string;
  description: string;
  questions: TechnicalQuestion[];
  totalPoints: number;
  timeLimit: number; // in minutes
  passingScore: number;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

// HR Quiz Types
export interface HRQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'behavioral' | 'scenario';
  category: 'communication' | 'teamwork' | 'leadership' | 'problem_solving' | 'cultural_fit' | 'motivation' | 'adaptability';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  timeLimit?: number;
  required: boolean;
  description?: string;
  evaluationCriteria?: string[];
}

export interface HRQuiz {
  id: string;
  title: string;
  description: string;
  questions: HRQuestion[];
  totalPoints: number;
  timeLimit: number;
  passingScore: number;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

// Job Status Workflow
export type JobStatus =
  | 'draft'                    // Project Leader creating
  | 'pending_hr_enhancement'   // Waiting for HR to add components
  | 'hr_enhancement_complete'  // HR has added components
  | 'pending_ceo_approval'     // Waiting for CEO approval
  | 'approved'                 // CEO approved
  | 'published'                // Live and accepting applications
  | 'paused'                   // Temporarily paused
  | 'closed'                   // No longer accepting applications
  | 'rejected'                 // CEO rejected
  | 'archived';                // Archived

// Workflow Participants
export interface WorkflowParticipant {
  id: string;
  name: string;
  email: string;
  role: 'PROJECT_LEADER' | 'HR' | 'CEO';
  actionDate?: string;
  feedback?: string;
}

// Job Workflow History
export interface JobWorkflowEvent {
  id: string;
  type: 'created' | 'hr_enhanced' | 'submitted_for_approval' | 'approved' | 'rejected' | 'published' | 'paused' | 'closed';
  actor: WorkflowParticipant;
  timestamp: string;
  notes?: string;
  feedback?: string;
}

// Complete Job Interface
export interface Job {
  id: string;
  title: string;
  department: string;
  division?: string;
  location: string;
  workType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'PRINCIPAL';

  // Salary Information
  salaryRangeMin: number;
  salaryRangeMax: number;
  currency: 'TND' | 'USD' | 'EUR';
  displaySalary: boolean;

  // Experience Requirements
  minExperience: number;
  maxExperience?: number;

  // Job Content
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  companyInfo?: string;

  // Skills and Requirements
  skills: JobSkill[];
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

  // Workflow Status
  status: JobStatus;
  workflowHistory: JobWorkflowEvent[];

  // Participants
  projectLeader: WorkflowParticipant;
  hrManager?: WorkflowParticipant;
  ceoApprover?: WorkflowParticipant;

  // Assessments
  technicalQuiz?: TechnicalQuiz;
  hrQuiz?: HRQuiz;

  // Analytics
  viewsCount: number;
  applicationsCount: number;
  averageApplicationScore?: number;

  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  closedAt?: string;
}

// Application Types
export type ApplicationStatus =
  | 'submitted'           // Initial application submitted
  | 'technical_review'    // Taking technical assessment
  | 'hr_review'          // Taking HR assessment
  | 'under_review'       // Project Leader reviewing
  | 'interview_scheduled' // Interview scheduled
  | 'interview_completed' // Interview completed
  | 'pending_decision'   // Awaiting final decision
  | 'accepted'           // Accepted for position
  | 'rejected'           // Rejected
  | 'withdrawn';         // Candidate withdrew

// Assessment Results
export interface AssessmentResult {
  id: string;
  type: 'technical' | 'hr';
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  maxScore: number;
  percentage?: number;
  passed: boolean;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number; // in minutes
  answers: Record<string, any>;
  feedback?: string;
}

// Application Documents
export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript' | 'other';
  url: string;
  size: number;
  uploadedAt: string;
  verified?: boolean;
}

// Interview Information


// Application Timeline
export interface ApplicationTimelineEvent {
  id: string;
  type: 'submitted' | 'assessment_started' | 'assessment_completed' | 'reviewed' | 'interview_scheduled' | 'interview_completed' | 'decision_made' | 'status_changed';
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, any>;
}

// Interview Interface
export interface Interview {
  id: string;
  applicationId: string;
  candidateId: string;
  rhUserId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;

  // Interview Details
  scheduledDate: string; // ISO date string
  scheduledTime: string; // HH:MM format
  duration: number; // in minutes
  type: 'phone' | 'video' | 'in_person';
  location?: string; // for in-person or video link

  // Status and Management
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
  rating?: number; // 1-5 scale

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Notifications
  candidateNotified: boolean;
  reminderSent: boolean;
}

// Message Interface for RH-Candidate Communication
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'RH' | 'CANDIDATE';
  recipientId: string;
  recipientName: string;
  recipientRole: 'RH' | 'CANDIDATE';

  // Message Content
  content: string;
  type: 'text' | 'interview_notification' | 'system';

  // Status
  isRead: boolean;
  readAt?: string;

  // Timestamps
  sentAt: string;

  // Related Data
  applicationId?: string;
  interviewId?: string;
}

// Conversation Interface
export interface Conversation {
  id: string;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  rhUserId: string;
  rhUserName: string;
  jobTitle: string;

  // Status
  lastMessageAt: string;
  unreadCount: number;
  isActive: boolean;

  // Messages
  messages: Message[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Complete Application Interface
export interface Application {
  id: string;
  jobId: string;
  candidateId: string;

  // Job Information (denormalized for quick access)
  jobTitle: string;
  department: string;
  location: string;

  // Application Status
  status: ApplicationStatus;
  priority: 'low' | 'medium' | 'high';

  // Candidate Information
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    profilePicture?: string;
    summary?: string;
    experience: number;
    education: string;
    currentPosition?: string;
    expectedSalary?: string;
    availabilityToStart?: string;
    workPreference?: 'remote' | 'onsite' | 'hybrid';
  };

  // Application Content
  coverLetter?: string;
  additionalComments?: string;
  documents: ApplicationDocument[];

  // Assessments
  technicalAssessment?: AssessmentResult;
  hrAssessment?: AssessmentResult;
  overallScore?: number;

  // Interviews
  interviews: Interview[];
  scheduledInterview?: Interview;

  // Decision Information
  projectLeaderDecision?: {
    decision: 'accept' | 'reject' | 'pending';
    feedback?: string;
    rating?: number;
    decidedAt?: string;
    decidedBy: string;
    nextSteps?: string;
  };

  // RH Interview Scheduling (after acceptance)
  rhInterviewScheduling?: {
    isScheduled: boolean;
    scheduledBy?: string;
    scheduledAt?: string;
    interviewId?: string;
    candidateNotified?: boolean;
  };

  // Communication
  conversationId?: string;
  hasUnreadMessages?: boolean;

  // Timeline and Metadata
  timeline: ApplicationTimelineEvent[];
  appliedAt: string;
  lastUpdatedAt: string;

  // Internal Notes and Tags
  internalNotes?: string;
  tags: string[];

  // Analytics
  viewedByProjectLeader?: boolean;
  viewedAt?: string;
}

// Job Filter Interface
export interface JobFilter {
  search: string;
  location: string;
  department: string;
  workType: string[];
  employmentType: string[];
  level: string[];
  experienceMin: number;
  experienceMax: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  skills: string[];
  featuredOnly: boolean;
  urgentOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'salary_high' | 'salary_low' | 'relevance';
}

// Application Filter Interface
export interface ApplicationFilter {
  search: string;
  status: ApplicationStatus[];
  priority: string[];
  scoreMin: number;
  scoreMax: number;
  appliedDateFrom?: string;
  appliedDateTo?: string;
  jobId?: string;
  sortBy: 'newest' | 'oldest' | 'score_high' | 'score_low' | 'name';
}