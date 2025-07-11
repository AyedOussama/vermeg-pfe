// ============================================================================
// MOCK WORKFLOW SERVICE - Comprehensive Workflow Management System
// ============================================================================

import { 
  Job, 
  Application, 
  ApplicationSubmissionData, 
  ProjectLeaderDecisionData, 
  HREnhancementData,
  CEOApprovalData,
  JobStatus,
  ApplicationStatus
} from '@/types';

// ============================================================================
// MOCK DATA STORAGE
// ============================================================================

// Jobs Database
const MOCK_JOBS: Job[] = [
  {
    id: 'job-001',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Tunis, Tunisia',
    type: 'full-time',
    level: 'senior',
    salary: { min: 45000, max: 65000, currency: 'TND' },
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
    requirements: [
      '5+ years of React experience',
      'TypeScript proficiency',
      'Modern CSS frameworks',
      'State management (Redux/Zustand)',
      'Testing frameworks (Jest/Cypress)'
    ],
    responsibilities: [
      'Lead frontend architecture decisions',
      'Mentor junior developers',
      'Collaborate with design team',
      'Optimize application performance'
    ],
    benefits: [
      'Competitive salary',
      'Health insurance',
      'Flexible working hours',
      'Professional development budget'
    ],
    status: 'active' as JobStatus,
    projectLeader: {
      id: 'pl-001',
      name: 'Ahmed Ben Salem',
      email: 'ahmed.bensalem@company.com',
      avatar: '/avatars/ahmed.jpg'
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    workflowStage: 'active',
    applicationCount: 15,
    viewCount: 234
  },
  {
    id: 'job-002',
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Remote',
    type: 'full-time',
    level: 'mid',
    salary: { min: 40000, max: 55000, currency: 'TND' },
    description: 'Join our infrastructure team to build scalable and reliable systems...',
    requirements: [
      '3+ years DevOps experience',
      'Docker & Kubernetes',
      'AWS/Azure cloud platforms',
      'CI/CD pipelines',
      'Infrastructure as Code'
    ],
    responsibilities: [
      'Manage cloud infrastructure',
      'Implement CI/CD pipelines',
      'Monitor system performance',
      'Ensure security compliance'
    ],
    benefits: [
      'Remote work flexibility',
      'Health insurance',
      'Learning stipend',
      'Stock options'
    ],
    status: 'pending_ceo_approval' as JobStatus,
    projectLeader: {
      id: 'pl-002',
      name: 'Fatima Mansouri',
      email: 'fatima.mansouri@company.com',
      avatar: '/avatars/fatima.jpg'
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    workflowStage: 'pending_ceo_approval',
    applicationCount: 8,
    viewCount: 156
  }
];

// Applications Database
const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Senior Frontend Developer',
    candidateId: 'candidate-001',
    candidate: {
      id: 'candidate-001',
      firstName: 'Sara',
      lastName: 'Bouaziz',
      email: 'sara.bouaziz@email.com',
      phone: '+216 20 123 456',
      location: 'Tunis, Tunisia',
      avatar: '/avatars/sara.jpg'
    },
    status: 'under_review' as ApplicationStatus,
    submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    experience: 6,
    expectedSalary: { min: 50000, max: 60000, currency: 'TND' },
    workPreference: 'hybrid',
    coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
    documents: [
      { name: 'CV_Sara_Bouaziz.pdf', url: '/documents/cv-sara.pdf', type: 'cv' },
      { name: 'Portfolio.pdf', url: '/documents/portfolio-sara.pdf', type: 'portfolio' }
    ],
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    timeline: [
      {
        stage: 'submitted',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actor: 'system',
        notes: 'Application submitted successfully'
      },
      {
        stage: 'under_review',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        actor: 'hr',
        notes: 'Initial screening completed'
      }
    ],
    conversationId: 'conv-1',
    hasUnreadMessages: true
  }
];

// ============================================================================
// WORKFLOW SERVICE IMPLEMENTATION
// ============================================================================

export const mockWorkflowService = {
  // ========================================
  // JOB MANAGEMENT
  // ========================================

  async getMyJobs(): Promise<Job[]> {
    console.log('🔄 Loading user jobs...');
    await this.simulateDelay(800);
    return [...MOCK_JOBS];
  },

  async getJobById(jobId: string): Promise<Job> {
    console.log('🔄 Loading job details:', jobId);
    await this.simulateDelay(600);
    
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    return { ...job };
  },

  async getJobDetails(jobId: string): Promise<Job> {
    return this.getJobById(jobId);
  },

  async createJob(jobData: Partial<Job>): Promise<Job> {
    console.log('🔄 Creating new job:', jobData.title);
    await this.simulateDelay(1000);
    
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: jobData.title || 'Untitled Job',
      department: jobData.department || 'General',
      location: jobData.location || 'Not specified',
      type: jobData.type || 'full-time',
      level: jobData.level || 'mid',
      salary: jobData.salary || { min: 30000, max: 50000, currency: 'TND' },
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      responsibilities: jobData.responsibilities || [],
      benefits: jobData.benefits || [],
      status: 'draft' as JobStatus,
      projectLeader: jobData.projectLeader || {
        id: 'current-user',
        name: 'Current User',
        email: 'user@company.com',
        avatar: '/avatars/default.jpg'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationDeadline: jobData.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      workflowStage: 'draft',
      applicationCount: 0,
      viewCount: 0
    };
    
    MOCK_JOBS.push(newJob);
    return newJob;
  },

  async updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
    console.log('🔄 Updating job:', jobId);
    await this.simulateDelay(800);
    
    const jobIndex = MOCK_JOBS.findIndex(j => j.id === jobId);
    if (jobIndex === -1) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    MOCK_JOBS[jobIndex] = {
      ...MOCK_JOBS[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return { ...MOCK_JOBS[jobIndex] };
  },

  // ========================================
  // APPLICATION MANAGEMENT
  // ========================================

  async submitApplication(applicationData: ApplicationSubmissionData): Promise<Application> {
    console.log('🔄 Submitting application for job:', applicationData.jobId);
    await this.simulateDelay(1200);
    
    const job = MOCK_JOBS.find(j => j.id === applicationData.jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId: applicationData.jobId,
      jobTitle: job.title,
      candidateId: `candidate-${Date.now()}`,
      candidate: {
        id: `candidate-${Date.now()}`,
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        location: applicationData.location,
        avatar: '/avatars/default.jpg'
      },
      status: 'submitted' as ApplicationStatus,
      submittedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      experience: applicationData.experience,
      expectedSalary: applicationData.expectedSalary,
      workPreference: applicationData.workPreference,
      coverLetter: applicationData.coverLetter,
      documents: applicationData.documents || [],
      skills: applicationData.skills || [],
      timeline: [
        {
          stage: 'submitted',
          timestamp: new Date().toISOString(),
          actor: 'candidate',
          notes: 'Application submitted successfully'
        }
      ],
      linkedinUrl: applicationData.linkedinUrl,
      portfolioUrl: applicationData.portfolioUrl,
      githubUrl: applicationData.githubUrl,
      personalWebsite: applicationData.personalWebsite,
      additionalComments: applicationData.additionalComments
    };
    
    MOCK_APPLICATIONS.push(newApplication);
    
    // Update job application count
    job.applicationCount = (job.applicationCount || 0) + 1;
    
    return newApplication;
  },

  async getApplications(filters?: any): Promise<Application[]> {
    console.log('🔄 Loading applications with filters:', filters);
    await this.simulateDelay(700);
    
    let applications = [...MOCK_APPLICATIONS];
    
    if (filters?.status) {
      applications = applications.filter(app => app.status === filters.status);
    }
    
    if (filters?.jobId) {
      applications = applications.filter(app => app.jobId === filters.jobId);
    }
    
    return applications;
  },

  // ========================================
  // WORKFLOW DECISIONS
  // ========================================

  async makeProjectLeaderDecision(decisionData: ProjectLeaderDecisionData): Promise<void> {
    console.log('🔄 Processing project leader decision:', decisionData.decision);
    await this.simulateDelay(1000);
    
    const application = MOCK_APPLICATIONS.find(app => app.id === decisionData.applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Update application status based on decision
    const statusMap = {
      'accept': 'accepted' as ApplicationStatus,
      'reject': 'rejected' as ApplicationStatus,
      'pending': 'under_review' as ApplicationStatus
    };
    
    application.status = statusMap[decisionData.decision];
    application.lastUpdatedAt = new Date().toISOString();
    
    // Add timeline entry
    application.timeline.push({
      stage: application.status,
      timestamp: new Date().toISOString(),
      actor: 'project_leader',
      notes: decisionData.feedback || `Application ${decisionData.decision}ed by project leader`,
      rating: decisionData.rating
    });
    
    // Store decision data
    application.projectLeaderDecision = {
      decision: decisionData.decision,
      feedback: decisionData.feedback,
      rating: decisionData.rating,
      decidedAt: decisionData.decidedAt
    };
  },

  async makeCEOApproval(approvalData: CEOApprovalData): Promise<void> {
    console.log('🔄 Processing CEO approval:', approvalData.decision);
    await this.simulateDelay(800);
    
    const job = MOCK_JOBS.find(j => j.id === approvalData.jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Update job status based on CEO decision
    job.status = approvalData.decision === 'approve' ? 'active' : 'rejected';
    job.workflowStage = approvalData.decision === 'approve' ? 'active' : 'rejected';
    job.updatedAt = new Date().toISOString();
    
    // Store CEO approval data
    (job as any).ceoApproval = {
      decision: approvalData.decision,
      feedback: approvalData.feedback,
      approvedAt: approvalData.approvedAt
    };
  },

  async enhanceJobWithHR(jobId: string, enhancementData: HREnhancementData): Promise<Job> {
    console.log('🔄 Enhancing job with HR data:', jobId);
    await this.simulateDelay(1000);
    
    const job = MOCK_JOBS.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Update job with HR enhancements
    const updatedJob = {
      ...job,
      hrQuiz: enhancementData.hrQuiz,
      culturalFitCriteria: enhancementData.culturalFitCriteria,
      behavioralCompetencies: enhancementData.behavioralCompetencies,
      interviewGuidelines: enhancementData.interviewGuidelines,
      status: 'pending_ceo_approval' as JobStatus,
      workflowStage: 'pending_ceo_approval',
      updatedAt: new Date().toISOString()
    };
    
    const jobIndex = MOCK_JOBS.findIndex(j => j.id === jobId);
    MOCK_JOBS[jobIndex] = updatedJob;
    
    return updatedJob;
  },

  // ========================================
  // UTILITY METHODS
  // ========================================

  async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Get workflow statistics
  async getWorkflowStats(): Promise<any> {
    console.log('🔄 Loading workflow statistics...');
    await this.simulateDelay(500);
    
    return {
      totalJobs: MOCK_JOBS.length,
      activeJobs: MOCK_JOBS.filter(j => j.status === 'active').length,
      pendingApproval: MOCK_JOBS.filter(j => j.status === 'pending_ceo_approval').length,
      totalApplications: MOCK_APPLICATIONS.length,
      pendingReview: MOCK_APPLICATIONS.filter(a => a.status === 'under_review').length,
      acceptedApplications: MOCK_APPLICATIONS.filter(a => a.status === 'accepted').length
    };
  }
};

export default mockWorkflowService;
