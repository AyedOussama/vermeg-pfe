import React, { useEffect } from 'react';
import { CheckCircle, ArrowRight, Mail, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

interface RegistrationSuccessDisplayProps {
  show: boolean;
  title?: string;
  message?: string;
  action?: string;
  onContinue?: () => void;
  className?: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export const RegistrationSuccessDisplay: React.FC<RegistrationSuccessDisplayProps> = ({
  show,
  title = 'Account Created Successfully!',
  message = 'Your candidate account has been created. You can now sign in and start applying for jobs.',
  action = 'Continue to Dashboard',
  onContinue,
  className,
  autoRedirect = true,
  redirectDelay = 3000
}) => {
  // Auto-redirect after delay
  useEffect(() => {
    if (show && autoRedirect && onContinue) {
      const timer = setTimeout(() => {
        onContinue();
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [show, autoRedirect, onContinue, redirectDelay]);

  if (!show) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm',
      'animate-in fade-in duration-300',
      className
    )}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Features/Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
            <span>Complete your profile to get better job matches</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
            <span>Receive email notifications for new opportunities</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ArrowRight className="w-4 h-4 text-green-600 mr-3 flex-shrink-0" />
            <span>Start applying to jobs immediately</span>
          </div>
        </div>

        {/* Action Button */}
        {onContinue && (
          <div className="text-center">
            <Button
              variant="contained"
              color="primary"
              onClick={onContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {action}
            </Button>
            
            {autoRedirect && (
              <p className="text-xs text-gray-500 mt-2">
                Redirecting automatically in {redirectDelay / 1000} seconds...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
