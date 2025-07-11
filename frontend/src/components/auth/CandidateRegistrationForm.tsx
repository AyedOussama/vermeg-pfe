import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { FileUpload } from '@/components/common/FileUpload';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useCandidate } from '@/hooks/useCandidate';
import { ErrorHandlingService } from '@/services/errorHandlingService';

import { parseRegistrationError, SUCCESS_MESSAGES, type ErrorDetails } from '@/utils/errorMessages';
import { RegistrationErrorDisplay } from '@/components/common/RegistrationErrorDisplay';
import { RegistrationSuccessDisplay } from '@/components/common/RegistrationSuccessDisplay';

const candidateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  currentLocation: z.string().min(2, 'Current location is required'),
  educationLevel: z.string().min(1, 'Education level is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  coverLetter: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  preferredJobCategories: z.array(z.string()).min(1, 'Please select at least one job category'),
  expectedSalaryRange: z.string().min(1, 'Expected salary range is required'),
  availabilityToStart: z.string().min(1, 'Availability to start is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CandidateFormData = z.infer<typeof candidateSchema>;

interface CandidateRegistrationFormProps {
  onSuccess: (user?: any) => void;
  onLoading: (loading: boolean) => void;
}

const educationLevels = [
  { value: 'high_school', label: 'High School' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' }
];

const experienceLevels = [
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: '10+ years' }
];

const jobCategories = [
  { value: 'software_development', label: 'Software Development' },
  { value: 'frontend', label: 'Frontend Development' },
  { value: 'backend', label: 'Backend Development' },
  { value: 'fullstack', label: 'Full Stack Development' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'ui_ux', label: 'UI/UX Design' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'project_management', label: 'Project Management' }
];

const salaryRanges = [
  { value: '20000-30000', label: '€20K - €30K' },
  { value: '30000-40000', label: '€30K - €40K' },
  { value: '40000-50000', label: '€40K - €50K' },
  { value: '50000-60000', label: '€50K - €60K' },
  { value: '60000-80000', label: '€60K - €80K' },
  { value: '80000-100000', label: '€80K - €100K' },
  { value: '100000+', label: '€100K+' }
];

const availabilityOptions = [
  { value: 'immediately', label: 'Immediately' },
  { value: '2_weeks', label: '2 weeks notice' },
  { value: '1_month', label: '1 month notice' },
  { value: '2_months', label: '2 months notice' },
  { value: '3_months', label: '3+ months notice' }
];

export const CandidateRegistrationForm: React.FC<CandidateRegistrationFormProps> = ({
  onSuccess,
  onLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { registerCandidate, isRegistering } = useCandidate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
    setError: setFormError
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      preferredJobCategories: [],
      educationLevel: '',
      yearsOfExperience: '',
      expectedSalaryRange: '',
      availabilityToStart: ''
    }
  });

  const onSubmit = async (data: CandidateFormData) => {
    try {
      setError(null);
      setShowSuccess(false);
      onLoading(true);

      // Enhanced validation
      const validationError = validateCandidateData(data, resumeFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        location: data.currentLocation,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        dateOfBirth: data.dateOfBirth,
        preferredCategories: data.preferredJobCategories,
        cvFile: resumeFile!,
      };

      console.log('🚀 Starting candidate registration...');
      const result = await registerCandidate(registrationData);
      console.log('✅ Registration successful:', result);

      // Show success message and prepare for redirect
      setShowSuccess(true);

      // Call the success callback with the registered user data
      // This will trigger the navigation logic in the parent component
      setTimeout(() => {
        onSuccess(result);
      }, 2000); // Give user time to see the success message

    } catch (error: any) {
      console.error('❌ Registration failed:', error);

      // Handle RTK Query errors
      let errorMessage = 'Erreur lors de l\'inscription';

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.status === 400) {
        errorMessage = 'Données invalides, veuillez vérifier vos informations';
      } else if (error?.status === 409) {
        errorMessage = 'Un compte avec cet email existe déjà';
      } else if (error?.status === 500) {
        errorMessage = 'Erreur serveur, veuillez réessayer';
      }

      // Handle validation errors from backend
      if (ErrorHandlingService.isValidationError(error)) {
        const validationErrors = ErrorHandlingService.formatValidationErrorsForForm(error);

        // Set form field errors
        Object.entries(validationErrors).forEach(([field, message]) => {
          setFormError(field as keyof CandidateFormData, {
            type: 'manual',
            message
          });
        });

        // Also show general error
        const errorDetails = parseRegistrationError(error, 'candidate');
        setError(errorDetails);
      } else {
        // Use the error message we prepared or parse error for user-friendly message
        const errorDetails = parseRegistrationError(error, 'candidate');
        if (errorMessage !== 'Erreur lors de l\'inscription') {
          errorDetails.message = errorMessage;
        }
        setError(errorDetails);
      }

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      onLoading(false);
    }
  };

  // Enhanced validation function
  const validateCandidateData = (data: CandidateFormData, resumeFile: File | null): ErrorDetails | null => {
    // Resume validation
    if (!resumeFile) {
      return {
        title: 'Resume Required',
        message: 'Please upload your resume before submitting your application. We accept PDF, DOC, and DOCX files.',
        action: 'Upload your resume file',
        type: 'warning'
      };
    }

    // File type validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(resumeFile.type)) {
      return {
        title: 'Invalid File Type',
        message: 'Please upload a valid resume file. We only accept PDF, DOC, and DOCX formats.',
        action: 'Upload a PDF, DOC, or DOCX file',
        type: 'error'
      };
    }

    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (resumeFile.size > maxSize) {
      return {
        title: 'File Too Large',
        message: 'Your resume file is too large. Please upload a file smaller than 5MB.',
        action: 'Compress your file or use a smaller version',
        type: 'error'
      };
    }

    // Age validation
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        return {
          title: 'Age Requirement Not Met',
          message: 'You must be at least 18 years old to create an account.',
          action: 'Verify your date of birth',
          type: 'error'
        };
      }
    }

    return null;
  };

  const handleRetry = () => {
    setError(null);
    setShowSuccess(false);
  };

  const handleFileUpload = (file: File | File[]) => {
    // Handle single file or array of files
    const selectedFile = Array.isArray(file) ? file[0] : file;
    if (!selectedFile) return;
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError({
        title: 'File Too Large',
        message: 'File size must be less than 10MB',
        type: 'warning'
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError({
        title: 'Invalid File Type',
        message: 'Only PDF, DOC, and DOCX files are supported',
        type: 'warning'
      });
      return;
    }

    setResumeFile(selectedFile);
    setError(null); // Clear any previous errors
  };



  const handleCategoriesChange = (categories: string[]) => {
    setValue('preferredJobCategories', categories);
  };

  return (
    <>
      {/* Registration Information Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Create Your Candidate Profile
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed mb-3">
              Join our talent network and get access to exclusive job opportunities.
              Complete your profile to help employers find you and match you with the perfect role.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓ Free to join</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓ Secure & private</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">✓ Instant access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Error Display */}
      <RegistrationErrorDisplay
        error={error}
        onClose={() => setError(null)}
        onRetry={error?.type === 'error' ? handleRetry : undefined}
        showSignInLink={true}
      />

      {/* Success Display */}
      <RegistrationSuccessDisplay
        show={showSuccess}
        title={SUCCESS_MESSAGES.CANDIDATE.title}
        message={SUCCESS_MESSAGES.CANDIDATE.message}
        action="Continue to Dashboard"
        onContinue={() => {
          console.log('User clicked continue, triggering navigation...');
          onSuccess();
        }}
        autoRedirect={false} // Let the parent handle the redirect timing
        redirectDelay={3000}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Personal Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register('firstName')}
            error={!!errors.firstName}
            required
          />
          <Input
            label="Last Name"
            {...register('lastName')}
            error={!!errors.lastName}
            required
          />
          <Input
            label="Email Address"
            type="email"
            {...register('email')}
            error={!!errors.email}
            required
          />
          <Input
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            placeholder="+1-555-0123"
            required
          />
          <Input
            label="Date of Birth"
            type="date"
            {...register('dateOfBirth')}
            error={!!errors.dateOfBirth}
            required
          />
          <Input
            label="Current Location"
            {...register('currentLocation')}
            error={!!errors.currentLocation}
            placeholder="City, Country"
            required
          />
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Account Security
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
          </svg>
          Professional Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Controller
            name="educationLevel"
            control={control}
            render={({ field }) => (
              <Select
                label="Education Level"
                options={educationLevels}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.educationLevel?.message}
                helperText={errors.educationLevel?.message}
                required
              />
            )}
          />
          <Controller
            name="yearsOfExperience"
            control={control}
            render={({ field }) => (
              <Select
                label="Years of Experience"
                options={experienceLevels}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.yearsOfExperience?.message}
                helperText={errors.yearsOfExperience?.message}
                required
              />
            )}
          />
          <Controller
            name="expectedSalaryRange"
            control={control}
            render={({ field }) => (
              <Select
                label="Expected Salary Range"
                options={salaryRanges}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.expectedSalaryRange?.message}
                helperText={errors.expectedSalaryRange?.message}
                required
              />
            )}
          />
          <Controller
            name="availabilityToStart"
            control={control}
            render={({ field }) => (
              <Select
                label="Availability to Start"
                options={availabilityOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.availabilityToStart?.message}
                helperText={errors.availabilityToStart?.message}
                required
              />
            )}
          />
        </div>
        
        <div className="mt-4">
          <MultiSelect
            label="Preferred Job Categories"
            options={jobCategories}
            value={watch('preferredJobCategories')}
            onChange={handleCategoriesChange}
            error={errors.preferredJobCategories?.message}
            required
          />
        </div>
      </div>

      {/* Documents and Links */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documents & Links
        </h3>
        <div className="space-y-4">
          <FileUpload
            label="Resume Upload"
            accept=".pdf,.doc,.docx"
            onFileSelect={handleFileUpload}
            required
          />


          <TextArea
            label="Cover Letter (Optional)"
            {...register('coverLetter')}
            error={errors.coverLetter?.message}
            rows={4}
            placeholder="Tell us why you're interested in joining Vermeg..."
          />
          <Input
            label="LinkedIn Profile URL (Optional)"
            {...register('linkedinUrl')}
            error={!!errors.linkedinUrl}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          <Input
            label="Portfolio/GitHub URL (Optional)"
            {...register('portfolioUrl')}
            error={!!errors.portfolioUrl}
            placeholder="https://github.com/yourusername or your portfolio URL"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || isRegistering}
          loading={isSubmitting || isRegistering}
          className="px-8 py-3 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
          sx={{
            backgroundColor: '#ef4444 !important',
            '&:hover': {
              backgroundColor: '#dc2626 !important',
            },
            '&:active': {
              backgroundColor: '#b91c1c !important',
            }
          }}
        >
          {(isSubmitting || isRegistering) ? 'Creating Account...' : 'Create Candidate Account'}
        </Button>
      </div>
    </form>
    </>
  );
};
