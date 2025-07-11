import React, { useState } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';

interface TechnicalQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'code';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryMin: string;
  salaryMax: string;
  currency: string;
  description: string;
  requirements: string[];
  skills: string[];
  minExperience: string;
  maxExperience: string;
  remote: boolean;
  urgent: boolean;
  estimatedHires: string;
}

interface CreateJobProps {
  className?: string;
}

const CreateJob: React.FC<CreateJobProps> = ({ className = '' }) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    department: '',
    location: 'Tunis, Tunisia',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    currency: 'TND',
    description: '',
    requirements: [''],
    skills: [''],
    minExperience: '',
    maxExperience: '',
    remote: false,
    urgent: false,
    estimatedHires: '1'
  });

  const [technicalQuestions, setTechnicalQuestions] = useState<TechnicalQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'basic' | 'details' | 'questions' | 'preview'>('basic');
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayFieldChange = (field: 'requirements' | 'skills', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field: 'requirements' | 'skills') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field: 'requirements' | 'skills', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTechnicalQuestion = () => {
    const newQuestion: TechnicalQuestion = {
      id: Date.now().toString(),
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10
    };
    setTechnicalQuestions(prev => [...prev, newQuestion]);
  };

  const updateTechnicalQuestion = (id: string, updates: Partial<TechnicalQuestion>) => {
    setTechnicalQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const removeTechnicalQuestion = (id: string) => {
    setTechnicalQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // API call to save draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Draft saved');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSaving(true);
    try {
      // API call to submit for HR review
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Submitted for HR review');
    } catch (error) {
      console.error('Error submitting for review:', error);
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = (step: string) => {
    switch (step) {
      case 'basic':
        return formData.title && formData.department && formData.description;
      case 'details':
        return formData.salaryMin && formData.salaryMax && formData.requirements.some(r => r.trim());
      case 'questions':
        return technicalQuestions.length >= 5;
      default:
        return true;
    }
  };

  const renderBasicInfo = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Senior Full Stack Developer"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Tunis, Tunisia"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Hires</label>
          <Input
            type="number"
            value={formData.estimatedHires}
            onChange={(e) => handleInputChange('estimatedHires', e.target.value)}
            placeholder="1"
            className="w-full"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and what makes this position exciting..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2 flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remote}
              onChange={(e) => handleInputChange('remote', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Remote work available</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.urgent}
              onChange={(e) => handleInputChange('urgent', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Urgent hiring</span>
          </label>
        </div>
      </div>
    </Card>
  );

  const renderDetails = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
      
      <div className="space-y-6">
        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range *</label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => handleInputChange('salaryMin', e.target.value)}
              placeholder="Min salary"
            />
            <Input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => handleInputChange('salaryMax', e.target.value)}
              placeholder="Max salary"
            />
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="TND">TND</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Experience Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={formData.minExperience}
              onChange={(e) => handleInputChange('minExperience', e.target.value)}
              placeholder="Min years"
            />
            <Input
              type="number"
              value={formData.maxExperience}
              onChange={(e) => handleInputChange('maxExperience', e.target.value)}
              placeholder="Max years"
            />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Input
                value={req}
                onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                placeholder="Enter requirement"
                className="flex-1"
              />
              {formData.requirements.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => removeArrayField('requirements', index)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() => addArrayField('requirements')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Requirement
          </Button>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
          {formData.skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Input
                value={skill}
                onChange={(e) => handleArrayFieldChange('skills', index, e.target.value)}
                placeholder="Enter skill"
                className="flex-1"
              />
              {formData.skills.length > 1 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => removeArrayField('skills', index)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outlined"
            size="small"
            onClick={() => addArrayField('skills')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderQuestions = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Technical Assessment Questions</h3>
        <Button
          variant="contained"
          size="small"
          onClick={addTechnicalQuestion}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>
      </div>
      
      {technicalQuestions.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h4>
          <p className="text-gray-600 mb-4">Add at least 5 technical questions to assess candidates</p>
          <Button
            variant="contained"
            onClick={addTechnicalQuestion}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Question
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {technicalQuestions.map((question, index) => (
            <Card key={question.id} className="p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => removeTechnicalQuestion(question.id)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <textarea
                  value={question.question}
                  onChange={(e) => updateTechnicalQuestion(question.id, { question: e.target.value })}
                  placeholder="Enter your question..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateTechnicalQuestion(question.id, { type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="text">Text Answer</option>
                      <option value="code">Code Challenge</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                    <Input
                      type="number"
                      value={question.points}
                      onChange={(e) => updateTechnicalQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                
                {question.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                    {question.options?.map((option, optIndex) => (
                      <Input
                        key={optIndex}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optIndex] = e.target.value;
                          updateTechnicalQuestion(question.id, { options: newOptions });
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                        className="mb-2"
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
          
          {technicalQuestions.length < 10 && (
            <Button
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
      
      {technicalQuestions.length > 0 && technicalQuestions.length < 5 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Add at least {5 - technicalQuestions.length} more question(s) to proceed
            </span>
          </div>
        </div>
      )}
    </Card>
  );

  const renderPreview = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preview</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{formData.title}</h4>
          <p className="text-gray-600">{formData.description}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Department:</span>
            <p className="text-gray-600">{formData.department}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>
            <p className="text-gray-600">{formData.location}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="text-gray-600">{formData.type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Salary:</span>
            <p className="text-gray-600">{formData.salaryMin} - {formData.salaryMax} {formData.currency}</p>
          </div>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Requirements</h5>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {formData.requirements.filter(r => r.trim()).map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-900 mb-2">Technical Assessment</h5>
          <p className="text-gray-600">{technicalQuestions.length} questions prepared</p>
        </div>
      </div>
    </Card>
  );

  const steps = [
    { id: 'basic', label: 'Basic Info', component: renderBasicInfo },
    { id: 'details', label: 'Details', component: renderDetails },
    { id: 'questions', label: 'Questions', component: renderQuestions },
    { id: 'preview', label: 'Preview', component: renderPreview }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600">Create a comprehensive job posting with technical assessment</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          
          {currentStep === 'preview' && (
            <Button
              variant="contained"
              onClick={handleSubmitForReview}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              index <= currentStepIndex
                ? 'bg-red-600 border-red-600 text-white'
                : isStepValid(step.id)
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-300 text-gray-400'
            }`}>
              {isStepValid(step.id) && index < currentStepIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${
                index < currentStepIndex ? 'bg-red-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div>
        {steps[currentStepIndex].component()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outlined"
          onClick={() => {
            const prevIndex = Math.max(0, currentStepIndex - 1);
            setCurrentStep(steps[prevIndex].id as any);
          }}
          disabled={currentStepIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          variant="contained"
          onClick={() => {
            const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
            setCurrentStep(steps[nextIndex].id as any);
          }}
          disabled={currentStepIndex === steps.length - 1 || !isStepValid(currentStep)}
        >
          {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default CreateJob;
