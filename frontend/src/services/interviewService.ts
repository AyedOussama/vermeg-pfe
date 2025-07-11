// ============================================================================
// SIMPLE INTERVIEW SERVICE - Mock data for demo
// ============================================================================

import { Interview } from '@/types/job';

// Sample interview data
const SAMPLE_INTERVIEWS: Interview[] = [
  {
    id: 'INT001',
    applicationId: 'APP001',
    candidateId: 'candidate-001',
    rhUserId: 'rh-001',
    jobTitle: 'Développeur Angular Senior',
    candidateName: 'Jean Dupont',
    candidateEmail: 'jean.dupont@email.com',
    candidatePhone: '+33 6 12 34 56 78',
    scheduledDate: '2024-07-15',
    scheduledTime: '10:00',
    duration: 60,
    type: 'video',
    location: 'https://meet.google.com/abc-def-ghi',
    status: 'scheduled',
    notes: 'Entretien technique pour le poste de développeur Angular',
    createdAt: '2024-07-10T09:00:00Z',
    updatedAt: '2024-07-10T09:00:00Z',
    candidateNotified: true,
    reminderSent: false
  },
  {
    id: 'INT002',
    applicationId: 'APP002',
    candidateId: 'candidate-002',
    rhUserId: 'rh-001',
    jobTitle: 'Chef de Projet IT',
    candidateName: 'Marie Martin',
    candidateEmail: 'marie.martin@email.com',
    scheduledDate: '2024-07-12',
    scheduledTime: '14:00',
    duration: 45,
    type: 'in_person',
    location: 'Bureau RH - Salle A',
    status: 'completed',
    notes: 'Entretien RH - candidat très motivé',
    feedback: 'Excellent profil, recommandé pour la suite',
    rating: 5,
    createdAt: '2024-07-08T10:00:00Z',
    updatedAt: '2024-07-12T15:00:00Z',
    candidateNotified: true,
    reminderSent: true
  },
  {
    id: 'INT003',
    applicationId: 'APP003',
    candidateId: 'candidate-003',
    rhUserId: 'leader-001',
    jobTitle: 'Développeur Angular Senior',
    candidateName: 'Ahmed Ben Ali',
    candidateEmail: 'ahmed.benali@email.com',
    candidatePhone: '+216 20 123 456',
    scheduledDate: '2024-07-18',
    scheduledTime: '16:00',
    duration: 90,
    type: 'video',
    location: 'https://teams.microsoft.com/xyz-abc-123',
    status: 'scheduled',
    notes: 'Entretien final avec le chef de projet',
    createdAt: '2024-07-11T11:00:00Z',
    updatedAt: '2024-07-11T11:00:00Z',
    candidateNotified: true,
    reminderSent: false
  }
];

export const interviewService = {
  // Get interviews by date range
  async getInterviewsByDateRange(
    rhUserId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Interview[]> {
    console.log('🔍 Getting interviews for date range:', { rhUserId, startDate, endDate });

    // Filter interviews within date range
    const filteredInterviews = SAMPLE_INTERVIEWS.filter(interview => {
      const interviewDate = new Date(interview.scheduledDate + 'T' + interview.scheduledTime);
      return interviewDate >= startDate && interviewDate <= endDate;
    });

    console.log('📅 Found interviews:', filteredInterviews.length);
    return filteredInterviews;
  },

  // Get all interviews for a user
  async getInterviewsByUser(userId: string): Promise<Interview[]> {
    console.log('👤 Getting interviews for user:', userId);

    const userInterviews = SAMPLE_INTERVIEWS.filter(
      interview => interview.rhUserId === userId
    );

    return userInterviews;
  },

  // Create new interview
  async createInterview(interviewData: Partial<Interview>): Promise<Interview> {
    console.log('➕ Creating new interview:', interviewData);

    const now = new Date();
    const newInterview: Interview = {
      id: `INT${Date.now()}`,
      applicationId: interviewData.applicationId || '',
      candidateId: interviewData.candidateId || '',
      rhUserId: interviewData.rhUserId || '',
      jobTitle: interviewData.jobTitle || '',
      candidateName: interviewData.candidateName || '',
      candidateEmail: interviewData.candidateEmail || '',
      candidatePhone: interviewData.candidatePhone,
      scheduledDate: interviewData.scheduledDate || now.toISOString().split('T')[0],
      scheduledTime: interviewData.scheduledTime || '10:00',
      duration: interviewData.duration || 60,
      type: interviewData.type || 'video',
      location: interviewData.location || '',
      status: 'scheduled',
      notes: interviewData.notes || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      candidateNotified: false,
      reminderSent: false
    };

    SAMPLE_INTERVIEWS.push(newInterview);
    return newInterview;
  },

  // Update interview
  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
    console.log('✏️ Updating interview:', { id, updates });

    const index = SAMPLE_INTERVIEWS.findIndex(interview => interview.id === id);
    if (index === -1) {
      throw new Error('Interview not found');
    }

    SAMPLE_INTERVIEWS[index] = {
      ...SAMPLE_INTERVIEWS[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return SAMPLE_INTERVIEWS[index];
  },

  // Delete interview
  async deleteInterview(id: string): Promise<void> {
    console.log('🗑️ Deleting interview:', id);
    
    const index = SAMPLE_INTERVIEWS.findIndex(interview => interview.id === id);
    if (index === -1) {
      throw new Error('Interview not found');
    }
    
    SAMPLE_INTERVIEWS.splice(index, 1);
  },

  // Get interview by ID
  async getInterviewById(id: string): Promise<Interview | null> {
    console.log('🔍 Getting interview by ID:', id);
    
    const interview = SAMPLE_INTERVIEWS.find(interview => interview.id === id);
    return interview || null;
  }
};

export default interviewService;
