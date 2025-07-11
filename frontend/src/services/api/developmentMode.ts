// ============================================================================
// DEVELOPMENT MODE UTILITIES
// ============================================================================

/**
 * Check if the application is running in development mode
 */
export const getIsDevelopmentMode = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

/**
 * Check if backend is available (mock implementation)
 */
export const getIsBackendAvailable = async (): Promise<boolean> => {
  try {
    // In a real app, this would ping the backend
    // For now, we'll simulate backend availability
    return true;
  } catch {
    return false;
  }
};

/**
 * Development utilities
 */
export const developmentUtils = {
  /**
   * Log development information
   */
  log: (message: string, data?: any) => {
    if (getIsDevelopmentMode()) {
      console.log(`[DEV] ${message}`, data);
    }
  },

  /**
   * Log development warnings
   */
  warn: (message: string, data?: any) => {
    if (getIsDevelopmentMode()) {
      console.warn(`[DEV] ${message}`, data);
    }
  },

  /**
   * Log development errors
   */
  error: (message: string, data?: any) => {
    if (getIsDevelopmentMode()) {
      console.error(`[DEV] ${message}`, data);
    }
  },

  /**
   * Check if feature flags are enabled
   */
  isFeatureEnabled: (feature: string): boolean => {
    if (!getIsDevelopmentMode()) return false;
    
    // Check localStorage for feature flags
    const flags = localStorage.getItem('dev-feature-flags');
    if (!flags) return false;
    
    try {
      const parsedFlags = JSON.parse(flags);
      return parsedFlags[feature] === true;
    } catch {
      return false;
    }
  },

  /**
   * Enable a development feature
   */
  enableFeature: (feature: string) => {
    if (!getIsDevelopmentMode()) return;
    
    const flags = localStorage.getItem('dev-feature-flags');
    let parsedFlags = {};
    
    if (flags) {
      try {
        parsedFlags = JSON.parse(flags);
      } catch {
        parsedFlags = {};
      }
    }
    
    parsedFlags[feature] = true;
    localStorage.setItem('dev-feature-flags', JSON.stringify(parsedFlags));
  },

  /**
   * Disable a development feature
   */
  disableFeature: (feature: string) => {
    if (!getIsDevelopmentMode()) return;
    
    const flags = localStorage.getItem('dev-feature-flags');
    if (!flags) return;
    
    try {
      const parsedFlags = JSON.parse(flags);
      delete parsedFlags[feature];
      localStorage.setItem('dev-feature-flags', JSON.stringify(parsedFlags));
    } catch {
      // Ignore errors
    }
  },

  /**
   * Get all enabled features
   */
  getEnabledFeatures: (): string[] => {
    if (!getIsDevelopmentMode()) return [];
    
    const flags = localStorage.getItem('dev-feature-flags');
    if (!flags) return [];
    
    try {
      const parsedFlags = JSON.parse(flags);
      return Object.keys(parsedFlags).filter(key => parsedFlags[key] === true);
    } catch {
      return [];
    }
  },

  /**
   * Clear all development data
   */
  clearDevData: () => {
    if (!getIsDevelopmentMode()) return;
    
    localStorage.removeItem('dev-feature-flags');
    console.log('[DEV] Development data cleared');
  }
};
