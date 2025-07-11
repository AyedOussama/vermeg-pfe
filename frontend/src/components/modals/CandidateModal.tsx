// modals/CandidateModal.tsx
import React, { memo, useState, useCallback } from 'react';
import { User, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { CandidateModalProps, CandidateFormData } from '@/types';

const CandidateModal: React.FC<CandidateModalProps> = memo(({
  isSignup,
  showPassword,
  selectedCountryCode,
  countryCodes,
  showCountryDropdown,
  onToggleSignup,
  onTogglePassword,
  onSelectCountryCode,
  onToggleCountryDropdown,
  onAuthenticate
}) => {
  const [formData, setFormData] = useState<CandidateFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }
    
    if (isSignup) {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      }
      if (!acceptTerms) {
        newErrors.terms = "You must accept the terms of use";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isSignup, acceptTerms]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAuthenticate();
    }
  }, [validateForm, onAuthenticate]);

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-3xl font-bold mb-2">
          <span className="text-red-600">/</span>vermeg
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Candidate Portal</h2>
        <p className="text-gray-600 mt-2">Sign in to access your applications</p>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={onToggleSignup}
          className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${
            !isSignup 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={onToggleSignup}
          className={`flex-1 pb-3 text-sm font-semibold transition-all duration-300 ${
            isSignup 
              ? 'text-red-600 border-b-2 border-red-600' 
              : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
          }`}
        >
          Create Account
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {isSignup && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <div className="flex">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100"
                  onClick={onToggleCountryDropdown}
                >
                  <span className="mr-1">{countryCodes.find(c => c.code === selectedCountryCode)?.flag}</span>
                  <span>{selectedCountryCode}</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                {showCountryDropdown && (
                  <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {countryCodes.map(country => (
                      <button
                        key={country.code}
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          onSelectCountryCode(country.code);
                          onToggleCountryDropdown();
                        }}
                      >
                        <span className="mr-2">{country.flag}</span>
                        <span>{country.country}</span>
                        <span className="ml-auto text-gray-500">{country.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="12 345 678"
              />
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        
        {!isSignup ? (
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500" 
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-red-600 hover:text-red-700">Forgot password?</a>
          </div>
        ) : (
          <div>
            <label className="flex items-start">
              <input 
                type="checkbox" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1" 
              />
              <span className="ml-2 text-sm text-gray-600">
                I accept the <a href="#" className="text-red-600 hover:text-red-700">Terms of Use</a> and{' '}
                <a href="#" className="text-red-600 hover:text-red-700">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
});

CandidateModal.displayName = 'CandidateModal';

export default CandidateModal;