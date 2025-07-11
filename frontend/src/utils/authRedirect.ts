/**
 * Utility functions for handling authentication-based redirects
 */

import { TokenValidationResult } from '@/types/auth';

/**
 * Get the appropriate dashboard route based on user role
 * @param user - The authenticated user object
 * @returns The route path for the user's dashboard
 */
export const getRoleBasedDashboardRoute = (user: TokenValidationResult | null): string => {
  if (!user || !user.roles || user.roles.length === 0) {
    console.warn('No user or roles found, redirecting to home');
    return '/';
  }

  const role = user.roles[0];

  // Route based on single role
  switch (role) {
    case 'CEO':
      return '/ceo/jobs';
    case 'RH':
      return '/rh/applications';
    case 'PROJECT_LEADER':
      return '/project-leader/dashboard';
    case 'CANDIDATE':
      return '/candidate/dashboard';
    default:
      console.warn('Unknown user role:', role);
      return '/';
  }
};

/**
 * Get the appropriate dashboard route based on role string
 * @param role - User role string
 * @returns The route path for the user's dashboard
 */
export const getRoleBasedDashboardRouteFromRole = (role: string): string => {
  if (!role) {
    console.warn('No role found, redirecting to home');
    return '/';
  }

  // Route based on role
  switch (role) {
    case 'CEO':
      return '/ceo/jobs';
    case 'RH':
      return '/rh/applications';
    case 'PROJECT_LEADER':
      return '/project-leader/dashboard';
    case 'CANDIDATE':
      return '/candidate/dashboard';
    default:
      console.warn('Unknown user role:', role);
      return '/';
  }
};

/**
 * Get the appropriate dashboard route based on roles array (legacy support)
 * @param roles - Array of user roles
 * @returns The route path for the user's dashboard
 */
export const getRoleBasedDashboardRouteFromRoles = (roles: string[]): string => {
  if (!roles || roles.length === 0) {
    console.warn('No roles found, redirecting to home');
    return '/';
  }

  // Use the first role
  return getRoleBasedDashboardRouteFromRole(roles[0]);
};

/**
 * Check if user has a specific role
 * @param user - The user object
 * @param role - The role to check for
 * @returns True if user has the role
 */
export const userHasRole = (user: TokenValidationResult | null, role: string): boolean => {
  return user?.roles?.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 * @param user - The user object
 * @param roles - Array of roles to check for
 * @returns True if user has any of the roles
 */
export const userHasAnyRole = (user: TokenValidationResult | null, roles: string[]): boolean => {
  if (!user?.roles) return false;
  return roles.some(role => user.roles!.includes(role));
};

/**
 * Get user's primary role
 * @param user - The user object
 * @returns The primary role or null
 */
export const getUserPrimaryRole = (user: TokenValidationResult | null): string | null => {
  if (!user?.roles || user.roles.length === 0) return null;
  return user.roles[0];
};
