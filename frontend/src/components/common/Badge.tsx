import React from 'react';
import { Badge as MuiBadge, Chip } from '@mui/material';
import { cn } from '@/utils/cn';

interface BadgeProps {
  children?: React.ReactNode;
  content?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'low-priority' | 'high-impact' | 'medium-priority';
  variant?: 'dot' | 'standard' | 'chip' | 'modern' | 'gradient' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  invisible?: boolean;
  max?: number;
  icon?: React.ReactNode;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  content,
  color = 'primary',
  variant = 'standard',
  size = 'medium',
  className,
  invisible = false,
  max = 99,
  icon,
  pulse = false
}) => {
  // Enhanced color classes with gradients and modern styles
  const colorClasses = {
    primary: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25',
    warning: 'bg-gradient-to-r from-orange-400 to-yellow-500 text-white shadow-lg shadow-orange-500/25',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
    'low-priority': 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-500/30 border border-green-300',
    'high-impact': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 border border-purple-300',
    'medium-priority': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/30 border border-yellow-300',
  };

  // Outlined variants
  const outlinedClasses = {
    primary: 'border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-100',
    secondary: 'border-2 border-gray-500 text-gray-600 bg-gray-50 hover:bg-gray-100',
    error: 'border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-100',
    warning: 'border-2 border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100',
    info: 'border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100',
    success: 'border-2 border-green-500 text-green-600 bg-green-50 hover:bg-green-100',
    'low-priority': 'border-2 border-green-400 text-green-600 bg-green-50 hover:bg-green-100',
    'high-impact': 'border-2 border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100',
    'medium-priority': 'border-2 border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1 min-w-[20px] h-6 rounded-full',
    medium: 'text-sm px-3 py-1.5 min-w-[24px] h-7 rounded-full',
    large: 'text-base px-4 py-2 min-w-[28px] h-8 rounded-full',
  };

  // Modern badge variants
  if (variant === 'modern' || variant === 'gradient') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold transition-all duration-300 transform hover:scale-105',
          colorClasses[color],
          sizeClasses[size],
          pulse && 'animate-pulse',
          'backdrop-blur-sm',
          className
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {content}
      </span>
    );
  }

  if (variant === 'outlined') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold transition-all duration-300 transform hover:scale-105',
          outlinedClasses[color],
          sizeClasses[size],
          pulse && 'animate-pulse',
          className
        )}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {content}
      </span>
    );
  }

  if (variant === 'chip') {
    return (
      <Chip
        label={content}
        color={color === 'low-priority' || color === 'high-impact' || color === 'medium-priority' ? 'primary' : color}
        size={size === 'large' ? 'medium' : 'small'}
        className={cn(
          'transition-all duration-300 transform hover:scale-105',
          className
        )}
        sx={{
          borderRadius: '9999px',
          fontWeight: 600,
          background: color === 'low-priority' ? 'linear-gradient(45deg, #10b981, #059669)' :
                     color === 'high-impact' ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' :
                     color === 'medium-priority' ? 'linear-gradient(45deg, #f59e0b, #f97316)' : undefined,
          color: 'white',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        }}
      />
    );
  }

  if (!children) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-300',
          colorClasses[color],
          sizeClasses[size],
          className
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <MuiBadge
      badgeContent={content}
      color={color}
      variant={variant === 'chip' ? 'standard' : variant}
      invisible={invisible}
      max={max}
      className={cn('transition-all duration-300', className)}
      sx={{
        '& .MuiBadge-badge': {
          borderRadius: '9999px',
          minWidth: size === 'small' ? 16 : size === 'medium' ? 20 : 24,
          height: size === 'small' ? 16 : size === 'medium' ? 20 : 24,
          fontSize: size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem',
        },
      }}
    >
      {children}
    </MuiBadge>
  );
};