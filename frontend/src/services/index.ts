// ============================================================================
// SERVICES INDEX - Centralized Service Exports
// ============================================================================

// Core Services
export { mockWorkflowService } from './mockWorkflowService';
export { messagingService } from './messagingService';
export { aiReviewService } from './aiReviewService';

// Service Types
export type { AIReviewResponse, SkillAssessment } from './aiReviewService';
export type { Notification, NotificationOptions } from '../hooks/useNotifications';

// Re-export commonly used services for convenience
export { default as workflowService } from './mockWorkflowService';
export { default as messaging } from './messagingService';
export { default as aiReview } from './aiReviewService';

// Service Status
export const SERVICES_STATUS = {
  mockWorkflowService: 'active',
  messagingService: 'active',
  aiReviewService: 'active',
  useNotifications: 'active'
} as const;

console.log('🚀 All services loaded successfully:', SERVICES_STATUS);
