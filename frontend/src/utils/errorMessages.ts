// Error message utilities for user-friendly error handling

export interface ErrorDetails {
  title: string;
  message: string;
  action?: string;
  type: 'error' | 'warning' | 'info';
}

// Common error patterns and their user-friendly messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'Unable to connect to our servers. Please check your internet connection and try again.',
    action: 'Check your connection and retry',
    type: 'error' as const
  },

  // Authentication errors
  EMAIL_ALREADY_EXISTS: {
    title: 'Email Already Registered',
    message: 'An account with this email address already exists. If this is your account, please sign in instead. Otherwise, use a different email address.',
    action: 'Sign in with existing account or use different email',
    type: 'warning' as const
  },

  // Candidate-specific errors
  RESUME_REQUIRED: {
    title: 'Resume Required',
    message: 'Please upload your resume before submitting your application. We accept PDF, DOC, and DOCX files.',
    action: 'Upload your resume file',
    type: 'warning' as const
  },

  INVALID_FILE_TYPE: {
    title: 'Invalid File Type',
    message: 'Please upload a valid resume file. We only accept PDF, DOC, and DOCX formats.',
    action: 'Upload a PDF, DOC, or DOCX file',
    type: 'error' as const
  },

  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'Your resume file is too large. Please upload a file smaller than 5MB.',
    action: 'Compress your file or use a smaller version',
    type: 'error' as const
  },

  INVALID_JOB_CATEGORIES: {
    title: 'Job Categories Required',
    message: 'Please select at least one job category that interests you.',
    action: 'Choose your preferred job categories',
    type: 'warning' as const
  },
  
  INVALID_EMAIL: {
    title: 'Invalid Email Address',
    message: 'Please enter a valid email address in the correct format (e.g., name@example.com).',
    action: 'Check your email format',
    type: 'error' as const
  },
  
  WEAK_PASSWORD: {
    title: 'Password Too Weak',
    message: 'Your password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.',
    action: 'Create a stronger password',
    type: 'error' as const
  },
  
  PASSWORD_MISMATCH: {
    title: 'Passwords Don\'t Match',
    message: 'The password and confirmation password do not match. Please make sure both fields are identical.',
    action: 'Re-enter your passwords',
    type: 'error' as const
  },
  
  // Validation errors
  MISSING_REQUIRED_FIELDS: {
    title: 'Missing Required Information',
    message: 'Please fill in all required fields marked with an asterisk (*) before submitting.',
    action: 'Complete all required fields',
    type: 'warning' as const
  },
  
  INVALID_PHONE: {
    title: 'Invalid Phone Number',
    message: 'Please enter a valid phone number with country code (e.g., +1-555-123-4567).',
    action: 'Check your phone number format',
    type: 'error' as const
  },
  
  INVALID_DATE: {
    title: 'Invalid Date',
    message: 'Please enter a valid date. You must be at least 18 years old to register.',
    action: 'Enter a valid birth date',
    type: 'error' as const
  },

  AGE_REQUIREMENT: {
    title: 'Age Requirement Not Met',
    message: 'You must be at least 18 years old to create an account.',
    action: 'Verify your date of birth',
    type: 'error' as const
  },

  INVALID_LINKEDIN_URL: {
    title: 'Invalid LinkedIn URL',
    message: 'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname).',
    action: 'Check your LinkedIn URL format',
    type: 'error' as const
  },

  INVALID_PORTFOLIO_URL: {
    title: 'Invalid Portfolio URL',
    message: 'Please enter a valid portfolio URL (e.g., https://yourportfolio.com).',
    action: 'Check your portfolio URL format',
    type: 'error' as const
  },

  MISSING_EXPERIENCE: {
    title: 'Experience Information Required',
    message: 'Please specify your years of experience to help us match you with suitable positions.',
    action: 'Select your experience level',
    type: 'warning' as const
  },

  MISSING_EDUCATION: {
    title: 'Education Information Required',
    message: 'Please provide your education level to complete your profile.',
    action: 'Select your education level',
    type: 'warning' as const
  },

  MISSING_LOCATION: {
    title: 'Location Required',
    message: 'Please provide your current location to help us find relevant opportunities.',
    action: 'Enter your current location',
    type: 'warning' as const
  },
  
  // Server errors
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Our team has been notified and is working to fix this.',
    action: 'Please try again in a few minutes',
    type: 'error' as const
  },
  
  RATE_LIMIT: {
    title: 'Too Many Attempts',
    message: 'You\'ve made too many registration attempts. Please wait a few minutes before trying again.',
    action: 'Wait 5 minutes and try again',
    type: 'warning' as const
  },
  
  // Role-specific errors
  INVALID_EMPLOYEE_ID: {
    title: 'Invalid Employee ID',
    message: 'The employee ID you entered is not valid or already in use. Please check with your manager.',
    action: 'Verify your employee ID',
    type: 'error' as const
  },
  
  INVALID_APPROVAL_CODE: {
    title: 'Invalid Approval Code',
    message: 'The manager approval code is incorrect. Please get the correct code from your manager.',
    action: 'Contact your manager for the approval code',
    type: 'error' as const
  },
  
  UNAUTHORIZED_DOMAIN: {
    title: 'Company Email Not Allowed',
    message: 'Candidates should use personal email addresses for registration. Company emails are reserved for internal employee accounts.',
    action: 'Use your personal email address',
    type: 'error' as const
  },

  UNAUTHORIZED_DOMAIN_EMPLOYEE: {
    title: 'Unauthorized Email Domain',
    message: 'Only Vermeg employees can register with internal roles. Please use your @vermeg.com email address.',
    action: 'Use your company email address',
    type: 'error' as const
  },
  
  // Login-specific errors
  INVALID_CREDENTIALS: {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    action: 'Check your email and password',
    type: 'error' as const
  },

  ACCOUNT_NOT_FOUND: {
    title: 'Account Not Found',
    message: 'No account found with this email address. Please check your email or create a new account.',
    action: 'Check your email or register',
    type: 'error' as const
  },

  ACCOUNT_DISABLED: {
    title: 'Account Disabled',
    message: 'Your account has been disabled. Please contact support for assistance.',
    action: 'Contact support',
    type: 'error' as const
  },

  ACCOUNT_LOCKED: {
    title: 'Account Locked',
    message: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
    action: 'Wait and try again later',
    type: 'error' as const
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    title: 'Operation Failed',
    message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    action: 'Try again or contact support',
    type: 'error' as const
  }
};

// Function to parse error and return user-friendly message
export const parseRegistrationError = (error: any, context: 'candidate' | 'employee' = 'candidate'): ErrorDetails => {
  // Only log detailed parsing in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Parsing registration error:', error, 'Context:', context);
  }

  // Handle specific API errors first
  if (error?.message) {
    // Handle the specific "accessToken is not defined" error
    if (error.message.includes('accessToken is not defined')) {
      return {
        title: 'Authentication Error',
        message: 'There was an issue with the authentication system. This is likely a temporary problem. Please try registering again.',
        action: 'Try registering again',
        type: 'error'
      };
    }
  }

  // Handle AxiosError objects (API errors)
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 HTTP Error Response:', { status, data });
    }

    // Handle structured API error responses
    if (data?.errorDetails?.code) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Found structured error code:', data.errorDetails.code);
      }
      return parseErrorCode(data.errorDetails.code, context);
    }

    // Handle direct error codes in message
    if (data?.message && typeof data.message === 'string') {
      // Check if the message is an error code
      const upperMessage = data.message.toUpperCase();
      if (upperMessage === 'UNAUTHORIZED_DOMAIN' ||
          upperMessage === 'EMAIL_ALREADY_EXISTS' ||
          upperMessage === 'WEAK_PASSWORD' ||
          upperMessage === 'INVALID_EMAIL' ||
          upperMessage === 'INVALID_EMPLOYEE_ID' ||
          upperMessage === 'INVALID_APPROVAL_CODE') {
        return parseErrorCode(upperMessage, context);
      }
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        if (data?.message?.includes('email') && data?.message?.includes('exists')) {
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        }
        return {
          title: 'Invalid Request',
          message: data?.message || 'Please check your information and try again.',
          action: 'Review your information',
          type: 'warning'
        };

      case 409:
        return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;

      case 422:
        return {
          title: 'Validation Error',
          message: data?.message || 'Please check all required fields and try again.',
          action: 'Check your information',
          type: 'warning'
        };

      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;

      default:
        if (data?.message) {
          return parseStringError(data.message, context);
        }
    }
  }

  // Handle direct error code strings (like 'UNAUTHORIZED_DOMAIN')
  if (typeof error === 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Error is string:', error);
    }

    // Use parseErrorCode for consistent handling
    return parseErrorCode(error, context);
  }

  // Handle Error objects with message property
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Error is Error instance with message:', error.message);
    }

    // Use parseErrorCode for consistent handling
    return parseErrorCode(error.message, context);
  }

  // Handle API response errors
  if (error?.response?.data?.message) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 Error from API response:', error.response.data.message);
    }
    return parseStringError(error.response.data.message, context);
  }

  // Handle error objects with message property
  if (error?.message) {
    if (process.env.NODE_ENV === 'development') {
      console.log('💬 Error has message property:', error.message);
    }
    return parseStringError(error.message, context);
  }

  // Handle error codes
  if (error?.code) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔢 Error has code property:', error.code);
    }
    return parseErrorCode(error.code);
  }

  // Network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 Network error detected');
    }
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Default fallback
  if (process.env.NODE_ENV === 'development') {
    console.log('❓ Unknown error type, using fallback');
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Parse string error messages
const parseStringError = (errorString: string, context: 'candidate' | 'employee' = 'candidate'): ErrorDetails => {
  const lowerError = errorString.toLowerCase();

  // Domain-related errors
  if (lowerError.includes('unauthorized') && lowerError.includes('domain')) {
    return context === 'employee'
      ? ERROR_MESSAGES.UNAUTHORIZED_DOMAIN_EMPLOYEE
      : ERROR_MESSAGES.UNAUTHORIZED_DOMAIN;
  }

  // Email-related errors
  if (lowerError.includes('email') && lowerError.includes('already')) {
    return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
  }

  if (lowerError.includes('email') && lowerError.includes('invalid')) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }

  // Password-related errors
  if (lowerError.includes('password') && (lowerError.includes('weak') || lowerError.includes('strength'))) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }

  if (lowerError.includes('password') && lowerError.includes('match')) {
    return ERROR_MESSAGES.PASSWORD_MISMATCH;
  }

  // Contact information errors
  if (lowerError.includes('phone') || lowerError.includes('telephone')) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }

  // File-related errors
  if (lowerError.includes('resume') && lowerError.includes('required')) {
    return ERROR_MESSAGES.RESUME_REQUIRED;
  }

  if (lowerError.includes('file') && (lowerError.includes('type') || lowerError.includes('format'))) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }

  if (lowerError.includes('file') && (lowerError.includes('large') || lowerError.includes('size'))) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  // Profile information errors
  if (lowerError.includes('linkedin') && lowerError.includes('url')) {
    return ERROR_MESSAGES.INVALID_LINKEDIN_URL;
  }

  if (lowerError.includes('portfolio') && lowerError.includes('url')) {
    return ERROR_MESSAGES.INVALID_PORTFOLIO_URL;
  }

  if (lowerError.includes('age') || (lowerError.includes('18') && lowerError.includes('years'))) {
    return ERROR_MESSAGES.AGE_REQUIREMENT;
  }

  if (lowerError.includes('experience') && lowerError.includes('required')) {
    return ERROR_MESSAGES.MISSING_EXPERIENCE;
  }

  if (lowerError.includes('education') && lowerError.includes('required')) {
    return ERROR_MESSAGES.MISSING_EDUCATION;
  }

  if (lowerError.includes('location') && lowerError.includes('required')) {
    return ERROR_MESSAGES.MISSING_LOCATION;
  }

  if (lowerError.includes('job') && lowerError.includes('categor')) {
    return ERROR_MESSAGES.INVALID_JOB_CATEGORIES;
  }
  
  if (lowerError.includes('employee') && lowerError.includes('id')) {
    return ERROR_MESSAGES.INVALID_EMPLOYEE_ID;
  }
  
  if (lowerError.includes('approval') && lowerError.includes('code')) {
    return ERROR_MESSAGES.INVALID_APPROVAL_CODE;
  }
  
  if (lowerError.includes('domain') || lowerError.includes('unauthorized')) {
    return ERROR_MESSAGES.UNAUTHORIZED_DOMAIN;
  }
  
  if (lowerError.includes('rate') || lowerError.includes('too many')) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }
  
  if (lowerError.includes('server') || lowerError.includes('internal')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  if (lowerError.includes('network') || lowerError.includes('connection')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Return the original message with a generic title
  return {
    title: 'Registration Error',
    message: errorString,
    action: 'Please try again',
    type: 'error'
  };
};

// Parse error codes
const parseErrorCode = (code: string, context: 'candidate' | 'employee' = 'candidate'): ErrorDetails => {
  switch (code) {
    case 'EMAIL_EXISTS':
    case 'EMAIL_ALREADY_EXISTS':
      return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
    case 'WEAK_PASSWORD':
      return ERROR_MESSAGES.WEAK_PASSWORD;
    case 'INVALID_EMAIL':
      return ERROR_MESSAGES.INVALID_EMAIL;
    case 'UNAUTHORIZED_DOMAIN':
      // Return different message based on context
      return context === 'employee'
        ? ERROR_MESSAGES.UNAUTHORIZED_DOMAIN_EMPLOYEE
        : ERROR_MESSAGES.UNAUTHORIZED_DOMAIN;
    case 'INVALID_EMPLOYEE_ID':
      return ERROR_MESSAGES.INVALID_EMPLOYEE_ID;
    case 'INVALID_APPROVAL_CODE':
      return ERROR_MESSAGES.INVALID_APPROVAL_CODE;
    case 'RATE_LIMIT_EXCEEDED':
      return ERROR_MESSAGES.RATE_LIMIT;
    case 'SERVER_ERROR':
      return ERROR_MESSAGES.SERVER_ERROR;
    case 'NETWORK_ERROR':
      return ERROR_MESSAGES.NETWORK_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Function to parse login errors
export const parseLoginError = (error: any): ErrorDetails => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Parsing login error:', error);
  }

  // Handle HTTP response errors
  if (error?.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        if (data?.message?.toLowerCase().includes('credentials')) {
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        }
        if (data?.message?.toLowerCase().includes('disabled')) {
          return ERROR_MESSAGES.ACCOUNT_DISABLED;
        }
        if (data?.message?.toLowerCase().includes('locked')) {
          return ERROR_MESSAGES.ACCOUNT_LOCKED;
        }
        return ERROR_MESSAGES.INVALID_CREDENTIALS;

      case 404:
        return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;

      case 403:
        return ERROR_MESSAGES.ACCOUNT_DISABLED;

      case 429:
        return ERROR_MESSAGES.RATE_LIMIT;

      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('credentials') || lowerError.includes('password') || lowerError.includes('invalid')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }

    if (lowerError.includes('not found') || lowerError.includes('account')) {
      return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
    }

    if (lowerError.includes('disabled')) {
      return ERROR_MESSAGES.ACCOUNT_DISABLED;
    }

    if (lowerError.includes('locked')) {
      return ERROR_MESSAGES.ACCOUNT_LOCKED;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return parseLoginError(error.message);
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Success messages for different registration types
export const SUCCESS_MESSAGES = {
  CANDIDATE: {
    title: 'Account Created Successfully!',
    message: 'Your candidate account has been created. You can now sign in and start applying for jobs.',
    action: 'Sign in to your account'
  },
  PROJECT_LEADER: {
    title: 'Project Leader Account Created!',
    message: 'Your project leader account has been created and is pending approval. You\'ll receive an email once approved.',
    action: 'Check your email for updates'
  },
  RH: {
    title: 'HR Manager Account Created!',
    message: 'Your HR manager account has been created and is pending approval. You\'ll receive an email once approved.',
    action: 'Check your email for updates'
  }
};
