// Enhanced Job Enhancement Component for HR Workflow

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Star,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Job, HRQuiz, HRQuestion, HREnhancementData } from '@/types';
import { mockWorkflowService } from '@/services/mockWorkflowService';
import { toast } from 'react-toastify';

interface EnhancedJobEnhancementProps {
  className?: string;
  jobId?: string;
}

const EnhancedJobEnhancement: React.FC<EnhancedJobEnhancementProps> = ({ 
  className = '', 
  jobId: propJobId 
}) => {
  const { jobId: paramJobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const jobId = propJobId || paramJobId;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [hrQuiz, setHrQuiz] = useState<HRQuiz>({
    id: '',
    title: '',
    description: '',
    questions: [],
    totalPoints: 0,
    timeLimit: 45,
    passingScore: 70,
    instructions: 'Please answer honestly about your work style and experiences.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [culturalFitCriteria, setCulturalFitCriteria] = useState<string[]>(['']);
  const [behavioralCompetencies, setBehavioralCompetencies] = useState<string[]>(['']);
  const [teamDynamicsAssessment, setTeamDynamicsAssessment] = useState('');
  const [companyValuesAlignment, setCompanyValuesAlignment] = useState<string[]>(['']);
  const [additionalNotes, setAdditionalNotes] = useState('');

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
      const jobData = await mockWorkflowService.getJobById(jobId);
      setJob(jobData);
      
      // Initialize HR quiz with job-specific data
      setHrQuiz(prev => ({
        ...prev,
        title: `Behavioral Assessment for ${jobData.title}`,
        description: `Comprehensive behavioral and cultural fit evaluation for ${jobData.title} position in ${jobData.department}`
      }));
      
      // Pre-populate with default values based on job
      setCulturalFitCriteria([
        'Collaboration and teamwork',
        'Innovation and creativity',
        'Continuous learning mindset',
        'Customer focus',
        'Integrity and transparency'
      ]);
      
      setBehavioralCompetencies([
        'Communication skills',
        'Problem-solving ability',
        'Leadership potential',
        'Adaptability',
        'Time management'
      ]);
      
      setTeamDynamicsAssessment(`Evaluate candidate's ability to work effectively in cross-functional teams within the ${jobData.department} department`);
      
      setCompanyValuesAlignment([
        'Excellence in delivery',
        'Innovation and growth',
        'Respect and inclusion',
        'Customer success'
      ]);
      
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  // Add HR question
  const addHRQuestion = () => {
    const newQuestion: HRQuestion = {
      id: `hr-${Date.now()}`,
      question: '',
      type: 'text',
      category: 'communication',
      points: 10,
      required: true,
      description: '',
      evaluationCriteria: []
    };

    setHrQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 10
    }));
  };

  // Update HR question
  const updateHRQuestion = (index: number, updates: Partial<HRQuestion>) => {
    setHrQuiz(prev => {
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

  // Remove HR question
  const removeHRQuestion = (index: number) => {
    setHrQuiz(prev => {
      const questionToRemove = prev.questions[index];
      return {
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
        totalPoints: prev.totalPoints - questionToRemove.points
      };
    });
  };

  // Add/remove array items
  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // In real implementation, save draft to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Submit for CEO approval
  const handleSubmitForApproval = async () => {
    if (!job) return;
    
    // Validation
    if (hrQuiz.questions.length < 3) {
      toast.error('Please add at least 3 HR assessment questions');
      return;
    }
    
    if (!culturalFitCriteria.some(c => c.trim())) {
      toast.error('Please add at least one cultural fit criterion');
      return;
    }
    
    setSubmitting(true);
    try {
      const enhancementData: HREnhancementData = {
        jobId: job.id,
        hrQuiz,
        culturalFitCriteria: culturalFitCriteria.filter(c => c.trim()),
        behavioralCompetencies: behavioralCompetencies.filter(c => c.trim()),
        teamDynamicsAssessment,
        companyValuesAlignment: companyValuesAlignment.filter(c => c.trim()),
        additionalNotes,
        enhancedAt: new Date().toISOString(),
        enhancedBy: 'current-hr-user'
      };

      // In real implementation, call API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Job enhanced successfully and sent for CEO approval!');
      navigate('/rh/dashboard');
    } catch (error) {
      console.error('Error submitting enhancement:', error);
      toast.error('Failed to submit enhancement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-600 mb-4">The requested job could not be found or you don't have access to it.</p>
        <Button onClick={() => navigate('/rh/dashboard')}>
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="small"
            onClick={() => navigate('/rh/applications')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhance Job Posting</h1>
            <p className="text-gray-600">Add HR assessments and behavioral evaluations</p>
          </div>
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
          
          <Button
            variant="contained"
            onClick={handleSubmitForApproval}
            disabled={saving || submitting}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Submitting...' : 'Submit for CEO Approval'}
          </Button>
        </div>
      </div>

      {/* Job Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {job.department}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job.projectLeader.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Created {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="warning">Pending HR Enhancement</Badge>
            {job.urgent && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>

        <p className="text-gray-700 mb-4">{job.description}</p>

        {/* Technical Assessment Info */}
        {job.technicalQuiz && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Technical Assessment Included</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Questions:</span> {job.technicalQuiz.questions.length}
              </div>
              <div>
                <span className="font-medium">Total Points:</span> {job.technicalQuiz.totalPoints}
              </div>
              <div>
                <span className="font-medium">Time Limit:</span> {job.technicalQuiz.timeLimit} minutes
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* HR Quiz Builder */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">HR Assessment Quiz</h3>
            <p className="text-sm text-gray-600">Create behavioral and cultural fit evaluation questions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{hrQuiz.questions.length}</span> questions
              <span className="mx-2">•</span>
              <span className="font-medium">{hrQuiz.totalPoints}</span> points
            </div>
            <Button
              variant="contained"
              size="small"
              onClick={addHRQuestion}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
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
              value={hrQuiz.title}
              onChange={(e) => setHrQuiz(prev => ({ ...prev, title: e.target.value }))}
              placeholder="HR Assessment Title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
            <Input
              type="number"
              value={hrQuiz.timeLimit}
              onChange={(e) => setHrQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 45 }))}
              min="15"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
            <Input
              type="number"
              value={hrQuiz.passingScore}
              onChange={(e) => setHrQuiz(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
              min="50"
              max="100"
            />
          </div>
        </div>

        {/* HR Questions */}
        {hrQuiz.questions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No HR questions added yet</h4>
            <p className="text-gray-600 mb-4">Add behavioral assessment questions to evaluate cultural fit</p>
            <Button
              variant="contained"
              onClick={addHRQuestion}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4" />
              Add First Question
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hrQuiz.questions.map((question, index) => (
              <Card key={question.id} className="p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">HR Question {index + 1}</h4>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => removeHRQuestion(index)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    value={question.question}
                    onChange={(e) => updateHRQuestion(index, { question: e.target.value })}
                    placeholder="Enter your HR assessment question..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateHRQuestion(index, { type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="text">Text Answer</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="rating">Rating Scale</option>
                        <option value="behavioral">Behavioral</option>
                        <option value="scenario">Scenario</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={question.category}
                        onChange={(e) => updateHRQuestion(index, { category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="communication">Communication</option>
                        <option value="teamwork">Teamwork</option>
                        <option value="leadership">Leadership</option>
                        <option value="problem_solving">Problem Solving</option>
                        <option value="cultural_fit">Cultural Fit</option>
                        <option value="motivation">Motivation</option>
                        <option value="adaptability">Adaptability</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateHRQuestion(index, { points: parseInt(e.target.value) || 10 })}
                        min="1"
                        max="50"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateHRQuestion(index, { required: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>
                  
                  {(question.type === 'multiple_choice' || question.type === 'rating') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                      <textarea
                        value={question.options?.join('\n') || ''}
                        onChange={(e) => updateHRQuestion(index, { options: e.target.value.split('\n').filter(o => o.trim()) })}
                        placeholder="Enter options, one per line"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description/Instructions</label>
                    <Input
                      value={question.description || ''}
                      onChange={(e) => updateHRQuestion(index, { description: e.target.value })}
                      placeholder="Additional context or instructions for this question"
                    />
                  </div>
                </div>
              </Card>
            ))}
            
            {hrQuiz.questions.length < 15 && (
              <Button
                variant="outlined"
                onClick={addHRQuestion}
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Question
              </Button>
            )}
          </div>
        )}
        
        {hrQuiz.questions.length > 0 && hrQuiz.questions.length < 3 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Add at least {3 - hrQuiz.questions.length} more question(s) to proceed
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnhancedJobEnhancement;
