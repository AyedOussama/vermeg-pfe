import React from 'react';
import { Alert } from './Alert';
import { Button } from './Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  variant?: 'inline' | 'page' | 'card';
  showIcon?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  retryLabel = 'Try again',
  className,
  variant = 'inline',
  showIcon = true
}) => {
  const errorMessage = message || 
    (typeof error === 'string' ? error : error?.message) || 
    'An unexpected error occurred. Please try again.';

  const baseClasses = 'text-center';

  const variantClasses = {
    inline: 'py-4',
    page: 'min-h-[400px] flex flex-col items-center justify-center py-16',
    card: 'p-8 bg-white rounded-xl shadow-sm border border-gray-200'
  };

  if (variant === 'inline') {
    return (
      <Alert 
        severity="error" 
        title={title}
        className={cn(className)}
      >
        <div className="space-y-3">
          <p>{errorMessage}</p>
          {onRetry && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onRetry}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              {retryLabel}
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )}>
      {showIcon && (
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {errorMessage}
      </p>
      
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          onClick={onRetry}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          {retryLabel}
        </Button>
      )}
      
      {process.env.NODE_ENV === 'development' && error instanceof Error && (
        <details className="mt-6 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Technical details
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-800 overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};