import React, { useEffect } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  RefreshCw, 
  LogIn,
  X,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ErrorDetails } from '@/utils/errorMessages';

interface RegistrationErrorDisplayProps {
  error: ErrorDetails | null;
  onClose: () => void;
  onRetry?: () => void;
  className?: string;
  showSignInLink?: boolean;
}

const getErrorIcon = (type: string) => {
  switch (type) {
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    case 'success':
      return CheckCircle;
    default:
      return AlertCircle;
  }
};

const getErrorStyles = (type: string) => {
  switch (type) {
    case 'error':
      return {
        container: 'bg-red-50 border-red-200 shadow-red-100',
        icon: 'text-red-600',
        title: 'text-red-800',
        message: 'text-red-700',
        action: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700 text-white',
        closeButton: 'text-red-400 hover:text-red-600'
      };
    case 'warning':
      return {
        container: 'bg-amber-50 border-amber-200 shadow-amber-100',
        icon: 'text-amber-600',
        title: 'text-amber-800',
        message: 'text-amber-700',
        action: 'text-amber-600',
        button: 'bg-amber-600 hover:bg-amber-700 text-white',
        closeButton: 'text-amber-400 hover:text-amber-600'
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200 shadow-blue-100',
        icon: 'text-blue-600',
        title: 'text-blue-800',
        message: 'text-blue-700',
        action: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700 text-white',
        closeButton: 'text-blue-400 hover:text-blue-600'
      };
    case 'success':
      return {
        container: 'bg-green-50 border-green-200 shadow-green-100',
        icon: 'text-green-600',
        title: 'text-green-800',
        message: 'text-green-700',
        action: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700 text-white',
        closeButton: 'text-green-400 hover:text-green-600'
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200 shadow-gray-100',
        icon: 'text-gray-600',
        title: 'text-gray-800',
        message: 'text-gray-700',
        action: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700 text-white',
        closeButton: 'text-gray-400 hover:text-gray-600'
      };
  }
};

export const RegistrationErrorDisplay: React.FC<RegistrationErrorDisplayProps> = ({
  error,
  onClose,
  onRetry,
  className,
  showSignInLink = true
}) => {
  // Auto-scroll to top when error appears
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  if (!error) return null;

  const Icon = getErrorIcon(error.type);
  const styles = getErrorStyles(error.type);

  return (
    <div className={cn(
      'fixed top-4 left-4 right-4 z-50 mx-auto max-w-4xl',
      'animate-in slide-in-from-top-2 duration-300',
      className
    )}>
      <div className={cn(
        'border-2 rounded-xl p-6 shadow-2xl backdrop-blur-sm',
        styles.container
      )}>
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={cn('w-6 h-6', styles.icon)} />
          </div>

          {/* Content */}
          <div className="ml-4 flex-1">
            {/* Title */}
            <h3 className={cn('text-lg font-semibold mb-2', styles.title)}>
              {error.title}
            </h3>

            {/* Message */}
            <p className={cn('text-sm mb-3 leading-relaxed', styles.message)}>
              {error.message}
            </p>

            {/* Action hint */}
            {error.action && (
              <div className={cn('text-xs mb-4 flex items-center', styles.action)}>
                <Info className="w-3 h-3 mr-1" />
                {error.action}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Retry button */}
              {onRetry && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={onRetry}
                  className={cn('text-xs', styles.button)}
                  icon={<RefreshCw className="w-3 h-3" />}
                >
                  Try Again
                </Button>
              )}

              {/* Sign in link for email already exists */}
              {showSignInLink && error.title === 'Email Already Registered' && (
                <Link to="/auth/signin">
                  <Button
                    variant="outlined"
                    size="small"
                    className={cn(
                      'text-xs border-current',
                      error.type === 'warning' ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 
                      'border-red-300 text-red-700 hover:bg-red-50'
                    )}
                    icon={<LogIn className="w-3 h-3" />}
                  >
                    Sign In Instead
                  </Button>
                </Link>
              )}

              {/* External link for help */}
              {(error.title.includes('Invalid') || error.title.includes('Required')) && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => window.open('/help/registration', '_blank')}
                  className={cn('text-xs', styles.action)}
                  icon={<ExternalLink className="w-3 h-3" />}
                >
                  Get Help
                </Button>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-shrink-0 ml-4 p-1 rounded-full hover:bg-black/5 transition-colors',
              styles.closeButton
            )}
            aria-label="Close error message"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
