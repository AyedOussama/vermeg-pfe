// ============================================================================
// COMPREHENSIVE DUMMY DATA FOR VERMEG RECRUITMENT PLATFORM
// ============================================================================

export interface User {
  id: string;
  keycloakId?: string;
  username?: string;
  name?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role?: 'CANDIDATE' | 'PROJECT_LEADER' | 'RH' | 'CEO';
  roles?: string[];
  phone?: string;
  avatar?: string;
  department?: string;
  userType?: string;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// Simple mock authentication state
export interface MockAuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Global mock auth state
let mockAuthState: MockAuthState = {
  isAuthenticated: false,
  user: null
};

export interface Job {
  id: string;
  title: string;
  department: string;
  status: 'Draft' | 'HR_Review' | 'CEO_Approval' | 'Published' | 'Closed';
  createdBy: string;
  enhancedBy?: string;
  approvedBy?: string;
  applications: number;
  technicalQuestions: number;
  hrQuestions: number;
  location: string;
  type: string;
  level: string;
  salary: string;
  posted: string;
  description: string;
  skills: Array<{
    name: string;
    isRequired: boolean;
    level: string;
  }>;
  tags: string[];
  featured?: boolean;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'Submitted' | 'Technical Review' | 'HR Review' | 'Under Review' | 'Interview Scheduled' | 'Rejected' | 'Accepted';
  technicalScore?: number;
  hrScore?: number;
  submitDate: string;
  lastUpdated: string;
  notes?: string;
  interviewScheduled?: boolean;
  interviewDate?: string;
  documents: Array<{
    type: string;
    url: string;
  }>;
}

// Pre-defined CEO (no registration required)
export const CEO_USER: User = {
  id: "CEO001",
  keycloakId: "keycloak_CEO001",
  username: "ceo@vermeg.com",
  email: "ceo@vermeg.com",
  firstName: "John",
  lastName: "Smith",
  fullName: "John Smith",
  roles: ["CEO"],
  enabled: true,
  phone: "+352-26-12-34-50",
  department: "Executive",
  userType: "INTERNAL",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  // Legacy fields for compatibility
  name: "John Smith",
  role: "CEO",
  avatar: "/images/ceo-avatar.jpg",
  employeeId: "CEO001",
  accessLevel: "Executive",
  // Demo password for development
  demoPassword: "demo123"
};

// Sample Candidates
export const SAMPLE_CANDIDATES: User[] = [
  {
    id: "CAND001",
    name: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    role: "CANDIDATE",
    phone: "+1-555-0123",
    dateOfBirth: "1995-03-15",
    location: "New York, USA",
    education: "Bachelor's in Computer Science",
    experience: "3 years",
    resumeUrl: "/documents/sarah-johnson-resume.pdf",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    portfolioUrl: "https://github.com/sarahjohnson",
    preferredCategories: ["Software Development", "Frontend"],
    expectedSalary: "60000-80000",
    availability: "Immediately",
    avatar: "/images/candidate-1.jpg"
  },
  {
    id: "CAND002",
    name: "Ahmed Ben Ali",
    firstName: "Ahmed",
    lastName: "Ben Ali",
    email: "ahmed.benali@email.com",
    role: "CANDIDATE",
    phone: "+216-98-123-456",
    dateOfBirth: "1992-07-22",
    location: "Tunis, Tunisia",
    education: "Master's in Data Science",
    experience: "5 years",
    resumeUrl: "/documents/ahmed-benali-resume.pdf",
    linkedinUrl: "https://linkedin.com/in/ahmedbenali",
    preferredCategories: ["Data Science", "Analytics"],
    expectedSalary: "45000-65000",
    availability: "2 weeks notice",
    avatar: "/images/candidate-2.jpg"
  },
  {
    id: "CAND003",
    name: "Maria Garcia",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@email.com",
    role: "CANDIDATE",
    phone: "+34-612-345-678",
    dateOfBirth: "1990-11-08",
    location: "Madrid, Spain",
    education: "Master's in Software Engineering",
    experience: "6 years",
    resumeUrl: "/documents/maria-garcia-resume.pdf",
    linkedinUrl: "https://linkedin.com/in/mariagarcia",
    portfolioUrl: "https://mariagarcia.dev",
    preferredCategories: ["Full Stack Development", "DevOps"],
    expectedSalary: "55000-75000",
    availability: "1 month notice",
    avatar: "/images/candidate-3.jpg"
  }
];

// Sample Project Leaders
export const SAMPLE_PROJECT_LEADERS: User[] = [
  {
    id: "PL001",
    name: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@vermeg.com",
    role: "PROJECT_LEADER",
    phone: "+33-1-23-45-67-89",
    employeeId: "PL001",
    department: "Engineering",
    jobTitle: "Senior Engineering Manager",
    yearsInManagement: 7,
    teamSize: 12,
    technicalExpertise: ["Java", "Angular", "Microservices", "Cloud Architecture"],
    division: "Product Development",
    officeLocation: "Paris, France",
    managerApprovalCode: "MGR2024001",
    certifications: ["AWS Solutions Architect", "Scrum Master"],
    linkedinUrl: "https://linkedin.com/in/michaelchen",
    avatar: "/images/project-leader-1.jpg"
  },
  {
    id: "PL002",
    name: "Lisa Thompson",
    firstName: "Lisa",
    lastName: "Thompson",
    email: "l.thompson@vermeg.com",
    role: "PROJECT_LEADER",
    phone: "+352-26-78-90-12",
    employeeId: "PL002",
    department: "Data Analytics",
    jobTitle: "Data Science Manager",
    yearsInManagement: 5,
    teamSize: 8,
    technicalExpertise: ["Python", "Machine Learning", "Big Data", "Analytics"],
    division: "Analytics",
    officeLocation: "Luxembourg",
    managerApprovalCode: "MGR2024002",
    certifications: ["Google Cloud Professional", "Data Science Certification"],
    linkedinUrl: "https://linkedin.com/in/lisathompson",
    avatar: "/images/project-leader-2.jpg"
  }
];

// Sample HR Managers
export const SAMPLE_HR_MANAGERS: User[] = [
  {
    id: "HR001",
    name: "Emma Wilson",
    firstName: "Emma",
    lastName: "Wilson",
    email: "e.wilson@vermeg.com",
    role: "RH",
    phone: "+352-26-12-34-56",
    employeeId: "HR001",
    hrDivision: "Talent Acquisition",
    yearsInHR: 8,
    certifications: ["SHRM-CP", "PHR"],
    specializations: ["Technical Recruitment", "Behavioral Assessment"],
    officeLocation: "Luxembourg",
    managerApprovalCode: "HR2024001",
    professionalLicense: "HR-LUX-2024-001",
    education: "Master's in Human Resources",
    languages: ["English", "French", "German"],
    avatar: "/images/hr-manager-1.jpg"
  },
  {
    id: "HR002",
    name: "Sophie Dubois",
    firstName: "Sophie",
    lastName: "Dubois",
    email: "s.dubois@vermeg.com",
    role: "RH",
    phone: "+33-1-45-67-89-01",
    employeeId: "HR002",
    hrDivision: "Employee Development",
    yearsInHR: 6,
    certifications: ["CIPD", "Coaching Certification"],
    specializations: ["Training & Development", "Performance Management"],
    officeLocation: "Paris, France",
    managerApprovalCode: "HR2024002",
    professionalLicense: "HR-FR-2024-002",
    education: "Master's in Psychology",
    languages: ["French", "English", "Spanish"],
    avatar: "/images/hr-manager-2.jpg"
  }
];

// Sample Jobs
export const SAMPLE_JOBS: Job[] = [
  {
    id: "JOB001",
    title: "Senior Frontend Developer",
    department: "Engineering",
    status: "Published",
    createdBy: "PL001",
    enhancedBy: "HR001",
    approvedBy: "CEO001",
    applications: 15,
    technicalQuestions: 8,
    hrQuestions: 6,
    location: "Paris, France",
    type: "Full-time",
    level: "Senior",
    salary: "€60K - €80K",
    posted: "2025-06-15",
    description: "We are looking for an experienced Frontend Developer to join our engineering team and build next-generation financial applications.",
    skills: [
      { name: "Angular", isRequired: true, level: "ADVANCED" },
      { name: "TypeScript", isRequired: true, level: "ADVANCED" },
      { name: "JavaScript", isRequired: true, level: "INTERMEDIATE" },
      { name: "CSS/SCSS", isRequired: true, level: "INTERMEDIATE" },
      { name: "RxJS", isRequired: false, level: "INTERMEDIATE" }
    ],
    tags: ["Angular", "TypeScript", "Frontend", "JavaScript"],
    featured: true
  },
  {
    id: "JOB002",
    title: "Data Science Manager",
    department: "Analytics",
    status: "HR_Review",
    createdBy: "PL002",
    enhancedBy: undefined,
    approvedBy: undefined,
    applications: 0,
    technicalQuestions: 10,
    hrQuestions: 0,
    location: "Luxembourg",
    type: "Full-time",
    level: "Manager",
    salary: "€80K - €100K",
    posted: "2025-06-18",
    description: "Lead our data science initiatives and build advanced analytics solutions for financial services.",
    skills: [
      { name: "Python", isRequired: true, level: "ADVANCED" },
      { name: "Machine Learning", isRequired: true, level: "ADVANCED" },
      { name: "Leadership", isRequired: true, level: "INTERMEDIATE" },
      { name: "SQL", isRequired: true, level: "ADVANCED" },
      { name: "TensorFlow", isRequired: false, level: "INTERMEDIATE" }
    ],
    tags: ["Python", "Machine Learning", "Leadership", "Analytics"],
    featured: false
  },
  {
    id: "JOB003",
    title: "Full Stack Developer",
    department: "Engineering",
    status: "CEO_Approval",
    createdBy: "PL001",
    enhancedBy: "HR001",
    approvedBy: undefined,
    applications: 0,
    technicalQuestions: 12,
    hrQuestions: 8,
    location: "Tunis, Tunisia",
    type: "Full-time",
    level: "Mid-Senior",
    salary: "€40K - €60K",
    posted: "2025-06-19",
    description: "Join our development team to build scalable web applications using modern technologies.",
    skills: [
      { name: "React", isRequired: true, level: "ADVANCED" },
      { name: "Node.js", isRequired: true, level: "INTERMEDIATE" },
      { name: "MongoDB", isRequired: true, level: "INTERMEDIATE" },
      { name: "Express.js", isRequired: true, level: "INTERMEDIATE" },
      { name: "Docker", isRequired: false, level: "BEGINNER" }
    ],
    tags: ["React", "Node.js", "Full Stack", "MongoDB"],
    featured: false
  }
];

// Sample Applications
export const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: "APP001",
    candidateId: "CAND001",
    jobId: "JOB001",
    status: "Under Review",
    technicalScore: 85,
    hrScore: 78,
    submitDate: "2025-06-15",
    lastUpdated: "2025-06-20",
    notes: "Strong technical background, good communication skills. Recommended for interview.",
    interviewScheduled: false,
    documents: [
      { type: "resume", url: "/documents/sarah-johnson-resume.pdf" },
      { type: "cover_letter", url: "/documents/sarah-johnson-cover.pdf" }
    ]
  },
  {
    id: "APP002",
    candidateId: "CAND002",
    jobId: "JOB002",
    status: "Technical Review",
    technicalScore: 92,
    hrScore: undefined,
    submitDate: "2025-06-18",
    lastUpdated: "2025-06-19",
    notes: "Excellent technical skills in data science. Awaiting HR assessment.",
    interviewScheduled: true,
    interviewDate: "2025-06-25",
    documents: [
      { type: "resume", url: "/documents/ahmed-benali-resume.pdf" }
    ]
  },
  {
    id: "APP003",
    candidateId: "CAND003",
    jobId: "JOB001",
    status: "Interview Scheduled",
    technicalScore: 88,
    hrScore: 82,
    submitDate: "2025-06-16",
    lastUpdated: "2025-06-21",
    notes: "Excellent full-stack experience. Interview scheduled for next week.",
    interviewScheduled: true,
    interviewDate: "2025-06-26",
    documents: [
      { type: "resume", url: "/documents/maria-garcia-resume.pdf" },
      { type: "portfolio", url: "/documents/maria-garcia-portfolio.pdf" }
    ]
  }
];

// Sample Technical Questions
export const SAMPLE_TECHNICAL_QUESTIONS = [
  {
    id: "TQ001",
    jobId: "JOB001",
    question: "What is the difference between Angular services and components?",
    type: "multiple_choice",
    options: [
      "Services handle business logic, components handle UI",
      "Services are for data, components are for styling",
      "No difference, they're the same",
      "Services are deprecated in Angular"
    ],
    correctAnswer: 0,
    points: 10,
    difficulty: "intermediate"
  },
  {
    id: "TQ002",
    jobId: "JOB001",
    question: "Explain the concept of dependency injection in Angular",
    type: "text",
    points: 15,
    difficulty: "advanced",
    sampleAnswer: "Dependency injection is a design pattern where dependencies are provided to a class rather than the class creating them itself..."
  },
  {
    id: "TQ003",
    jobId: "JOB002",
    question: "What is the difference between supervised and unsupervised learning?",
    type: "text",
    points: 12,
    difficulty: "intermediate",
    sampleAnswer: "Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data..."
  }
];

// Sample HR Questions
export const SAMPLE_HR_QUESTIONS = [
  {
    id: "HQ001",
    jobId: "JOB001",
    question: "Describe a challenging project you worked on and how you overcame obstacles",
    type: "text",
    points: 10,
    category: "problem_solving"
  },
  {
    id: "HQ002",
    jobId: "JOB001",
    question: "How do you handle working under tight deadlines?",
    type: "multiple_choice",
    options: [
      "Prioritize tasks and communicate with stakeholders",
      "Work overtime until completion",
      "Ask for deadline extension",
      "Delegate all tasks to team members"
    ],
    correctAnswer: 0,
    points: 8,
    category: "time_management"
  },
  {
    id: "HQ003",
    jobId: "JOB002",
    question: "How do you motivate team members during challenging projects?",
    type: "text",
    points: 12,
    category: "leadership"
  }
];

// Sample Notifications
export const SAMPLE_NOTIFICATIONS = {
  CANDIDATE: [
    {
      id: "NOTIF001",
      userId: "CAND001",
      type: "application_status",
      title: "Application Status Update",
      message: "Your application for Senior Frontend Developer has been reviewed",
      timestamp: "2025-06-20T10:30:00Z",
      read: false,
      actionUrl: "/candidate/applications/APP001"
    },
    {
      id: "NOTIF002",
      userId: "CAND001",
      type: "interview_scheduled",
      title: "Interview Scheduled",
      message: "Interview scheduled for June 25th at 2:00 PM",
      timestamp: "2025-06-19T14:15:00Z",
      read: true,
      actionUrl: "/candidate/interviews"
    }
  ],
  PROJECT_LEADER: [
    {
      id: "NOTIF003",
      userId: "PL001",
      type: "new_application",
      title: "New Application Received",
      message: "New application for Senior Frontend Developer position",
      timestamp: "2025-06-20T09:45:00Z",
      read: false,
      actionUrl: "/rh/applications"
    },
    {
      id: "NOTIF004",
      userId: "PL001",
      type: "job_approved",
      title: "Job Posting Approved",
      message: "Senior Frontend Developer position has been approved and published",
      timestamp: "2025-06-15T16:20:00Z",
      read: true,
      actionUrl: "/project-leader/jobs/JOB001"
    }
  ],
  RH: [
    {
      id: "NOTIF005",
      userId: "HR001",
      type: "job_enhancement_request",
      title: "Job Enhancement Required",
      message: "Data Science Manager position needs HR components",
      timestamp: "2025-06-18T16:20:00Z",
      read: false,
      actionUrl: "/rh/dashboard"
    },
    {
      id: "NOTIF006",
      userId: "HR001",
      type: "candidate_assessment",
      title: "Candidate Assessment Complete",
      message: "HR assessment completed for Sarah Johnson",
      timestamp: "2025-06-20T11:45:00Z",
      read: false,
      actionUrl: "/rh/assessments/APP001"
    }
  ],
  CEO: [
    {
      id: "NOTIF007",
      userId: "CEO001",
      type: "approval_required",
      title: "Job Approval Required",
      message: "Full Stack Developer position ready for approval",
      timestamp: "2025-06-19T11:30:00Z",
      read: false,
      actionUrl: "/ceo/approvals"
    },
    {
      id: "NOTIF008",
      userId: "CEO001",
      type: "platform_metrics",
      title: "Weekly System Analytics Report",
      message: "System analytics and platform metrics for this week",
      timestamp: "2025-06-21T09:00:00Z",
      read: false,
      actionUrl: "/ceo/analytics"
    }
  ]
};

// Role-based color themes
export const ROLE_THEMES = {
  CANDIDATE: {
    primary: "#3B82F6",
    secondary: "#1E40AF",
    accent: "#60A5FA",
    background: "#EFF6FF",
    text: "#1E3A8A"
  },
  PROJECT_LEADER: {
    primary: "#16A34A",
    secondary: "#15803D",
    accent: "#22C55E",
    background: "#F0FDF4",
    text: "#14532D"
  },
  RH: {
    primary: "#EA580C",
    secondary: "#C2410C",
    accent: "#FB923C",
    background: "#FFF7ED",
    text: "#9A3412"
  },
  CEO: {
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#A78BFA",
    background: "#F5F3FF",
    text: "#5B21B6"
  }
};

// Helper functions to get data
export const getUserById = (id: string): User | undefined => {
  const allUsers = [CEO_USER, ...SAMPLE_CANDIDATES, ...SAMPLE_PROJECT_LEADERS, ...SAMPLE_HR_MANAGERS];
  return allUsers.find(user => user.id === id);
};

export const getJobById = (id: string): Job | undefined => {
  return SAMPLE_JOBS.find(job => job.id === id);
};

export const getApplicationById = (id: string): Application | undefined => {
  return SAMPLE_APPLICATIONS.find(app => app.id === id);
};

export const getApplicationsByUserId = (userId: string): Application[] => {
  return SAMPLE_APPLICATIONS.filter(app => app.candidateId === userId);
};

export const getApplicationsByJobId = (jobId: string): Application[] => {
  return SAMPLE_APPLICATIONS.filter(app => app.jobId === jobId);
};

export const getJobsByCreator = (creatorId: string): Job[] => {
  return SAMPLE_JOBS.filter(job => job.createdBy === creatorId);
};

export const getApplicationsByProjectLeader = (projectLeaderId: string): Application[] => {
  // Get jobs created by the project leader
  const projectLeaderJobs = getJobsByCreator(projectLeaderId);
  const jobIds = projectLeaderJobs.map(job => job.id);

  // Get all applications for those jobs
  return SAMPLE_APPLICATIONS.filter(app => jobIds.includes(app.jobId));
};

export const getNotificationsByUserId = (userId: string, role: string): any[] => {
  const roleNotifications = SAMPLE_NOTIFICATIONS[role as keyof typeof SAMPLE_NOTIFICATIONS] || [];
  return roleNotifications.filter((notif: any) => notif.userId === userId);
};
