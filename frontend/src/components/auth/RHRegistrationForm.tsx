import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/hooks/useAuth';
import { RHRegistrationData } from '@/types/auth';
import { parseRegistrationError, SUCCESS_MESSAGES, type ErrorDetails } from '@/utils/errorMessages';

const rhSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid professional email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  employeeId: z.string().min(3, 'Employee ID is required'),
  hrDepartmentDivision: z.string().min(1, 'HR department division is required'),
  yearsInHRExperience: z.number().min(1, 'Years in HR experience must be at least 1'),
  hrCertifications: z.array(z.string()).min(1, 'Please select at least one HR certification'),
  specializationAreas: z.array(z.string()).min(1, 'Please select at least one specialization area'),
  officeLocation: z.string().min(1, 'Office location is required'),
  managerApprovalCode: z.string().min(6, 'Manager approval code is required'),
  professionalLicenseNumber: z.string().min(6, 'Professional license number is required'),
  educationalBackground: z.string().min(1, 'Educational background is required'),
  languagesSpoken: z.array(z.string()).min(1, 'Please select at least one language'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RHFormData = z.infer<typeof rhSchema>;

interface RHRegistrationFormProps {
  onSuccess: (user?: any) => void;
  onLoading: (loading: boolean) => void;
}

const hrDivisions = [
  { value: 'talent_acquisition', label: 'Talent Acquisition' },
  { value: 'employee_development', label: 'Employee Development' },
  { value: 'compensation_benefits', label: 'Compensation & Benefits' },
  { value: 'performance_management', label: 'Performance Management' },
  { value: 'employee_relations', label: 'Employee Relations' },
  { value: 'hr_operations', label: 'HR Operations' },
  { value: 'learning_development', label: 'Learning & Development' },
  { value: 'diversity_inclusion', label: 'Diversity & Inclusion' }
];

const hrCertifications = [
  { value: 'shrm_cp', label: 'SHRM-CP (Certified Professional)' },
  { value: 'shrm_scp', label: 'SHRM-SCP (Senior Certified Professional)' },
  { value: 'phr', label: 'PHR (Professional in Human Resources)' },
  { value: 'sphr', label: 'SPHR (Senior Professional in Human Resources)' },
  { value: 'cipd', label: 'CIPD (Chartered Institute of Personnel and Development)' },
  { value: 'hrci_gphr', label: 'HRCI GPHR (Global Professional in Human Resources)' },
  { value: 'coaching_certification', label: 'Professional Coaching Certification' },
  { value: 'change_management', label: 'Change Management Certification' },
  { value: 'talent_management', label: 'Talent Management Certification' },
  { value: 'compensation_analyst', label: 'Certified Compensation Professional' }
];

const specializationAreas = [
  { value: 'technical_recruitment', label: 'Technical Recruitment' },
  { value: 'behavioral_assessment', label: 'Behavioral Assessment' },
  { value: 'executive_search', label: 'Executive Search' },
  { value: 'campus_recruitment', label: 'Campus Recruitment' },
  { value: 'diversity_hiring', label: 'Diversity Hiring' },
  { value: 'international_recruitment', label: 'International Recruitment' },
  { value: 'training_development', label: 'Training & Development' },
  { value: 'performance_coaching', label: 'Performance Coaching' },
  { value: 'employee_engagement', label: 'Employee Engagement' },
  { value: 'succession_planning', label: 'Succession Planning' },
  { value: 'organizational_development', label: 'Organizational Development' },
  { value: 'culture_transformation', label: 'Culture Transformation' }
];

const officeLocations = [
  { value: 'paris_france', label: 'Paris, France' },
  { value: 'luxembourg', label: 'Luxembourg' },
  { value: 'tunis_tunisia', label: 'Tunis, Tunisia' },
  { value: 'london_uk', label: 'London, UK' },
  { value: 'dubai_uae', label: 'Dubai, UAE' },
  { value: 'remote', label: 'Remote' }
];

const educationOptions = [
  { value: 'bachelor_hr', label: "Bachelor's in Human Resources" },
  { value: 'master_hr', label: "Master's in Human Resources" },
  { value: 'bachelor_psychology', label: "Bachelor's in Psychology" },
  { value: 'master_psychology', label: "Master's in Psychology" },
  { value: 'bachelor_business', label: "Bachelor's in Business Administration" },
  { value: 'master_business', label: "Master's in Business Administration (MBA)" },
  { value: 'bachelor_organizational_psychology', label: "Bachelor's in Organizational Psychology" },
  { value: 'master_organizational_psychology', label: "Master's in Organizational Psychology" },
  { value: 'other', label: 'Other Relevant Degree' }
];

const languages = [
  { value: 'english', label: 'English' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'italian', label: 'Italian' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'dutch', label: 'Dutch' },
  { value: 'portuguese', label: 'Portuguese' },
  { value: 'mandarin', label: 'Mandarin Chinese' },
  { value: 'japanese', label: 'Japanese' }
];

export const RHRegistrationForm: React.FC<RHRegistrationFormProps> = ({
  onSuccess,
  onLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { registerRH } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control
  } = useForm<RHFormData>({
    resolver: zodResolver(rhSchema),
    defaultValues: {
      hrDepartmentDivision: '',
      officeLocation: '',
      educationalBackground: '',
      hrCertifications: [],
      specializationAreas: [],
      languagesSpoken: []
    }
  });

  const onSubmit = async (data: RHFormData) => {
    try {
      setError(null);
      setShowSuccess(false);
      onLoading(true);

      const result = await registerRH(data);
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess(result);
      }, 2000);
    } catch (error) {
      // Parse error and display user-friendly message
      const errorDetails = parseRegistrationError(error, 'employee');
      setError(errorDetails);

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      onLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setShowSuccess(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert - Prominent positioning */}
      {error && (
        <div className="sticky top-4 z-50 mb-6">
          <Alert
            type={error.type}
            title={error.title}
            message={error.message}
            action={error.action}
            onClose={() => setError(null)}
            onRetry={error.type === 'error' ? handleRetry : undefined}
            className="shadow-lg border-2"
          >
            {error.title === 'Email Already Registered' && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <Link to="/auth/signin">
                  <Button
                    variant="outlined"
                    size="small"
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            )}
          </Alert>
        </div>
      )}

      {/* Success Alert */}
      {showSuccess && (
        <Alert
          type="success"
          title={SUCCESS_MESSAGES.RH.title}
          message={SUCCESS_MESSAGES.RH.message}
          action={SUCCESS_MESSAGES.RH.action}
        />
      )}
      {/* Personal Information */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Heart className="w-5 h-5 text-orange-600 mr-2" />
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
            label="Professional Email"
            type="email"
            {...register('email')}
            error={!!errors.email}
            placeholder="name@vermeg.com"
            required
          />
          <Input
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            placeholder="+352-26-12-34-56"
            required
          />
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
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
      <div className="bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">HR Professional Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Employee ID"
            {...register('employeeId')}
            error={!!errors.employeeId}
            placeholder="HR001"
            required
          />
          <Controller
            name="hrDepartmentDivision"
            control={control}
            render={({ field }) => (
              <Select
                label="HR Department Division"
                options={hrDivisions}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                error={errors.hrDepartmentDivision?.message}
                required
              />
            )}
          />
          <Input
            label="Years in HR Experience"
            type="number"
            min="1"
            {...register('yearsInHRExperience', { valueAsNumber: true })}
            error={!!errors.yearsInHRExperience}
            required
          />
          <Controller
            name="officeLocation"
            control={control}
            render={({ field }) => (
              <Select
                label="Office Location"
                options={officeLocations}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                error={errors.officeLocation?.message}
                required
              />
            )}
          />
          <Input
            label="Manager Approval Code"
            {...register('managerApprovalCode')}
            error={!!errors.managerApprovalCode}
            placeholder="HR2024001"
            required
          />
          <Input
            label="Professional License Number"
            {...register('professionalLicenseNumber')}
            error={!!errors.professionalLicenseNumber}
            placeholder="HR-LUX-2024-001"
            required
          />
        </div>

        <div className="mt-4">
          <Controller
            name="educationalBackground"
            control={control}
            render={({ field }) => (
              <Select
                label="Educational Background in HR"
                options={educationOptions}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                error={errors.educationalBackground?.message}
                required
              />
            )}
          />
        </div>

        <div className="mt-4 space-y-4">
          <Controller
            name="hrCertifications"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="HR Certifications"
                options={hrCertifications}
                value={field.value}
                onChange={field.onChange}
                error={errors.hrCertifications?.message}
                required
              />
            )}
          />

          <Controller
            name="specializationAreas"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Specialization Areas"
                options={specializationAreas}
                value={field.value}
                onChange={field.onChange}
                error={errors.specializationAreas?.message}
                required
              />
            )}
          />

          <Controller
            name="languagesSpoken"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Languages Spoken"
                options={languages}
                value={field.value}
                onChange={field.onChange}
                error={errors.languagesSpoken?.message}
                required
              />
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-700"
        >
          Create HR Manager Account
        </Button>
      </div>
    </form>
  );
};
