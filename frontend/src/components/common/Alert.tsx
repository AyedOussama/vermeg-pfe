import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  action?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const alertIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const alertStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-red-50 border-red-200 text-red-800',
};

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  action,
  children,
  onClose,
  onRetry,
  className,
  icon
}) => {
  const Icon = icon ? null : alertIcons[type];

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all duration-300',
        alertStyles[type],
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon || (Icon && <Icon className="w-5 h-5" />)}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm mb-2">
              {message}
            </p>
          )}
          {action && (
            <p className="text-xs opacity-75 mb-2">
              💡 {action}
            </p>
          )}
          {children && (
            <div className="text-sm">
              {children}
            </div>
          )}
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Try Again
              </button>
            </div>
          )}
        </div>
        {onClose && (
          <div className="flex-shrink-0 ml-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};