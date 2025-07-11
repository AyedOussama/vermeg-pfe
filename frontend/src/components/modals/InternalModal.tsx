// modals/InternalModal.tsx
import React, { memo, useState, useCallback } from 'react';
import { User, Lock, Eye, EyeOff, Briefcase, ChevronDown } from 'lucide-react';
import { InternalModalProps, InternalFormData } from '@/types';

const InternalModal: React.FC<InternalModalProps> = memo(({ onSubmit }) => {
  const [formData, setFormData] = useState<InternalFormData>({
    username: '',
    password: '',
    role: ''
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const roles = [
    { value: 'admin', label: 'Super Admin' },
    { value: 'hr', label: 'HR Admin' },
    { value: 'pl', label: 'Project Leader' },
    { value: 'ceo', label: 'CEO' }
  ];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must contain at least 3 characters";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must contain at least 8 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Please select your role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, validateForm, onSubmit]);
  
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return (
    <div className="p-8">
      <div className="text-center mb-8">
        <div className="text-4xl font-bold mb-4">
          <span className="text-red-600">/</span>vermeg
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Employee Portal</h2>
        <p className="text-gray-600 mt-2">Access internal systems with your Vermeg credentials</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="firstname.lastname"
              autoComplete="username"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.username}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.password}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your role</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.role}
            </p>
          )}
        </div>
        
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
          <a href="#" className="text-sm text-red-600 hover:text-red-700 transition-colors">
            Forgot password?
          </a>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
        >
          Sign In
        </button>
        
        {formSubmitted && Object.keys(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Please correct the errors above to continue.
            </p>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-600">
          Need assistance? Contact{' '}
          <a href="mailto:it.support@vermeg.com" className="text-red-600 hover:text-red-700 transition-colors">
            it.support@vermeg.com
          </a>
        </div>
      </form>
    </div>
  );
});

InternalModal.displayName = 'InternalModal';

export default InternalModal;