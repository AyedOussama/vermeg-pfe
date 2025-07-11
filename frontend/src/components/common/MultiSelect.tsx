import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  maxSelections?: number;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  error,
  helperText,
  required,
  className,
  maxSelections
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter(option => value.includes(option.value));

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-blue-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer',
            'focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
            'transition-colors duration-200',
            error && 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500',
            isOpen && 'ring-2 ring-blue-500 border-blue-500'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveOption(option.value, e)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            )}
            
            <div className="flex-1 min-w-0">
              {isOpen && (
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-none outline-none bg-transparent text-sm"
                  placeholder="Search..."
                  autoFocus
                />
              )}
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {selectedOptions.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all ({selectedOptions.length})
                </button>
              </div>
            )}
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => {
                const isSelected = value.includes(option.value);
                const isDisabled = maxSelections && !isSelected && value.length >= maxSelections;
                
                return (
                  <div
                    key={option.value}
                    className={cn(
                      'px-3 py-2 cursor-pointer flex items-center justify-between',
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-900 hover:bg-gray-50',
                      isDisabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => !isDisabled && handleToggleOption(option.value)}
                  >
                    <span className="text-sm">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {maxSelections && (
        <p className="mt-1 text-xs text-gray-500">
          {value.length}/{maxSelections} selected
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
