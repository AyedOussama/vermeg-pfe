import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { MultiSelect } from '@/components/common/MultiSelect';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/hooks/useAuth';
import { ProjectLeaderRegistrationData } from '@/types/auth';
import { parseRegistrationError, SUCCESS_MESSAGES, type ErrorDetails } from '@/utils/errorMessages';

const projectLeaderSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string()
    .email('Please enter a valid professional email address')
    .refine((email) => email.includes('@vermeg.com'), {
      message: 'Only Vermeg employees can register as Project Leaders. Please use your @vermeg.com email address.'
    }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  employeeId: z.string()
    .min(3, 'Employee ID is required')
    .refine((id) => id.startsWith('PL'), {
      message: 'Project Leader Employee ID must start with "PL" (e.g., PL001, PL123)'
    }),
  department: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  yearsInManagement: z.number().min(1, 'Years in management must be at least 1'),
  teamSizeResponsibility: z.number().min(1, 'Team size must be at least 1'),
  technicalExpertiseAreas: z.array(z.string()).min(1, 'Please select at least one technical expertise area'),
  companyDivision: z.string().min(1, 'Company division is required'),
  officeLocation: z.string().min(1, 'Office location is required'),
  managerApprovalCode: z.string()
    .min(6, 'Manager approval code is required')
    .refine((code) => code.startsWith('MGR'), {
      message: 'Manager approval code must start with "MGR" (e.g., MGR2024001)'
    }),
  professionalCertifications: z.array(z.string()),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProjectLeaderFormData = z.infer<typeof projectLeaderSchema>;

interface ProjectLeaderRegistrationFormProps {
  onSuccess: (user?: any) => void;
  onLoading: (loading: boolean) => void;
}

const departments = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product Management' },
  { value: 'data_analytics', label: 'Data Analytics' },
  { value: 'devops', label: 'DevOps & Infrastructure' },
  { value: 'qa', label: 'Quality Assurance' },
  { value: 'security', label: 'Security' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'mobile', label: 'Mobile Development' },
  { value: 'frontend', label: 'Frontend Development' },
  { value: 'backend', label: 'Backend Development' }
];

const technicalExpertise = [
  { value: 'java', label: 'Java' },
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'dotnet', label: '.NET' },
  { value: 'microservices', label: 'Microservices' },
  { value: 'cloud_architecture', label: 'Cloud Architecture' },
  { value: 'devops', label: 'DevOps' },
  { value: 'machine_learning', label: 'Machine Learning' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'mobile_development', label: 'Mobile Development' },
  { value: 'database_design', label: 'Database Design' },
  { value: 'security', label: 'Security' },
  { value: 'agile_scrum', label: 'Agile/Scrum' }
];

const companyDivisions = [
  { value: 'product_development', label: 'Product Development' },
  { value: 'platform_engineering', label: 'Platform Engineering' },
  { value: 'data_analytics', label: 'Data Analytics' },
  { value: 'fintech_solutions', label: 'FinTech Solutions' },
  { value: 'enterprise_solutions', label: 'Enterprise Solutions' },
  { value: 'mobile_solutions', label: 'Mobile Solutions' },
  { value: 'cloud_services', label: 'Cloud Services' },
  { value: 'ai_ml', label: 'AI & Machine Learning' }
];

const officeLocations = [
  { value: 'paris_france', label: 'Paris, France' },
  { value: 'luxembourg', label: 'Luxembourg' },
  { value: 'tunis_tunisia', label: 'Tunis, Tunisia' },
  { value: 'london_uk', label: 'London, UK' },
  { value: 'dubai_uae', label: 'Dubai, UAE' },
  { value: 'remote', label: 'Remote' }
];

const certificationOptions = [
  { value: 'aws_solutions_architect', label: 'AWS Solutions Architect' },
  { value: 'azure_architect', label: 'Azure Solutions Architect' },
  { value: 'google_cloud_architect', label: 'Google Cloud Architect' },
  { value: 'scrum_master', label: 'Certified Scrum Master' },
  { value: 'pmp', label: 'Project Management Professional (PMP)' },
  { value: 'safe_agilist', label: 'SAFe Agilist' },
  { value: 'itil', label: 'ITIL Foundation' },
  { value: 'cissp', label: 'CISSP' },
  { value: 'togaf', label: 'TOGAF' },
  { value: 'prince2', label: 'PRINCE2' }
];

export const ProjectLeaderRegistrationForm: React.FC<ProjectLeaderRegistrationFormProps> = ({
  onSuccess,
  onLoading
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { registerAsProjectLeader } = useMockAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control
  } = useForm<ProjectLeaderFormData>({
    resolver: zodResolver(projectLeaderSchema),
    defaultValues: {
      technicalExpertiseAreas: [],
      professionalCertifications: [],
      department: '',
      companyDivision: '',
      officeLocation: ''
    }
  });

  const onSubmit = async (data: ProjectLeaderFormData) => {
    try {
      setError(null);
      setShowSuccess(false);
      onLoading(true);

      const result = await registerAsProjectLeader(data);
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

  const handleTechnicalExpertiseChange = (areas: string[]) => {
    setValue('technicalExpertiseAreas', areas);
  };

  const handleCertificationsChange = (certifications: string[]) => {
    setValue('professionalCertifications', certifications);
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
              <div className="mt-3 pt-3 border-t border-green-200">
                <Link to="/auth/signin">
                  <Button
                    variant="outlined"
                    size="small"
                    className="border-green-300 text-green-700 hover:bg-green-50 flex items-center gap-2"
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
          title={SUCCESS_MESSAGES.PROJECT_LEADER.title}
          message={SUCCESS_MESSAGES.PROJECT_LEADER.message}
          action={SUCCESS_MESSAGES.PROJECT_LEADER.action}
        />
      )}
      {/* Personal Information */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 text-green-600 mr-2" />
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
          <div>
            <Input
              label="Professional Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              placeholder="firstname.lastname@vermeg.com"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              ⚠️ Only Vermeg employees can register as Project Leaders. Use your @vermeg.com email address.
            </p>
          </div>
          <Input
            label="Phone Number"
            {...register('phone')}
            error={!!errors.phone}
            placeholder="+33-1-23-45-67-89"
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
              error={errors.confirmPassword?.message}
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
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Employee ID"
              {...register('employeeId')}
              error={errors.employeeId?.message}
              placeholder="PL001"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              💼 Project Leader ID must start with "PL" (e.g., PL001, PL123)
            </p>
          </div>
          <Input
            label="Job Title"
            {...register('jobTitle')}
            error={!!errors.jobTitle}
            placeholder="Senior Engineering Manager"
            required
          />
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                label="Department"
                options={departments}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.department?.message}
                required
              />
            )}
          />
          <Controller
            name="companyDivision"
            control={control}
            render={({ field }) => (
              <Select
                label="Company Division"
                options={companyDivisions}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.companyDivision?.message}
                required
              />
            )}
          />
          <Input
            label="Years in Management"
            type="number"
            min="1"
            {...register('yearsInManagement', { valueAsNumber: true })}
            error={errors.yearsInManagement?.message}
            required
          />
          <Input
            label="Team Size Responsibility"
            type="number"
            min="1"
            {...register('teamSizeResponsibility', { valueAsNumber: true })}
            error={errors.teamSizeResponsibility?.message}
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
                name={field.name}
                error={errors.officeLocation?.message}
                required
              />
            )}
          />
          <div>
            <Input
              label="Manager Approval Code"
              {...register('managerApprovalCode')}
              error={errors.managerApprovalCode?.message}
              placeholder="MGR2024001"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              🔑 Approval code must start with "MGR" (provided by your manager)
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <MultiSelect
            label="Technical Expertise Areas"
            options={technicalExpertise}
            value={watch('technicalExpertiseAreas')}
            onChange={handleTechnicalExpertiseChange}
            error={errors.technicalExpertiseAreas?.message}
            required
          />
          <MultiSelect
            label="Professional Certifications (Optional)"
            options={certificationOptions}
            value={watch('professionalCertifications')}
            onChange={handleCertificationsChange}
            error={errors.professionalCertifications?.message}
          />
          <Input
            label="LinkedIn Profile URL (Optional)"
            {...register('linkedinUrl')}
            error={errors.linkedinUrl?.message}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="px-8 py-3 bg-green-600 hover:bg-green-700"
        >
          Create Project Leader Account
        </Button>
      </div>
    </form>
  );
};
