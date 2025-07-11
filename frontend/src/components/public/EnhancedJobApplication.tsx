// Enhanced Job Application Component

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  Briefcase,
  Send,
  CheckCircle,
  AlertCircle,
  Star,
  Users
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Job, ApplicationSubmissionData } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

// Validation Schema
const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  currentLocation: z.string().min(2, 'Location is required'),
  
  // Professional Information
  currentPosition: z.string().optional(),
  experience: z.number().min(0, 'Experience cannot be negative'),
  education: z.string().min(2, 'Education is required'),
  expectedSalary: z.string().optional(),
  availabilityToStart: z.string().optional(),
  workPreference: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  summary: z.string().optional(),
  
  // Application Content
  coverLetter: z.string().optional(),
  additionalComments: z.string().optional(),
  
  // URLs
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Please enter a valid portfolio URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Please enter a valid GitHub URL').optional().or(z.literal('')),
  personalWebsite: z.string().url('Please enter a valid website URL').optional().or(z.literal(''))
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface EnhancedJobApplicationProps {
  className?: string;
  jobId?: string;
}

const EnhancedJobApplication: React.FC<EnhancedJobApplicationProps> = ({ 
  className = '', 
  jobId: propJobId 
}) => {
  const { jobId: paramJobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const jobId = propJobId || paramJobId;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'personal' | 'professional' | 'documents' | 'review'>('personal');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'transcript' | 'other';
    file: File;
    name: string;
  }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      experience: 0,
      workPreference: 'onsite'
    },
    mode: 'onChange'
  });

  // Load job data
  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const jobData = await mockWorkflowService.getJobDetails(jobId);
      setJob(jobData);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload PDF or Word documents only');
      return;
    }

    // Remove existing file of same type
    setUploadedFiles(prev => prev.filter(f => f.type !== type));
    
    // Add new file
    setUploadedFiles(prev => [...prev, {
      type: type as any,
      file,
      name: file.name
    }]);

    toast.success(`${type.replace('_', ' ')} uploaded successfully`);
  };

  // Remove uploaded file
  const removeFile = (type: string) => {
    setUploadedFiles(prev => prev.filter(f => f.type !== type));
  };

  // Step validation
  const isStepValid = (step: string): boolean => {
    const values = getValues();
    switch (step) {
      case 'personal':
        return !!(values.firstName && values.lastName && values.email && values.phone && values.currentLocation);
      case 'professional':
        return !!(values.education && values.experience !== undefined);
      case 'documents':
        return uploadedFiles.some(f => f.type === 'resume'); // Resume is required
      default:
        return true;
    }
  };

  // Submit application
  const handleApplicationSubmit = async (data: ApplicationFormData) => {
    if (!job) return;

    // Validate required documents
    if (!uploadedFiles.some(f => f.type === 'resume')) {
      toast.error('Resume is required');
      return;
    }

    setSubmitting(true);
    try {
      const applicationData: ApplicationSubmissionData = {
        jobId: job.id,
        candidateId: 'current-candidate-id', // In real app, get from auth
        personalInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          currentLocation: data.currentLocation
        },
        professionalInfo: {
          currentPosition: data.currentPosition,
          experience: data.experience,
          education: data.education,
          expectedSalary: data.expectedSalary,
          availabilityToStart: data.availabilityToStart,
          workPreference: data.workPreference,
          summary: data.summary
        },
        coverLetter: data.coverLetter,
        additionalComments: data.additionalComments,
        documents: uploadedFiles,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        githubUrl: data.githubUrl,
        personalWebsite: data.personalWebsite
      };

      const application = await mockWorkflowService.submitApplication(applicationData);
      
      toast.success('Application submitted successfully!');
      
      // Navigate to application confirmation or assessment
      navigate(`/application-submitted/${application.id}`);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Navigation between steps
  const goToNextStep = () => {
    const steps = ['personal', 'professional', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  const goToPreviousStep = () => {
    const steps = ['personal', 'professional', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or is no longer available.</p>
        <Button onClick={() => navigate('/jobs')}>
          Browse All Jobs
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Position</h1>
          <p className="text-gray-600">Complete your application for this exciting opportunity</p>
        </div>
      </div>

      {/* Job Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {job.employmentType.replace('_', ' ')} • {job.level}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            {job.displaySalary && (
              <p className="text-lg font-semibold text-green-600 mb-1">
                {job.salaryRangeMin.toLocaleString()} - {job.salaryRangeMax.toLocaleString()} {job.currency}
              </p>
            )}
            <div className="flex items-center gap-2">
              {job.featured && (
                <Badge variant="warning" size="sm">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {job.urgent && (
                <Badge variant="destructive" size="sm">
                  Urgent
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{job.description}</p>

        {/* Assessment Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Application Process</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            {job.technicalQuiz && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>Technical Assessment ({job.technicalQuiz.questions.length} questions, {job.technicalQuiz.timeLimit} minutes)</span>
              </div>
            )}
            {job.hrQuiz && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>HR Assessment ({job.hrQuiz.questions.length} questions, {job.hrQuiz.timeLimit} minutes)</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[
          { id: 'personal', label: 'Personal Info', icon: User },
          { id: 'professional', label: 'Professional', icon: Briefcase },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'review', label: 'Review', icon: CheckCircle }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = isStepValid(step.id);
          const isAccessible = index === 0 || isStepValid(['personal', 'professional', 'documents'][index - 1]);
          
          return (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isCompleted
                      ? 'bg-blue-100 border-blue-600 text-blue-600'
                      : isAccessible
                        ? 'border-gray-300 text-gray-400 hover:border-gray-400'
                        : 'border-gray-200 text-gray-300'
                }`}
                onClick={() => isAccessible && setCurrentStep(step.id as any)}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < 3 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(handleApplicationSubmit)} className="space-y-6">
        {/* Personal Information Step */}
        {currentStep === 'personal' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  {...register('firstName')}
                  placeholder="Enter your first name"
                  error={errors.firstName?.message}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  {...register('lastName')}
                  placeholder="Enter your last name"
                  error={errors.lastName?.message}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register('email')}
                  placeholder="your.email@example.com"
                  error={errors.email?.message}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('phone')}
                  placeholder="+216 12 345 678"
                  error={errors.phone?.message}
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location *
                </label>
                <Input
                  {...register('currentLocation')}
                  placeholder="City, Country"
                  error={errors.currentLocation?.message}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Professional Information Step */}
        {currentStep === 'professional' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Position
                </label>
                <Input
                  {...register('currentPosition')}
                  placeholder="e.g., Senior Software Developer at TechCorp"
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <Input
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                    error={errors.experience?.message}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Preference
                  </label>
                  <select
                    {...register('workPreference')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education *
                </label>
                <Input
                  {...register('education')}
                  placeholder="e.g., Bachelor's in Computer Science"
                  error={errors.education?.message}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Salary
                  </label>
                  <Input
                    {...register('expectedSalary')}
                    placeholder="e.g., 60,000 TND"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability to Start
                  </label>
                  <Input
                    {...register('availabilityToStart')}
                    placeholder="e.g., 2 weeks notice"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  {...register('summary')}
                  placeholder="Brief summary of your professional background and key achievements..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  {...register('coverLetter')}
                  placeholder="Why are you interested in this position? What makes you a great fit?"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <Input
                    type="url"
                    {...register('linkedinUrl')}
                    placeholder="https://linkedin.com/in/yourprofile"
                    error={errors.linkedinUrl?.message}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio URL
                  </label>
                  <Input
                    type="url"
                    {...register('portfolioUrl')}
                    placeholder="https://yourportfolio.com"
                    error={errors.portfolioUrl?.message}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Profile
                  </label>
                  <Input
                    type="url"
                    {...register('githubUrl')}
                    placeholder="https://github.com/yourusername"
                    error={errors.githubUrl?.message}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Website
                  </label>
                  <Input
                    type="url"
                    {...register('personalWebsite')}
                    placeholder="https://yourwebsite.com"
                    error={errors.personalWebsite?.message}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Documents Step */}
        {currentStep === 'documents' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>

            <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume/CV * (Required)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFiles.find(f => f.type === 'resume') ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900">
                          {uploadedFiles.find(f => f.type === 'resume')?.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeFile('resume')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your resume or CV (PDF, DOC, DOCX)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'resume')}
                        className="hidden"
                        id="resume-upload"
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFiles.find(f => f.type === 'cover_letter') ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900">
                          {uploadedFiles.find(f => f.type === 'cover_letter')?.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeFile('cover_letter')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your cover letter (PDF, DOC, DOCX)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'cover_letter')}
                        className="hidden"
                        id="cover-letter-upload"
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => document.getElementById('cover-letter-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio/Work Samples (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFiles.find(f => f.type === 'portfolio') ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-900">
                          {uploadedFiles.find(f => f.type === 'portfolio')?.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeFile('portfolio')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload your portfolio or work samples (PDF)
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(e, 'portfolio')}
                        className="hidden"
                        id="portfolio-upload"
                      />
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => document.getElementById('portfolio-upload')?.click()}
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  {...register('additionalComments')}
                  placeholder="Any additional information you'd like to share..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* File Upload Guidelines */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">File Upload Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Maximum file size: 10MB per file</li>
                  <li>• Accepted formats: PDF, DOC, DOCX</li>
                  <li>• Resume/CV is required for application submission</li>
                  <li>• Ensure all documents are clearly named and up-to-date</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Application</h3>

            <div className="space-y-6">
              {/* Personal Information Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <p className="text-gray-600">{watch('firstName')} {watch('lastName')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600">{watch('email')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-600">{watch('phone')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-600">{watch('currentLocation')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Current Position:</span>
                      <p className="text-gray-600">{watch('currentPosition') || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p className="text-gray-600">{watch('experience')} years</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Education:</span>
                      <p className="text-gray-600">{watch('education')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Work Preference:</span>
                      <p className="text-gray-600 capitalize">{watch('workPreference')}</p>
                    </div>
                    {watch('expectedSalary') && (
                      <div>
                        <span className="font-medium text-gray-700">Expected Salary:</span>
                        <p className="text-gray-600">{watch('expectedSalary')}</p>
                      </div>
                    )}
                    {watch('availabilityToStart') && (
                      <div>
                        <span className="font-medium text-gray-700">Availability:</span>
                        <p className="text-gray-600">{watch('availabilityToStart')}</p>
                      </div>
                    )}
                  </div>

                  {watch('summary') && (
                    <div className="mt-4">
                      <span className="font-medium text-gray-700">Professional Summary:</span>
                      <p className="text-gray-600 mt-1">{watch('summary')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Review */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Uploaded Documents</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                          <Badge variant="outline" size="sm">
                            {file.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No documents uploaded</p>
                  )}
                </div>
              </div>

              {/* URLs Review */}
              {(watch('linkedinUrl') || watch('portfolioUrl') || watch('githubUrl') || watch('personalWebsite')) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Online Profiles</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      {watch('linkedinUrl') && (
                        <div>
                          <span className="font-medium text-gray-700">LinkedIn:</span>
                          <p className="text-blue-600">{watch('linkedinUrl')}</p>
                        </div>
                      )}
                      {watch('portfolioUrl') && (
                        <div>
                          <span className="font-medium text-gray-700">Portfolio:</span>
                          <p className="text-blue-600">{watch('portfolioUrl')}</p>
                        </div>
                      )}
                      {watch('githubUrl') && (
                        <div>
                          <span className="font-medium text-gray-700">GitHub:</span>
                          <p className="text-blue-600">{watch('githubUrl')}</p>
                        </div>
                      )}
                      {watch('personalWebsite') && (
                        <div>
                          <span className="font-medium text-gray-700">Website:</span>
                          <p className="text-blue-600">{watch('personalWebsite')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Letter and Comments Review */}
              {(watch('coverLetter') || watch('additionalComments')) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    {watch('coverLetter') && (
                      <div>
                        <span className="font-medium text-gray-700">Cover Letter:</span>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{watch('coverLetter')}</p>
                      </div>
                    )}
                    {watch('additionalComments') && (
                      <div>
                        <span className="font-medium text-gray-700">Additional Comments:</span>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap">{watch('additionalComments')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Next Steps Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Your application will be submitted and reviewed</li>
                  {job?.technicalQuiz && (
                    <li>You'll be invited to take the technical assessment ({job.technicalQuiz.timeLimit} minutes)</li>
                  )}
                  {job?.hrQuiz && (
                    <li>You'll complete the HR behavioral assessment ({job.hrQuiz.timeLimit} minutes)</li>
                  )}
                  <li>The hiring team will review your complete application</li>
                  <li>You'll be contacted with the next steps within 5-7 business days</li>
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outlined"
            onClick={goToPreviousStep}
            disabled={currentStep === 'personal'}
          >
            Previous
          </Button>

          {currentStep === 'review' ? (
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !isValid}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="contained"
              onClick={goToNextStep}
              disabled={!isStepValid(currentStep)}
              className="bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EnhancedJobApplication;
