import React from 'react';
import { cn } from '@/utils/cn';

interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'role-primary' | 'role-secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  secondary: 'bg-gray-100 text-gray-600 border-gray-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-red-100 text-red-800 border-red-200',
  outline: 'bg-transparent text-gray-600 border-gray-300',
  'role-primary': 'text-white border-transparent',
  'role-secondary': 'bg-transparent border-2'
};

const sizeStyles = {
  small: 'px-2 py-0.5 text-xs',
  medium: 'px-2.5 py-1 text-sm',
  large: 'px-3 py-1.5 text-base'
};

export const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  className,
  icon
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-all duration-200';
  
  const variantClasses = variant === 'role-primary' 
    ? 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
    : variant === 'role-secondary'
    ? 'text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
    : variantStyles[variant];

  return (
    <span
      className={cn(
        baseClasses,
        variantClasses,
        sizeStyles[size],
        className
      )}
    >
      {icon && (
        <span className={cn(
          'mr-1',
          size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'
        )}>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};
