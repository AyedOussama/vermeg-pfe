export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  roles?: string[];
  isCore?: boolean; // Core navigation items that appear for all users
  isSection?: boolean; // For smooth scrolling to sections
  children?: NavItem[]; // For dropdown menu items
  hasDropdown?: boolean; // Indicates if this item has a dropdown
}

// Core navigation items that appear for ALL users (authenticated and unauthenticated)
export const coreNavigationConfig: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', href: '/#home', isCore: true, isSection: true },
  { id: 'process', label: 'Process', icon: '⚙️', href: '/#process', isCore: true, isSection: true },
  { id: 'careers', label: 'Careers', icon: '💼', href: '/#careers', isCore: true, isSection: true },
  { id: 'about', label: 'About', icon: 'ℹ️', href: '/#about', isCore: true, isSection: true }
];

// Role-specific navigation items (main navbar extensions)
export const roleNavigationConfig: Record<string, NavItem[]> = {
  CANDIDATE: [
    { id: 'my-applications', label: 'My Applications', icon: '📋', href: '/candidate/applications' },
    { id: 'job-search', label: 'Job Search', icon: '🔍', href: '/candidate/search' },
    { id: 'messages', label: 'Messages', icon: '💬', href: '/candidate/messages' }
  ],
  PROJECT_LEADER: [
    { id: 'create-job', label: 'Create Job', icon: '➕', href: '/project-leader/create-job' },
    { id: 'my-jobs', label: 'My Jobs', icon: '💼', href: '/project-leader/jobs' }
  ],
  RH: [
    { id: 'applications', label: 'Applications', icon: '📋', href: '/rh/applications' },
    { id: 'rh-quiz', label: 'RH QUIZ', icon: '📝', href: '/rh/quiz' },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: '🎯',
      hasDropdown: true,
      children: [
        { id: 'interview-management', label: 'Interview Management', icon: '🎯', href: '/rh/interviews' },
        { id: 'interview-calendar', label: 'Interview Calendar', icon: '📅', href: '/rh/calendar' }
      ]
    },
    { id: 'messages', label: 'Messages', icon: '💬', href: '/rh/messages' }
  ],
  CEO: [
    { id: 'jobs', label: 'Jobs', icon: '💼', href: '/ceo/jobs' },
    { id: 'system-analytics', label: 'System Analytics', icon: '📊', href: '/ceo/analytics' },
    { id: 'user-management', label: 'User Management', icon: '👥', href: '/ceo/users' }
  ]
};

// Avatar menu items for each role (secondary functions)
export const avatarMenuConfig: Record<string, NavItem[]> = {
  CANDIDATE: [
    { id: 'view-profile', label: 'View Profile', icon: '👤', href: '/candidate/profile' },
    { id: 'edit-profile', label: 'Edit Profile', icon: '✏️', href: '/candidate/profile/edit' },
    { id: 'uploaded-documents', label: 'Uploaded Documents', icon: '📄', href: '/candidate/documents' },
    { id: 'application-history', label: 'Application History', icon: '📋', href: '/candidate/history' },
    { id: 'interview-schedule', label: 'Interview Schedule', icon: '📅', href: '/candidate/interviews' },
    { id: 'notifications-settings', label: 'Notifications Settings', icon: '🔔', href: '/candidate/notifications-settings' },
    { id: 'account-settings', label: 'Account Settings', icon: '⚙️', href: '/candidate/settings' },
    { id: 'help-support', label: 'Help & Support', icon: '❓', href: '/help' }
  ],
  PROJECT_LEADER: [
    { id: 'view-profile', label: 'View Profile', icon: '👤', href: '/project-leader/profile' },
    { id: 'edit-profile', label: 'Edit Profile', icon: '✏️', href: '/project-leader/profile/edit' },
    { id: 'job-templates', label: 'Job Templates', icon: '📝', href: '/project-leader/templates' },
    { id: 'quiz-builder', label: 'Quiz Builder', icon: '❓', href: '/project-leader/quiz-builder' },
    { id: 'team-management', label: 'Team Management', icon: '👥', href: '/project-leader/team' },
    { id: 'analytics-dashboard', label: 'Analytics Dashboard', icon: '📊', href: '/project-leader/analytics' },
    { id: 'account-settings', label: 'Account Settings', icon: '⚙️', href: '/project-leader/settings' },
    { id: 'help-support', label: 'Help & Support', icon: '❓', href: '/help' }
  ],
  RH: [
    { id: 'view-profile', label: 'View Profile', icon: '👤', href: '/rh/profile' },
    { id: 'edit-profile', label: 'Edit Profile', icon: '✏️', href: '/rh/profile/edit' },
    { id: 'hr-templates', label: 'HR Templates', icon: '📋', href: '/rh/templates' },
    { id: 'assessment-library', label: 'Assessment Library', icon: '📚', href: '/rh/assessments' },
    { id: 'hr-analytics', label: 'HR Analytics', icon: '📈', href: '/rh/analytics' },
    { id: 'account-settings', label: 'Account Settings', icon: '⚙️', href: '/rh/settings' },
    { id: 'help-support', label: 'Help & Support', icon: '❓', href: '/help' }
  ],
  CEO: [
    { id: 'executive-profile', label: 'Executive Profile', icon: '👤', href: '/ceo/profile' },
    { id: 'system-configuration', label: 'System Configuration', icon: '🔧', href: '/ceo/config' },
    { id: 'advanced-analytics', label: 'Advanced Analytics', icon: '📊', href: '/ceo/analytics' },
    { id: 'platform-settings', label: 'Platform Settings', icon: '⚙️', href: '/ceo/platform-settings' },
    { id: 'user-role-management', label: 'User Role Management', icon: '👥', href: '/ceo/user-roles' },
    { id: 'security-settings', label: 'Security Settings', icon: '🔒', href: '/ceo/security' },
    { id: 'audit-logs', label: 'Audit Logs', icon: '📜', href: '/ceo/audit' },
    { id: 'administrative-tools', label: 'Administrative Tools', icon: '🛠️', href: '/ceo/tools' }
  ]
};

// Public navigation for unauthenticated users
export const publicNavigationConfig: NavItem[] = [
  { id: 'sign-in', label: 'Sign In', icon: '🔐', href: '/auth/signin' },
  { id: 'sign-up', label: 'Sign Up', icon: '📝', href: '/auth/signup' }
];

// Legacy export for backward compatibility
export const navigationConfig = coreNavigationConfig;