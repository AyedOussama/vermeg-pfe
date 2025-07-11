// ============================================================================
// ERROR HANDLING SERVICE - Centralized Error Processing
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
}

export class ErrorHandlingService {
  /**
   * Check if an error is a validation error
   */
  static isValidationError(error: any): boolean {
    return (
      error &&
      (error.status === 400 || error.status === 422) &&
      error.errors &&
      Array.isArray(error.errors)
    );
  }

  /**
   * Check if an error is a network error
   */
  static isNetworkError(error: any): boolean {
    return (
      error &&
      (error.name === 'NetworkError' ||
        error.message?.includes('Network') ||
        error.message?.includes('fetch') ||
        !error.status)
    );
  }

  /**
   * Check if an error is a server error (5xx)
   */
  static isServerError(error: any): boolean {
    return error && error.status >= 500 && error.status < 600;
  }

  /**
   * Check if an error is an authentication error
   */
  static isAuthError(error: any): boolean {
    return error && (error.status === 401 || error.status === 403);
  }

  /**
   * Format validation errors for form display
   */
  static formatValidationErrorsForForm(error: any): Record<string, string> {
    if (!this.isValidationError(error)) {
      return {};
    }

    const formErrors: Record<string, string> = {};
    
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((validationError: ValidationError) => {
        formErrors[validationError.field] = validationError.message;
      });
    }

    return formErrors;
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (this.isServerError(error)) {
      return 'Server error occurred. Please try again later.';
    }

    if (this.isAuthError(error)) {
      return 'Authentication failed. Please check your credentials.';
    }

    if (this.isValidationError(error)) {
      return 'Please check the form for validation errors.';
    }

    // Handle specific error messages
    if (error?.message) {
      switch (error.message) {
        case 'EMAIL_ALREADY_EXISTS':
          return 'An account with this email already exists.';
        case 'WEAK_PASSWORD':
          return 'Password is too weak. Please choose a stronger password.';
        case 'INVALID_EMAIL':
          return 'Please enter a valid email address.';
        case 'USER_NOT_FOUND':
          return 'User not found. Please check your credentials.';
        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password.';
        default:
          return error.message;
      }
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Log error for debugging (development only)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
      console.error('Error object:', error);
      console.error('Stack trace:', error?.stack);
      console.groupEnd();
    }
  }

  /**
   * Handle API response errors
   */
  static async handleApiResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        errorData = await response.json();
      } catch {
        // If response is not JSON, create a basic error object
        errorData = {
          status: response.status,
          message: response.statusText || 'Request failed'
        };
      }

      const error = {
        status: response.status,
        message: errorData.message || response.statusText,
        errors: errorData.errors || []
      };

      throw error;
    }

    return response.json();
  }

  /**
   * Create a standardized error object
   */
  static createError(
    message: string,
    status?: number,
    errors?: ValidationError[]
  ): ApiError {
    return {
      status: status || 500,
      message,
      errors
    };
  }

  /**
   * Handle form submission errors
   */
  static handleFormError(
    error: any,
    setFormError: (field: string, error: { type: string; message: string }) => void,
    setGeneralError: (message: string) => void
  ): void {
    this.logError(error, 'Form submission');

    if (this.isValidationError(error)) {
      const formErrors = this.formatValidationErrorsForForm(error);
      
      Object.entries(formErrors).forEach(([field, message]) => {
        setFormError(field, {
          type: 'manual',
          message
        });
      });
    }

    const generalMessage = this.getUserFriendlyMessage(error);
    setGeneralError(generalMessage);
  }

  /**
   * Retry mechanism for failed requests
   */
  static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except for 408 (timeout)
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408) {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  }
}

// Export for backward compatibility
export default ErrorHandlingService;
