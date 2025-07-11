import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { cn } from '@/utils/cn';

interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: 'contained' | 'outlined' | 'text' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  size = 'medium',
  color = 'primary',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'transition-all duration-300 font-medium';
  
  const variantClasses = {
    contained: 'shadow-lg hover:shadow-xl transform hover:scale-105',
    outlined: 'border-2 hover:bg-gray-50',
    text: 'hover:bg-gray-50',
    gradient: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
  };

  const isDisabled = disabled || loading;

  return (
    <MuiButton
      variant={variant === 'gradient' ? 'contained' : variant}
      size={size}
      color={variant === 'gradient' ? undefined : color}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      sx={{
        borderRadius: '9999px',
        textTransform: 'none',
        ...(variant === 'gradient' && {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          }
        })
      }}
      {...props}
    >
      {loading && (
        <CircularProgress 
          size={16} 
          color="inherit" 
          className="mr-2" 
        />
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </MuiButton>
  );
};