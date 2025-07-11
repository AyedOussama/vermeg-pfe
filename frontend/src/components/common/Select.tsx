import React, { forwardRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  FormHelperText,
  SelectProps as MuiSelectProps,
  SelectChangeEvent
} from '@mui/material';
import { cn } from '@/utils/cn';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string; // Changed from boolean to string to match error message
  variant?: 'outlined' | 'filled' | 'standard';
  className?: string;
  required?: boolean;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: SelectChangeEvent<string | number>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const Select = forwardRef<any, SelectProps>(({
  label,
  options,
  helperText,
  error,
  variant = 'outlined',
  className,
  value,
  defaultValue,
  required = false,
  name,
  onChange,
  onBlur,
  disabled = false
}, ref) => {
  const labelId = `select-label-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  // Ensure we always have a controlled value (never undefined)
  const controlledValue = value !== undefined ? value : (defaultValue || '');

  return (
    <FormControl
      fullWidth
      variant={variant}
      error={hasError}
      className={cn('transition-all duration-300', className)}
    >
      {label && (
        <InputLabel
          id={labelId}
          sx={{
            '&.Mui-focused': {
              color: hasError ? '#EF4444' : '#3B82F6',
            },
          }}
        >
          {label}
          {required && <span style={{ color: hasError ? '#EF4444' : '#3B82F6', marginLeft: '4px' }}>*</span>}
        </InputLabel>
      )}
      <MuiSelect
        labelId={labelId}
        label={label}
        value={controlledValue}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        ref={ref}
        sx={{
          borderRadius: '0.5rem',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? '#EF4444' : '#DC2626',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: hasError ? '#EF4444' : '#DC2626',
            borderWidth: 2,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#EF4444',
          },
        }}
      >
        <MenuItem value="" disabled>
          <em>Select an option...</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="hover:bg-red-50"
          >
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
});

Select.displayName = 'Select';