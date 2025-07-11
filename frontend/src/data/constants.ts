// data/constants.ts
import { Job, NavItem, CountryCode } from '../types';

// ============================================================================
// COMPREHENSIVE DUMMY DATA FOR VERMEG RECRUITMENT PLATFORM
// ============================================================================

// Pre-defined CEO (no registration required)
export const CEO_USER = {
  id: "CEO001",
  name: "John Smith",
  firstName: "John",
  lastName: "Smith",
  email: "ceo@vermeg.com",
  role: "CEO",
  avatar: "/images/ceo-avatar.jpg",
  department: "Executive",
  employeeId: "CEO001",
  accessLevel: "Executive",
  permissions: ["ALL_PLATFORM_ACCESS"]
};

// Sample registered users
export const SAMPLE_CANDIDATES = [
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
    applications: ["JOB001", "JOB003"],
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
    applications: ["JOB002"],
    avatar: "/images/candidate-2.jpg"
  }
];

export const SAMPLE_PROJECT_LEADERS = [
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
    jobsCreated: ["JOB001", "JOB002"],
    avatar: "/images/project-leader-1.jpg"
  }
];

export const SAMPLE_HR_MANAGERS = [
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
    jobsEnhanced: ["JOB001"],
    avatar: "/images/hr-manager-1.jpg"
  }
];

// Sample Jobs Data
export const SAMPLE_JOBS = [
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
    employmentType: "FULL_TIME",
    level: "Senior",
    salary: "€60K - €80K",
    salaryRangeMin: 60000,
    salaryRangeMax: 80000,
    displaySalary: true,
    minExperience: 5,
    posted: "2025-06-15",
    description: "We are looking for an experienced Frontend Developer to join our engineering team...",
    responsibilities: "Design and implement scalable web applications, collaborate with cross-functional teams, ensure code quality through testing",
    qualifications: "Strong proficiency in Angular, TypeScript, and modern JavaScript, experience with Java Spring Boot",
    benefits: "Competitive salary, flexible working arrangements, health insurance and wellness programs",
    skills: [
      { name: "Angular", isRequired: true, level: "ADVANCED" },
      { name: "TypeScript", isRequired: true, level: "ADVANCED" },
      { name: "JavaScript", isRequired: true, level: "INTERMEDIATE" }
    ],
    tags: ["Angular", "TypeScript", "Frontend"],
    featured: true
  },
  {
    id: "JOB002",
    title: "Data Science Manager",
    department: "Analytics",
    status: "HR_Review",
    createdBy: "PL001",
    enhancedBy: null,
    approvedBy: null,
    applications: 0,
    technicalQuestions: 10,
    hrQuestions: 0,
    location: "Luxembourg",
    type: "Full-time",
    employmentType: "FULL_TIME",
    level: "Manager",
    salary: "€80K - €100K",
    salaryRangeMin: 80000,
    salaryRangeMax: 100000,
    displaySalary: true,
    minExperience: 7,
    posted: "2025-06-18",
    description: "Lead our data science initiatives and build advanced analytics solutions...",
    responsibilities: "Lead a team of data scientists, develop ML models, design data pipelines",
    qualifications: "Strong programming skills in Python and R, experience with big data technologies",
    benefits: "Competitive salary, flexible work arrangements, professional growth opportunities",
    skills: [
      { name: "Python", isRequired: true, level: "ADVANCED" },
      { name: "Machine Learning", isRequired: true, level: "ADVANCED" },
      { name: "Leadership", isRequired: true, level: "INTERMEDIATE" }
    ],
    tags: ["Python", "Machine Learning", "Leadership"],
    featured: false
  }
];

// Sample Applications Data
export const SAMPLE_APPLICATIONS = [
  {
    id: "APP001",
    candidateId: "CAND001",
    jobId: "JOB001",
    status: "Under Review",
    technicalScore: 85,
    hrScore: 78,
    submitDate: "2025-06-15",
    lastUpdated: "2025-06-20",
    notes: "Strong technical background, good communication skills",
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
    hrScore: null,
    submitDate: "2025-06-18",
    lastUpdated: "2025-06-19",
    notes: "Excellent technical skills in data science",
    interviewScheduled: true,
    interviewDate: "2025-06-25",
    documents: [
      { type: "resume", url: "/documents/ahmed-benali-resume.pdf" }
    ]
  }
];

// Enhanced job listings with comprehensive data
export const CURRENT_JOBS: Job[] = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Senior',
    salary: '€50K - €70K',
    salaryRangeMin: 50000,
    salaryRangeMax: 70000,
    displaySalary: true,
    minExperience: 5,
    posted: 'Posted 2 days ago',
    description: 'We are looking for an experienced Full Stack Developer to join our engineering team...',
    responsibilities: 'Design and implement scalable web applications, collaborate with cross-functional teams, ensure code quality through testing',
    qualifications: 'Strong proficiency in Angular, TypeScript, and modern JavaScript, experience with Java Spring Boot',
    benefits: 'Competitive salary, flexible working arrangements, health insurance and wellness programs',
    fullDescription: `
      <h3>About the Role</h3>
      <p>We are seeking an experienced Full Stack Developer to join our core engineering team and help build the next generation of financial software solutions. You will work on challenging projects that directly impact millions of users across the globe.</p>

      <h3>Key Responsibilities</h3>
      <ul>
        <li>Design and implement scalable web applications using Angular and Spring Boot</li>
        <li>Collaborate with cross-functional teams to define and ship new features</li>
        <li>Ensure code quality through comprehensive testing and code reviews</li>
        <li>Mentor junior developers and contribute to technical documentation</li>
        <li>Participate in architecture decisions and technology selection</li>
      </ul>

      <h3>Requirements</h3>
      <ul>
        <li>5+ years of experience in full-stack development</li>
        <li>Strong proficiency in Angular, TypeScript, and modern JavaScript</li>
        <li>Experience with Java Spring Boot and microservices architecture</li>
        <li>Solid understanding of RESTful APIs and database design</li>
        <li>Experience with cloud platforms (AWS, Azure) is a plus</li>
      </ul>

      <h3>What We Offer</h3>
      <ul>
        <li>Competitive salary and benefits package</li>
        <li>Flexible working arrangements</li>
        <li>Continuous learning and development opportunities</li>
        <li>International work environment</li>
        <li>Health insurance and wellness programs</li>
      </ul>
    `,
    skills: [
      {
        name: 'Angular',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Frontend development with Angular framework'
      },
      {
        name: 'Java',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Backend development with Java'
      },
      {
        name: 'Spring Boot',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Building microservices with Spring Boot'
      },
      {
        name: 'MongoDB',
        isRequired: false,
        level: 'INTERMEDIATE',
        description: 'Working with NoSQL databases'
      }
    ],
    tags: ['Angular', 'Java', 'Spring Boot', 'MongoDB'],
    featured: true,
    // Additional fields for enhanced functionality
    createdBy: 'PL001',
    enhancedBy: 'HR001',
    approvedBy: 'CEO001',
    status: 'Published',
    applications: 12,
    technicalQuestions: 8,
    hrQuestions: 6
  },
  {
    id: 2,
    title: 'Product Manager - Fintech',
    department: 'Product',
    location: 'Paris, France',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Mid-Senior',
    salary: '€65K - €85K',
    salaryRangeMin: 65000,
    salaryRangeMax: 85000,
    displaySalary: true,
    minExperience: 3,
    posted: 'Posted 5 days ago',
    description: 'Lead product strategy and development for our innovative fintech solutions...',
    responsibilities: 'Define product roadmap, collaborate with engineering teams, conduct market research, work with customers',
    qualifications: 'Strong understanding of financial markets and regulations, excellent communication skills',
    benefits: 'Competitive pay, flexible work arrangements, professional development opportunities',
    skills: [
      {
        name: 'Agile',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Agile methodologies and product management'
      },
      {
        name: 'Fintech',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Understanding of fintech landscape'
      }
    ],
    tags: ['Agile', 'Fintech', 'Strategy', 'Leadership'],
    remote: true
  },
  {
    id: 3,
    title: 'Data Science Lead',
    department: 'Analytics',
    location: 'Luxembourg',
    type: 'Full-time',
    employmentType: 'FULL_TIME',
    level: 'Lead',
    salary: '€80K - €100K',
    salaryRangeMin: 80000,
    salaryRangeMax: 100000,
    displaySalary: true,
    minExperience: 7,
    posted: 'Posted 1 week ago',
    description: 'Lead our data science initiatives and build advanced analytics solutions...',
    responsibilities: 'Lead a team of data scientists, develop ML models, design data pipelines, collaborate with product teams',
    qualifications: 'Strong programming skills in Python and R, experience with big data technologies, deep understanding of ML algorithms',
    benefits: 'Competitive salary, flexible work arrangements, professional growth opportunities, modern workspace',
    skills: [
      {
        name: 'Python',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Data analysis and ML model development'
      },
      {
        name: 'Machine Learning',
        isRequired: true,
        level: 'ADVANCED',
        description: 'Building ML models for finance'
      }
    ],
    tags: ['Python', 'Machine Learning', 'Big Data'],
    urgent: true
  },
  {
    id: 4,
    title: 'Développeur Full-Stack Java/React',
    department: 'IT',
    location: 'Monastir, Tunisie',
    employmentType: 'FULL_TIME',
    type: 'Full-time',
    level: 'Mid-level',
    salary: '€20K - €55K',
    salaryRangeMin: 20000,
    salaryRangeMax: 55000,
    displaySalary: true,
    minExperience: 2,
    posted: 'Posted 3 days ago',
    description: 'Nous recherchons un développeur Full-Stack expérimenté pour rejoindre notre équipe de développement produit.',
    responsibilities: 'Concevoir et développer des applications web responsive, collaborer avec l\'équipe produit, participer aux revues de code.',
    qualifications: 'Expérience en développement avec Spring Boot et React, connaissance des bases de données SQL, expérience en développement agile.',
    benefits: 'Horaires flexibles, formation continue, assurance santé, environnement de travail moderne.',
    skills: [
      {
        name: 'React',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Frontend development with React'
      },
      {
        name: 'Docker',
        isRequired: true,
        level: 'INTERMEDIATE',
        description: 'Requêtes et schémas de base de données'
      }
    ],
    tags: ['React', 'Java', 'Spring Boot', 'SQL', 'Docker'],
    featured: false
  }
];

// Navigation configuration
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'process', label: 'Process' },
  { id: 'careers', label: 'Careers' },
  { id: 'about', label: 'About' }
];

// Country codes for phone number input
export const COUNTRY_CODES: CountryCode[] = [
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' }
];

// Sample quiz questions for technical assessments
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
  }
];

// Sample HR/behavioral questions
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
  }
];

// Sample notifications for different user roles
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
    }
  ],
  RH: [
    {
      id: "NOTIF004",
      userId: "HR001",
      type: "job_enhancement_request",
      title: "Job Enhancement Required",
      message: "Data Science Manager position needs HR components",
      timestamp: "2025-06-18T16:20:00Z",
      read: false,
      actionUrl: "/rh/dashboard"
    }
  ],
  CEO: [
    {
      id: "NOTIF005",
      userId: "CEO001",
      type: "approval_required",
      title: "Job Approval Required",
      message: "Senior Frontend Developer position ready for approval",
      timestamp: "2025-06-17T11:30:00Z",
      read: false,
      actionUrl: "/ceo/approvals"
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