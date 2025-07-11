// Enhanced Job Creation Component for Complete Workflow

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { JobCreationData, TechnicalQuiz, TechnicalQuestion } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

// Validation Schema
const jobCreationSchema = z.object({
  // Basic Information
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  department: z.string().min(1, 'Department is required'),
  division: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  workType: z.enum(['remote', 'onsite', 'hybrid']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  level: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL']),
  
  // Compensation
  salaryRangeMin: z.number().min(1, 'Minimum salary is required'),
  salaryRangeMax: z.number().min(1, 'Maximum salary is required'),
  currency: z.enum(['TND', 'USD', 'EUR']),
  displaySalary: z.boolean(),
  
  // Experience
  minExperience: z.number().min(0, 'Minimum experience cannot be negative'),
  maxExperience: z.number().optional(),
  
  // Content
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  responsibilities: z.array(z.string().min(1, 'Responsibility cannot be empty')).min(1, 'At least one responsibility is required'),
  qualifications: z.array(z.string().min(1, 'Qualification cannot be empty')).min(1, 'At least one qualification is required'),
  benefits: z.array(z.string().min(1, 'Benefit cannot be empty')).min(1, 'At least one benefit is required'),
  
  // Skills and Education
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    isRequired: z.boolean(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
    description: z.string().optional(),
    yearsRequired: z.number().optional()
  })).min(1, 'At least one skill is required'),
  requiredEducation: z.array(z.string().min(1, 'Education requirement cannot be empty')).min(1, 'At least one education requirement is required'),
  preferredEducation: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  
  // Job Settings
  numberOfPositions: z.number().min(1, 'Number of positions must be at least 1'),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  urgent: z.boolean(),
  featured: z.boolean()
});

type JobFormData = z.infer<typeof jobCreationSchema>;

interface EnhancedCreateJobProps {
  className?: string;
  jobId?: string; // For editing existing jobs
  onJobCreated?: (job: any) => void;
  onJobSaved?: (job: any) => void;
}

const EnhancedCreateJob: React.FC<EnhancedCreateJobProps> = ({ 
  className = '', 
  jobId, 
  onJobCreated, 
  onJobSaved 
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'basic' | 'details' | 'skills' | 'technical' | 'preview'>('basic');
  const [technicalQuiz, setTechnicalQuiz] = useState<TechnicalQuiz>({
    id: '',
    title: '',
    description: '',
    questions: [],
    totalPoints: 0,
    timeLimit: 60,
    passingScore: 70,
    instructions: 'Please read each question carefully and provide your best answer.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues
  } = useForm<JobFormData>({
    resolver: zodResolver(jobCreationSchema),
    defaultValues: {
      workType: 'onsite',
      employmentType: 'FULL_TIME',
      level: 'MID',
      currency: 'TND',
      displaySalary: true,
      minExperience: 0,
      urgent: false,
      featured: false,
      numberOfPositions: 1,
      responsibilities: [''],
      qualifications: [''],
      benefits: [''],
      skills: [{ name: '', isRequired: true, level: 'INTERMEDIATE', description: '' }],
      requiredEducation: [''],
      preferredEducation: [],
      certifications: [],
      languages: []
    },
    mode: 'onChange'
  });

  const { fields: responsibilityFields, append: appendResponsibility, remove: removeResponsibility } = useFieldArray({
    control,
    name: 'responsibilities'
  });

  const { fields: qualificationFields, append: appendQualification, remove: removeQualification } = useFieldArray({
    control,
    name: 'qualifications'
  });

  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
    control,
    name: 'benefits'
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'requiredEducation'
  });

  // Watch form values for validation
  const watchedValues = watch();

  // Step validation
  const isStepValid = (step: string): boolean => {
    switch (step) {
      case 'basic':
        return !!(watchedValues.title && watchedValues.department && watchedValues.description);
      case 'details':
        return !!(watchedValues.salaryRangeMin && watchedValues.salaryRangeMax && 
                 watchedValues.responsibilities?.some(r => r.trim()) &&
                 watchedValues.qualifications?.some(q => q.trim()));
      case 'skills':
        return !!(watchedValues.skills?.some(s => s.name.trim()) && 
                 watchedValues.requiredEducation?.some(e => e.trim()));
      case 'technical':
        return technicalQuiz.questions.length >= 3; // Minimum 3 questions
      default:
        return true;
    }
  };

  // Add technical question
  const addTechnicalQuestion = () => {
    const newQuestion: TechnicalQuestion = {
      id: `tq-${Date.now()}`,
      question: '',
      type: 'multiple_choice',
      category: 'general',
      difficulty: 'medium',
      options: ['', '', '', ''],
      points: 10,
      timeLimit: 5
    };

    setTechnicalQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 10
    }));
  };

  // Update technical question
  const updateTechnicalQuestion = (index: number, updates: Partial<TechnicalQuestion>) => {
    setTechnicalQuiz(prev => {
      const newQuestions = [...prev.questions];
      const oldPoints = newQuestions[index].points;
      newQuestions[index] = { ...newQuestions[index], ...updates };
      
      const pointsDiff = (updates.points || oldPoints) - oldPoints;
      
      return {
        ...prev,
        questions: newQuestions,
        totalPoints: prev.totalPoints + pointsDiff
      };
    });
  };

  // Remove technical question
  const removeTechnicalQuestion = (index: number) => {
    setTechnicalQuiz(prev => {
      const questionToRemove = prev.questions[index];
      return {
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
        totalPoints: prev.totalPoints - questionToRemove.points
      };
    });
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const formData = getValues();
      const draftData: Partial<JobCreationData> = {
        ...formData,
        technicalQuiz: technicalQuiz.questions.length > 0 ? technicalQuiz : undefined
      };

      const savedJob = await mockWorkflowService.saveDraftJob(draftData);
      toast.success('Job saved as draft successfully!');
      onJobSaved?.(savedJob);
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Submit for HR enhancement
  const handleSubmitForHR = async (data: JobFormData) => {
    setSubmitting(true);
    try {
      const jobData: JobCreationData = {
        ...data,
        technicalQuiz
      };

      const createdJob = await mockWorkflowService.createJob(jobData);
      toast.success('Job created and submitted for HR enhancement!');
      onJobCreated?.(createdJob);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Navigation between steps
  const goToNextStep = () => {
    const steps = ['basic', 'details', 'skills', 'technical', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  const goToPreviousStep = () => {
    const steps = ['basic', 'details', 'skills', 'technical', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any);
    }
  };

  // Department options
  const departmentOptions = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 
    'Human Resources', 'Finance', 'Legal', 'Customer Success'
  ];

  // Location options
  const locationOptions = [
    'Tunis, Tunisia', 'Sfax, Tunisia', 'Sousse, Tunisia', 'Ariana, Tunisia',
    'Remote', 'Paris, France', 'London, UK', 'Dubai, UAE'
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {jobId ? 'Edit Job' : 'Create New Job'}
          </h1>
          <p className="text-gray-600">
            Create a comprehensive job posting with technical assessment for HR enhancement
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          {currentStep === 'preview' && (
            <Button
              variant="contained"
              onClick={handleSubmit(handleSubmitForHR)}
              disabled={saving || submitting || !isValid}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit for HR Enhancement'}
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[
          { id: 'basic', label: 'Basic Info', icon: FileText },
          { id: 'details', label: 'Details', icon: DollarSign },
          { id: 'skills', label: 'Skills & Education', icon: Users },
          { id: 'technical', label: 'Technical Quiz', icon: Briefcase },
          { id: 'preview', label: 'Preview', icon: Eye }
        ].map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = isStepValid(step.id);
          const isAccessible = index === 0 || isStepValid(['basic', 'details', 'skills', 'technical'][index - 1]);
          
          return (
            <div key={step.id} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : isCompleted
                      ? 'bg-green-100 border-green-600 text-green-600'
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
              {index < 4 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(handleSubmitForHR)} className="space-y-6">
        {/* Basic Information Step */}
        {currentStep === 'basic' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <Input
                  {...register('title')}
                  placeholder="e.g., Senior Full Stack Developer"
                  error={errors.title?.message}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Division
                </label>
                <Input
                  {...register('division')}
                  placeholder="e.g., Product Development"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  {...register('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  {locationOptions.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Type *
                </label>
                <select
                  {...register('workType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type *
                </label>
                <select
                  {...register('employmentType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  {...register('level')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="JUNIOR">Junior</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior</option>
                  <option value="LEAD">Lead</option>
                  <option value="PRINCIPAL">Principal</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="md:col-span-2 flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('urgent')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Urgent hiring</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured position</span>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Details Step */}
        {currentStep === 'details' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details & Compensation</h3>

            <div className="space-y-6">
              {/* Salary Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range *</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="number"
                    {...register('salaryRangeMin', { valueAsNumber: true })}
                    placeholder="Min salary"
                    error={errors.salaryRangeMin?.message}
                  />
                  <Input
                    type="number"
                    {...register('salaryRangeMax', { valueAsNumber: true })}
                    placeholder="Max salary"
                    error={errors.salaryRangeMax?.message}
                  />
                  <select
                    {...register('currency')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="TND">TND</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    {...register('displaySalary')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Display salary publicly</span>
                </label>
              </div>

              {/* Experience Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Requirements</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      {...register('minExperience', { valueAsNumber: true })}
                      placeholder="Min years"
                      error={errors.minExperience?.message}
                    />
                    <span className="text-xs text-gray-500">Minimum years</span>
                  </div>
                  <div>
                    <Input
                      type="number"
                      {...register('maxExperience', { valueAsNumber: true })}
                      placeholder="Max years (optional)"
                    />
                    <span className="text-xs text-gray-500">Maximum years (optional)</span>
                  </div>
                </div>
              </div>

              {/* Job Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Positions *</label>
                  <Input
                    type="number"
                    {...register('numberOfPositions', { valueAsNumber: true })}
                    placeholder="1"
                    min="1"
                    error={errors.numberOfPositions?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                  <Input
                    type="date"
                    {...register('applicationDeadline')}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Responsibilities *</label>
                {responsibilityFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <Input
                      {...register(`responsibilities.${index}` as const)}
                      placeholder="Enter responsibility"
                      className="flex-1"
                      error={errors.responsibilities?.[index]?.message}
                    />
                    {responsibilityFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeResponsibility(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendResponsibility('')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Responsibility
                </Button>
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Qualifications *</label>
                {qualificationFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <Input
                      {...register(`qualifications.${index}` as const)}
                      placeholder="Enter qualification"
                      className="flex-1"
                      error={errors.qualifications?.[index]?.message}
                    />
                    {qualificationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeQualification(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendQualification('')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Qualification
                </Button>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits & Perks *</label>
                {benefitFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <Input
                      {...register(`benefits.${index}` as const)}
                      placeholder="Enter benefit"
                      className="flex-1"
                      error={errors.benefits?.[index]?.message}
                    />
                    {benefitFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeBenefit(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendBenefit('')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Benefit
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Skills & Education Step */}
        {currentStep === 'skills' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Education Requirements</h3>

            <div className="space-y-6">
              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills *</label>
                {skillFields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-4">
                      <Input
                        {...register(`skills.${index}.name` as const)}
                        placeholder="Skill name"
                        error={errors.skills?.[index]?.name?.message}
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        {...register(`skills.${index}.level` as const)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        {...register(`skills.${index}.yearsRequired` as const, { valueAsNumber: true })}
                        placeholder="Years"
                        min="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        {...register(`skills.${index}.description` as const)}
                        placeholder="Description (optional)"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`skills.${index}.isRequired` as const)}
                          className="mr-1"
                        />
                        <span className="text-xs">Req</span>
                      </label>
                      {skillFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendSkill({ name: '', isRequired: true, level: 'INTERMEDIATE', description: '' })}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </Button>
              </div>

              {/* Required Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Education *</label>
                {educationFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                    <Input
                      {...register(`requiredEducation.${index}` as const)}
                      placeholder="e.g., Bachelor's degree in Computer Science"
                      className="flex-1"
                      error={errors.requiredEducation?.[index]?.message}
                    />
                    {educationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeEducation(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => appendEducation('')}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Education Requirement
                </Button>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Certifications</label>
                  <textarea
                    {...register('certifications')}
                    placeholder="Enter certifications separated by commas"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Languages</label>
                  <textarea
                    {...register('languages')}
                    placeholder="Enter languages separated by commas (e.g., English, French, Arabic)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Technical Quiz Step */}
        {currentStep === 'technical' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Technical Assessment Quiz</h3>
                <p className="text-sm text-gray-600">Create questions to evaluate candidates' technical skills</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{technicalQuiz.questions.length}</span> questions
                  <span className="mx-2">•</span>
                  <span className="font-medium">{technicalQuiz.totalPoints}</span> points
                </div>
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  onClick={addTechnicalQuestion}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                <Input
                  value={technicalQuiz.title}
                  onChange={(e) => setTechnicalQuiz(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Technical Assessment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                <Input
                  type="number"
                  value={technicalQuiz.timeLimit}
                  onChange={(e) => setTechnicalQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                  min="15"
                  max="180"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                <Input
                  type="number"
                  value={technicalQuiz.passingScore}
                  onChange={(e) => setTechnicalQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                  min="50"
                  max="100"
                />
              </div>
            </div>

            {/* Questions */}
            {technicalQuiz.questions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h4>
                <p className="text-gray-600 mb-4">Add at least 3 technical questions to assess candidates</p>
                <Button
                  type="button"
                  variant="contained"
                  onClick={addTechnicalQuestion}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {technicalQuiz.questions.map((question, index) => (
                  <Card key={question.id} className="p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeTechnicalQuestion(index)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        value={question.question}
                        onChange={(e) => updateTechnicalQuestion(index, { question: e.target.value })}
                        placeholder="Enter your question..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateTechnicalQuestion(index, { type: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="text">Text Answer</option>
                            <option value="code">Code Challenge</option>
                            <option value="scenario">Scenario</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={question.category}
                            onChange={(e) => updateTechnicalQuestion(index, { category: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="programming">Programming</option>
                            <option value="system_design">System Design</option>
                            <option value="algorithms">Algorithms</option>
                            <option value="database">Database</option>
                            <option value="frameworks">Frameworks</option>
                            <option value="general">General</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                          <select
                            value={question.difficulty}
                            onChange={(e) => updateTechnicalQuestion(index, { difficulty: e.target.value as any })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                          <Input
                            type="number"
                            value={question.points}
                            onChange={(e) => updateTechnicalQuestion(index, { points: parseInt(e.target.value) || 10 })}
                            min="1"
                            max="50"
                          />
                        </div>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                          {question.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 mb-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[optIndex] = e.target.value;
                                  updateTechnicalQuestion(index, { options: newOptions });
                                }}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1"
                              />
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === optIndex}
                                  onChange={() => updateTechnicalQuestion(index, { correctAnswer: optIndex })}
                                  className="mr-1"
                                />
                                <span className="text-xs text-gray-600">Correct</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {question.type === 'code' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Code Template (optional)</label>
                          <textarea
                            value={question.codeTemplate || ''}
                            onChange={(e) => updateTechnicalQuestion(index, { codeTemplate: e.target.value })}
                            placeholder="function solution() {\n  // Your code here\n}"
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}

                {technicalQuiz.questions.length < 10 && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={addTechnicalQuestion}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Question
                  </Button>
                )}
              </div>
            )}

            {technicalQuiz.questions.length > 0 && technicalQuiz.questions.length < 3 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Add at least {3 - technicalQuiz.questions.length} more question(s) to proceed
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preview</h3>

            <div className="space-y-6">
              {/* Job Header */}
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{watchedValues.title}</h2>
                    <p className="text-gray-600">{watchedValues.department} • {watchedValues.location}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{watchedValues.employmentType?.replace('_', ' ')}</Badge>
                      <Badge variant="secondary">{watchedValues.level}</Badge>
                      <Badge variant="secondary">{watchedValues.workType}</Badge>
                      {watchedValues.urgent && <Badge variant="destructive">Urgent</Badge>}
                      {watchedValues.featured && <Badge variant="default">Featured</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    {watchedValues.displaySalary && (
                      <p className="text-lg font-semibold text-green-600">
                        {watchedValues.salaryRangeMin?.toLocaleString()} - {watchedValues.salaryRangeMax?.toLocaleString()} {watchedValues.currency}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">{watchedValues.numberOfPositions} position(s) available</p>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{watchedValues.description}</p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Responsibilities</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {watchedValues.responsibilities?.filter(r => r.trim()).map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Qualifications</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {watchedValues.qualifications?.filter(q => q.trim()).map((qual, index) => (
                      <li key={index}>{qual}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                  <div className="space-y-2">
                    {watchedValues.skills?.filter(s => s.name.trim()).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={skill.isRequired ? 'destructive' : 'secondary'} size="sm">
                            {skill.level}
                          </Badge>
                          {skill.isRequired && <span className="text-xs text-red-600">Required</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Benefits & Perks</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {watchedValues.benefits?.filter(b => b.trim()).map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical Assessment Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Assessment</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Questions:</span>
                      <p className="text-gray-600">{technicalQuiz.questions.length}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Total Points:</span>
                      <p className="text-gray-600">{technicalQuiz.totalPoints}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time Limit:</span>
                      <p className="text-gray-600">{technicalQuiz.timeLimit} minutes</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Passing Score:</span>
                      <p className="text-gray-600">{technicalQuiz.passingScore}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <p className="text-blue-800 text-sm">
                  After submission, this job will be sent to the HR team for enhancement with behavioral assessments.
                  Once HR completes their review, it will be forwarded to the CEO for final approval before publication.
                </p>
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
            disabled={currentStep === 'basic'}
          >
            Previous
          </Button>

          <Button
            type="button"
            variant="contained"
            onClick={currentStep === 'preview' ? undefined : goToNextStep}
            disabled={!isStepValid(currentStep)}
            className="bg-green-600 hover:bg-green-700"
          >
            {currentStep === 'preview' ? 'Submit' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedCreateJob;
