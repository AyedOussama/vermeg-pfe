// Error Handling Demo Page

import React, { useState } from 'react';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { parseRegistrationError, ERROR_MESSAGES } from '@/utils/errorMessages';

const ErrorHandlingDemo: React.FC = () => {
  const [currentError, setCurrentError] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('test@example.com');

  const simulateError = (errorType: string) => {
    let error;
    
    switch (errorType) {
      case 'EMAIL_ALREADY_EXISTS':
        error = new Error('EMAIL_ALREADY_EXISTS');
        break;
      case 'WEAK_PASSWORD':
        error = new Error('WEAK_PASSWORD');
        break;
      case 'INVALID_EMAIL':
        error = new Error('INVALID_EMAIL');
        break;
      case 'NETWORK_ERROR':
        error = { name: 'NetworkError', message: 'Network connection failed' };
        break;
      case 'SERVER_ERROR':
        error = new Error('Internal server error occurred');
        break;
      default:
        error = new Error('Unknown error occurred');
    }

    const errorDetails = parseRegistrationError(error);
    setCurrentError(errorDetails);
    
    // Scroll to top to show error
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearError = () => {
    setCurrentError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Error Handling Demo
            </h1>
            <p className="text-gray-600">
              Test the improved error handling system with user-friendly messages
            </p>
          </div>

          {/* Error Display */}
          {currentError && (
            <div className="sticky top-4 z-50">
              <Alert
                type={currentError.type}
                title={currentError.title}
                message={currentError.message}
                action={currentError.action}
                onClose={clearError}
                className="shadow-lg border-2"
              />
            </div>
          )}

          {/* Test Email Input */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Registration Error
            </h2>
            <div className="space-y-4">
              <Input
                label="Test Email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test with"
              />
              <p className="text-sm text-gray-600">
                Try registering with this email to see the "Email Already Exists" error
              </p>
              <Button
                onClick={() => simulateError('EMAIL_ALREADY_EXISTS')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Test Email Already Exists Error
              </Button>
            </div>
          </Card>

          {/* Error Type Tests */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Different Error Types
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                variant="outlined"
                onClick={() => simulateError('EMAIL_ALREADY_EXISTS')}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                Email Already Exists
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => simulateError('WEAK_PASSWORD')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Weak Password
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => simulateError('INVALID_EMAIL')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Invalid Email
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => simulateError('NETWORK_ERROR')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Network Error
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => simulateError('SERVER_ERROR')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Server Error
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => simulateError('UNKNOWN')}
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
              >
                Unknown Error
              </Button>
            </div>
          </Card>

          {/* Error Messages Reference */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Error Messages Reference
            </h2>
            <div className="space-y-4">
              {Object.entries(ERROR_MESSAGES).map(([key, error]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{error.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      error.type === 'error' ? 'bg-red-100 text-red-800' :
                      error.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {error.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{error.message}</p>
                  {error.action && (
                    <p className="text-xs text-gray-500">💡 {error.action}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Features */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✨ Improved Error Handling Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">User Experience</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prominent error display at top of page</li>
                  <li>• Automatic scroll to error message</li>
                  <li>• Sticky positioning for visibility</li>
                  <li>• Clear, actionable error messages</li>
                  <li>• Contextual action buttons</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technical</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• No console logs in production</li>
                  <li>• Proper error parsing and categorization</li>
                  <li>• Graceful error recovery</li>
                  <li>• Consistent error handling across forms</li>
                  <li>• Enhanced visual feedback</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              🧪 How to Test
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>1. Email Already Exists Error:</strong> Go to the registration page and try to register with an email that already exists in the system (like admin@vermeg.com).
              </p>
              <p>
                <strong>2. Form Validation:</strong> Try submitting the registration form with invalid data to see field-level validation errors.
              </p>
              <p>
                <strong>3. Network Simulation:</strong> Use the buttons above to simulate different error scenarios.
              </p>
              <p>
                <strong>4. Console Check:</strong> Open browser dev tools and notice that error logs only appear in development mode.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;
