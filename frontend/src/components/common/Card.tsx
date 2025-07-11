import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardHeader } from '@mui/material';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hover?: boolean;
  className?: string;
  contentClassName?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  hover = false,
  className,
  contentClassName,
  variant = 'default'
}) => {
  const baseClasses = 'transition-all duration-300';
  
  const variantClasses = {
    default: 'shadow-card',
    outlined: 'border border-gray-200 shadow-sm',
    elevated: 'shadow-card-hover'
  };

  const hoverClasses = hover ? 'hover:shadow-card-hover hover:-translate-y-1 cursor-pointer' : '';

  return (
    <MuiCard
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      sx={{
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          className="pb-2"
          titleTypographyProps={{
            variant: 'h6',
            className: 'font-semibold text-gray-900'
          }}
          subheaderTypographyProps={{
            variant: 'body2',
            className: 'text-gray-600'
          }}
        />
      )}
      
      <CardContent className={cn('py-4', contentClassName)}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions className="px-4 pb-4 pt-0">
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};