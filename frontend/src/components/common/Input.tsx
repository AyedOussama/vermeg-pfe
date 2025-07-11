import React from 'react';
import { TextField, TextFieldProps, InputAdornment } from '@mui/material';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  icon,
  iconPosition = 'start',
  className,
  ...props
}) => {
  const inputAdornment = icon ? (
    <InputAdornment position={iconPosition}>
      <span className="text-gray-400">{icon}</span>
    </InputAdornment>
  ) : undefined;

  return (
    <TextField
      variant={variant}
      fullWidth
      className={cn('transition-all duration-300', className)}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '0.5rem',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B82F6',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3B82F6',
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: '#3B82F6',
        },
      }}
      InputProps={{
        ...(iconPosition === 'start' && { startAdornment: inputAdornment }),
        ...(iconPosition === 'end' && { endAdornment: inputAdornment }),
        ...props.InputProps,
      }}
      {...props}
    />
  );
};