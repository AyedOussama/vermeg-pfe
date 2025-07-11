import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Send, Plus, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { TextArea } from '@/components/common/TextArea';
import { MultiSelect } from '@/components/common/MultiSelect';
import { useAuth } from '@/context/AuthContext';

const jobSchema = z.object({
  title: z.string().min(5, 'Job title must be at least 5 characters'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.string().min(1, 'Employment type is required'),
  level: z.string().min(1, 'Experience level is required'),
  salaryRangeMin: z.number().min(1, 'Minimum salary is required'),
  salaryRangeMax: z.number().min(1, 'Maximum salary is required'),
  displaySalary: z.boolean(),
  minExperience: z.number().min(0, 'Minimum experience cannot be negative'),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  responsibilities: z.string().min(30, 'Responsibilities must be at least 30 characters'),
  qualifications: z.string().min(30, 'Qualifications must be at least 30 characters'),
  benefits: z.string().min(20, 'Benefits must be at least 20 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  preferredSkills: z.array(z.string()),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface TechnicalQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'code';
  options?: string[];
  correctAnswer?: number;
  points: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const CreateJobPage: React.FC = () => {
  const { user } = useAuth();
  const [technicalQuestions, setTechnicalQuestions] = useState<TechnicalQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<TechnicalQuestion>>({
    type: 'text',
    difficulty: 'intermediate',
    points: 10
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      displaySalary: true,
      requiredSkills: [],
      preferredSkills: [],
      tags: []
    }
  });

  const departmentOptions = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'product', label: 'Product Management' },
    { value: 'data_analytics', label: 'Data Analytics' },
    { value: 'devops', label: 'DevOps & Infrastructure' },
    { value: 'qa', label: 'Quality Assurance' },
    { value: 'security', label: 'Security' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' }
  ];

  const locationOptions = [
    { value: 'paris_france', label: 'Paris, France' },
    { value: 'luxembourg', label: 'Luxembourg' },
    { value: 'tunis_tunisia', label: 'Tunis, Tunisia' },
    { value: 'london_uk', label: 'London, UK' },
    { value: 'dubai_uae', label: 'Dubai, UAE' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const typeOptions = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const levelOptions = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid_level', label: 'Mid-level (2-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead (8+ years)' },
    { value: 'manager', label: 'Manager' },
    { value: 'director', label: 'Director' }
  ];

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'sql', label: 'SQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'aws', label: 'AWS' },
    { value: 'azure', label: 'Azure' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' },
    { value: 'git', label: 'Git' },
    { value: 'agile', label: 'Agile/Scrum' },
    { value: 'devops', label: 'DevOps' }
  ];

  const addTechnicalQuestion = () => {
    if (currentQuestion.question && currentQuestion.points) {
      const newQuestion: TechnicalQuestion = {
        id: `tq_${Date.now()}`,
        question: currentQuestion.question,
        type: currentQuestion.type || 'text',
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer,
        points: currentQuestion.points,
        difficulty: currentQuestion.difficulty || 'intermediate'
      };
      setTechnicalQuestions([...technicalQuestions, newQuestion]);
      setCurrentQuestion({
        type: 'text',
        difficulty: 'intermediate',
        points: 10
      });
    }
  };

  const removeTechnicalQuestion = (id: string) => {
    setTechnicalQuestions(technicalQuestions.filter(q => q.id !== id));
  };

  const onSubmit = async (data: JobFormData) => {
    try {
      const jobData = {
        ...data,
        id: `JOB_${Date.now()}`,
        createdBy: user?.id,
        status: 'Draft',
        technicalQuestions: technicalQuestions.length,
        hrQuestions: 0,
        applications: 0,
        posted: new Date().toISOString(),
        questions: technicalQuestions
      };

      console.log('Creating job:', jobData);
      
      // Here you would typically send the data to your API
      // await createJob(jobData);
      
      alert('Job created successfully! It will be sent to HR for enhancement.');
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const saveDraft = async () => {
    // Save as draft functionality
    console.log('Saving draft...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600">Post a new position and define technical requirements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" onClick={saveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Briefcase className="w-5 h-5 text-green-600 mr-2" />
            Basic Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Job Title"
                {...register('title')}
                error={errors.title?.message}
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>
            
            <Select
              label="Department"
              options={departmentOptions}
              {...register('department')}
              error={errors.department?.message}
              required
            />
            
            <Select
              label="Location"
              options={locationOptions}
              {...register('location')}
              error={errors.location?.message}
              required
            />
            
            <Select
              label="Employment Type"
              options={typeOptions}
              {...register('type')}
              error={errors.type?.message}
              required
            />
            
            <Select
              label="Experience Level"
              options={levelOptions}
              {...register('level')}
              error={errors.level?.message}
              required
            />
            
            <Input
              label="Minimum Experience (years)"
              type="number"
              min="0"
              {...register('minExperience', { valueAsNumber: true })}
              error={errors.minExperience?.message}
              required
            />
          </div>
        </div>

        {/* Compensation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Compensation</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Input
              label="Minimum Salary (€)"
              type="number"
              min="0"
              {...register('salaryRangeMin', { valueAsNumber: true })}
              error={errors.salaryRangeMin?.message}
              required
            />
            
            <Input
              label="Maximum Salary (€)"
              type="number"
              min="0"
              {...register('salaryRangeMax', { valueAsNumber: true })}
              error={errors.salaryRangeMax?.message}
              required
            />
            
            <div className="flex items-center pt-8">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('displaySalary')}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Display salary publicly</span>
              </label>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Description</h2>
          
          <div className="space-y-6">
            <TextArea
              label="Job Description"
              {...register('description')}
              error={errors.description?.message}
              rows={4}
              placeholder="Provide a comprehensive overview of the role..."
              required
            />
            
            <TextArea
              label="Key Responsibilities"
              {...register('responsibilities')}
              error={errors.responsibilities?.message}
              rows={4}
              placeholder="List the main responsibilities and duties..."
              required
            />
            
            <TextArea
              label="Qualifications & Requirements"
              {...register('qualifications')}
              error={errors.qualifications?.message}
              rows={4}
              placeholder="Specify required qualifications, education, and experience..."
              required
            />
            
            <TextArea
              label="Benefits & Perks"
              {...register('benefits')}
              error={errors.benefits?.message}
              rows={3}
              placeholder="Describe the benefits, perks, and company culture..."
              required
            />
          </div>
        </div>

        {/* Skills & Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills & Tags</h2>

          <div className="space-y-6">
            <MultiSelect
              label="Required Skills"
              options={skillOptions}
              value={watch('requiredSkills')}
              onChange={(skills) => setValue('requiredSkills', skills)}
              error={errors.requiredSkills?.message}
              required
            />

            <MultiSelect
              label="Preferred Skills (Optional)"
              options={skillOptions}
              value={watch('preferredSkills')}
              onChange={(skills) => setValue('preferredSkills', skills)}
              error={errors.preferredSkills?.message}
            />

            <MultiSelect
              label="Job Tags"
              options={skillOptions}
              value={watch('tags')}
              onChange={(tags) => setValue('tags', tags)}
              error={errors.tags?.message}
              required
            />
          </div>
        </div>

        {/* Technical Questions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Assessment Questions</h2>

          {/* Add Question Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Technical Question</h3>
            <div className="space-y-4">
              <TextArea
                label="Question"
                value={currentQuestion.question || ''}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                placeholder="Enter your technical question..."
                rows={3}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <Select
                  label="Question Type"
                  options={[
                    { value: 'text', label: 'Text Answer' },
                    { value: 'multiple_choice', label: 'Multiple Choice' },
                    { value: 'code', label: 'Code Challenge' }
                  ]}
                  value={currentQuestion.type || 'text'}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value as any})}
                />

                <Select
                  label="Difficulty"
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]}
                  value={currentQuestion.difficulty || 'intermediate'}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, difficulty: e.target.value as any})}
                />

                <Input
                  label="Points"
                  type="number"
                  min="1"
                  max="100"
                  value={currentQuestion.points || 10}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                />
              </div>

              <Button
                type="button"
                onClick={addTechnicalQuestion}
                disabled={!currentQuestion.question || !currentQuestion.points}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Questions List */}
          {technicalQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">Added Questions ({technicalQuestions.length})</h3>
              {technicalQuestions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Q{index + 1}: {question.question}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Type: {question.type}</span>
                        <span>Difficulty: {question.difficulty}</span>
                        <span>Points: {question.points}</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => removeTechnicalQuestion(question.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outlined">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            Create Job & Send to HR
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
