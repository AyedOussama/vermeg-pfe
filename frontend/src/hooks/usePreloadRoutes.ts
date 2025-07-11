// ============================================================================
// PRELOAD ROUTES HOOK - Preload critical routes for better performance
// ============================================================================

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to preload critical routes based on user role
 * This improves navigation performance by loading components in advance
 */
export const usePreloadRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const preloadRoutes = async () => {
      try {
        // Preload routes based on user role
        switch (user.role) {
          case 'CANDIDATE':
            // Preload candidate routes
            await Promise.all([
              import('@/pages/candidate/CandidateRoutes'),
              import('@/components/candidate/CandidateProfileManager'),
              import('@/components/jobs/JobListings')
            ]);
            console.log('🚀 Candidate routes preloaded');
            break;

          case 'PROJECT_LEADER':
            // Preload project leader routes
            await Promise.all([
              import('@/pages/project-leader/ProjectLeaderRoutes'),
              import('@/components/project-leader/EnhancedCreateJob'),
              import('@/components/project-leader/ProjectLeaderProfile')
            ]);
            console.log('🚀 Project Leader routes preloaded');
            break;

          case 'RH':
            // Preload RH routes
            await Promise.all([
              import('@/pages/rh/RHRoutes'),
              import('@/components/rh/RHDashboard')
            ]);
            console.log('🚀 RH routes preloaded');
            break;

          case 'CEO':
            // Preload CEO routes
            await Promise.all([
              import('@/pages/ceo/CEORoutes')
            ]);
            console.log('🚀 CEO routes preloaded');
            break;

          default:
            console.log('🔄 No specific routes to preload for role:', user.role);
        }
      } catch (error) {
        console.warn('⚠️ Failed to preload some routes:', error);
      }
    };

    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadRoutes, 1000);
    return () => clearTimeout(timer);
  }, [user, isAuthenticated]);
};

/**
 * Hook to preload common components used across the app
 */
export const usePreloadCommonComponents = () => {
  useEffect(() => {
    const preloadCommon = async () => {
      try {
        // Preload commonly used components
        await Promise.all([
          import('@/components/common/Modal'),
          import('@/components/common/Toast'),
          import('@/components/common/FileUpload'),
          import('@/components/navigation/Navbar')
        ]);
        console.log('🚀 Common components preloaded');
      } catch (error) {
        console.warn('⚠️ Failed to preload common components:', error);
      }
    };

    // Preload after initial render
    const timer = setTimeout(preloadCommon, 500);
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Hook to preload routes on hover (for navigation links)
 */
export const useHoverPreload = () => {
  const preloadOnHover = (routePath: string) => {
    return {
      onMouseEnter: async () => {
        try {
          switch (routePath) {
            case '/candidate/profile':
              await import('@/components/candidate/CandidateProfileManager');
              break;
            case '/candidate/jobs':
              await import('@/components/jobs/JobListings');
              break;
            case '/project-leader/create-job':
              await import('@/components/project-leader/EnhancedCreateJob');
              break;
            case '/project-leader/profile':
              await import('@/components/project-leader/ProjectLeaderProfile');
              break;
            default:
              // No specific preload for this route
              break;
          }
        } catch (error) {
          // Silently fail - preloading is optional
          console.debug('Failed to preload route:', routePath, error);
        }
      }
    };
  };

  return { preloadOnHover };
};
