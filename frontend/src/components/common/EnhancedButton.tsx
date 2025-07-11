import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'role-primary' | 'role-secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 focus:ring-red-500',
  secondary: 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 hover:border-gray-700 focus:ring-gray-500',
  outlined: 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
  ghost: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 focus:ring-gray-500',
  'role-primary': 'text-white border-transparent focus:ring-2',
  'role-secondary': 'bg-transparent border-2 focus:ring-2'
};

const sizeStyles = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-sm',
  large: 'px-6 py-3 text-base'
};

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = variant === 'role-primary' 
    ? 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] border-[var(--color-primary)] hover:border-[var(--color-secondary)] focus:ring-[var(--color-primary)]'
    : variant === 'role-secondary'
    ? 'text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-[var(--color-primary)]'
    : variantStyles[variant];

  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <Loader2 className={cn(
          'animate-spin',
          size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4',
          (children || icon) && 'mr-2'
        )} />
      )}
      {!loading && icon && (
        <span className={cn(
          size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4',
          children && 'mr-2'
        )}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};
