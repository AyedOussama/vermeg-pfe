import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  Star,
  BookOpen,
  Users,
  Brain,
  Heart,
  MessageSquare,
  Target,
  Award,
  Settings,
  Download,
  Upload,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'behavioral' | 'cultural_fit' | 'communication' | 'teamwork' | 'leadership' | 'adaptability';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Array<{
    id: string;
    question: string;
    type: 'text' | 'multiple_choice' | 'rating' | 'scenario';
    category: string;
    points: number;
    options?: string[];
    evaluationCriteria?: string[];
  }>;
  usage: number;
  rating: number;
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  tags: string[];
  validationMetrics: {
    reliability: number;
    validity: number;
    consistency: number;
  };
}

interface CompetencyFramework {
  id: string;
  name: string;
  description: string;
  competencies: Array<{
    name: string;
    description: string;
    levels: string[];
    indicators: string[];
  }>;
  industry: string;
  usage: number;
}

const BehavioralAssessmentLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'templates' | 'frameworks'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<AssessmentTemplate | null>(null);

  const categories = [
    { value: 'all', label: 'All Categories', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'behavioral', label: 'Behavioral', icon: <Users className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
    { value: 'cultural_fit', label: 'Cultural Fit', icon: <Heart className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
    { value: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'teamwork', label: 'Teamwork', icon: <Users className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'leadership', label: 'Leadership', icon: <Award className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'adaptability', label: 'Adaptability', icon: <Settings className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' }
  ];

  const sampleTemplates: AssessmentTemplate[] = [
    {
      id: 'template-1',
      name: 'Communication Skills Assessment',
      description: 'Comprehensive evaluation of verbal and written communication abilities',
      category: 'communication',
      difficulty: 'intermediate',
      questions: [
        {
          id: 'q1',
          question: 'Describe a time when you had to explain a complex concept to someone with no background in the subject.',
          type: 'text',
          category: 'communication',
          points: 15,
          evaluationCriteria: ['Clarity of explanation', 'Use of analogies', 'Audience awareness', 'Patience and empathy']
        },
        {
          id: 'q2',
          question: 'How do you prefer to receive feedback?',
          type: 'multiple_choice',
          category: 'communication',
          points: 10,
          options: ['Direct and immediate', 'Written with examples', 'In private one-on-one', 'In team meetings', 'Through regular scheduled reviews']
        },
        {
          id: 'q3',
          question: 'Rate your comfort level with public speaking',
          type: 'rating',
          category: 'communication',
          points: 8,
          options: ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable']
        }
      ],
      usage: 156,
      rating: 4.7,
      createdBy: 'HR Team',
      createdAt: '2024-01-15',
      lastUsed: '2024-06-20',
      tags: ['communication', 'soft-skills', 'presentation', 'feedback'],
      validationMetrics: {
        reliability: 0.89,
        validity: 0.85,
        consistency: 0.92
      }
    },
    {
      id: 'template-2',
      name: 'Team Collaboration Assessment',
      description: 'Evaluate teamwork skills and collaborative behavior',
      category: 'teamwork',
      difficulty: 'intermediate',
      questions: [
        {
          id: 'q1',
          question: 'Describe a challenging team project you worked on and your specific role.',
          type: 'text',
          category: 'teamwork',
          points: 20,
          evaluationCriteria: ['Role clarity', 'Collaboration examples', 'Conflict resolution', 'Team contribution']
        },
        {
          id: 'q2',
          question: 'How do you handle disagreements with team members?',
          type: 'scenario',
          category: 'teamwork',
          points: 15
        }
      ],
      usage: 89,
      rating: 4.5,
      createdBy: 'Emma Wilson',
      createdAt: '2024-02-10',
      lastUsed: '2024-06-18',
      tags: ['teamwork', 'collaboration', 'conflict-resolution'],
      validationMetrics: {
        reliability: 0.87,
        validity: 0.83,
        consistency: 0.90
      }
    },
    {
      id: 'template-3',
      name: 'Leadership Potential Evaluation',
      description: 'Assess leadership qualities and potential for growth',
      category: 'leadership',
      difficulty: 'advanced',
      questions: [
        {
          id: 'q1',
          question: 'Describe a situation where you had to lead a team through a difficult challenge.',
          type: 'text',
          category: 'leadership',
          points: 25,
          evaluationCriteria: ['Vision setting', 'Team motivation', 'Decision making', 'Results achieved']
        }
      ],
      usage: 67,
      rating: 4.8,
      createdBy: 'Sophie Dubois',
      createdAt: '2024-03-05',
      lastUsed: '2024-06-15',
      tags: ['leadership', 'management', 'decision-making'],
      validationMetrics: {
        reliability: 0.91,
        validity: 0.88,
        consistency: 0.94
      }
    },
    {
      id: 'template-4',
      name: 'Cultural Fit Assessment',
      description: 'Evaluate alignment with company values and culture',
      category: 'cultural_fit',
      difficulty: 'beginner',
      questions: [
        {
          id: 'q1',
          question: 'What motivates you most in your work?',
          type: 'multiple_choice',
          category: 'cultural_fit',
          points: 12,
          options: ['Learning new skills', 'Helping others', 'Achieving goals', 'Creative expression', 'Financial rewards']
        },
        {
          id: 'q2',
          question: 'How do you prefer to work?',
          type: 'rating',
          category: 'cultural_fit',
          points: 10,
          options: ['Independently', 'Small teams', 'Large teams', 'Mixed approach']
        }
      ],
      usage: 203,
      rating: 4.3,
      createdBy: 'HR Team',
      createdAt: '2024-01-20',
      lastUsed: '2024-06-22',
      tags: ['culture', 'values', 'motivation', 'work-style'],
      validationMetrics: {
        reliability: 0.84,
        validity: 0.81,
        consistency: 0.88
      }
    }
  ];

  const sampleFrameworks: CompetencyFramework[] = [
    {
      id: 'framework-1',
      name: 'Technical Leadership Competencies',
      description: 'Core competencies for technical leadership roles',
      competencies: [
        {
          name: 'Technical Vision',
          description: 'Ability to set and communicate technical direction',
          levels: ['Basic', 'Proficient', 'Advanced', 'Expert'],
          indicators: ['Understands technology trends', 'Creates technical roadmaps', 'Influences technical decisions']
        },
        {
          name: 'Team Development',
          description: 'Capability to grow and develop technical teams',
          levels: ['Basic', 'Proficient', 'Advanced', 'Expert'],
          indicators: ['Mentors team members', 'Identifies skill gaps', 'Creates development plans']
        }
      ],
      industry: 'Technology',
      usage: 45
    },
    {
      id: 'framework-2',
      name: 'Customer Service Excellence',
      description: 'Competencies for customer-facing roles',
      competencies: [
        {
          name: 'Customer Empathy',
          description: 'Understanding and relating to customer needs',
          levels: ['Developing', 'Competent', 'Proficient', 'Mastery'],
          indicators: ['Active listening', 'Emotional intelligence', 'Problem understanding']
        }
      ],
      industry: 'Service',
      usage: 78
    }
  ];

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTemplates(sampleTemplates);
      setFrameworks(sampleFrameworks);
    } catch (error) {
      console.error('Error loading library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[0];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Library</h1>
          <p className="text-gray-600">
            Pre-built question templates, competency frameworks, and validation metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outlined" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Template
          </Button>
          
          <Button 
            variant="contained" 
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('templates')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'templates'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Templates ({templates.length})
              </button>
              <button
                onClick={() => setViewMode('frameworks')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'frameworks'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target className="w-4 h-4 mr-2 inline" />
                Frameworks ({frameworks.length})
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="small">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="ghost" size="small">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      {viewMode === 'templates' && (
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates by name, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Templates View */}
      {viewMode === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const categoryInfo = getCategoryInfo(template.category);

            return (
              <Card key={template.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge className={categoryInfo.color} size="sm">
                    {categoryInfo.icon}
                    <span className="ml-1">{categoryInfo.label}</span>
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)} size="sm">
                    {template.difficulty}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{template.questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usage:</span>
                    <span className="font-medium">{template.usage} times</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center gap-1">
                      {renderStars(template.rating)}
                      <span className="text-xs text-gray-500 ml-1">({template.rating})</span>
                    </div>
                  </div>
                </div>

                {/* Validation Metrics */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Validation Metrics</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {Math.round(template.validationMetrics.reliability * 100)}%
                      </div>
                      <div className="text-gray-600">Reliability</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {Math.round(template.validationMetrics.validity * 100)}%
                      </div>
                      <div className="text-gray-600">Validity</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {Math.round(template.validationMetrics.consistency * 100)}%
                      </div>
                      <div className="text-gray-600">Consistency</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="contained"
                    size="small"
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>

                  <Button variant="outlined" size="small">
                    <Copy className="w-3 h-3" />
                  </Button>

                  <Button variant="outlined" size="small">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Frameworks View */}
      {viewMode === 'frameworks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {frameworks.map((framework) => (
            <Card key={framework.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{framework.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{framework.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Industry: {framework.industry}</span>
                    <span>Used {framework.usage} times</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <h4 className="font-medium text-gray-900">Competencies ({framework.competencies.length})</h4>
                {framework.competencies.slice(0, 2).map((competency, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-1">{competency.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{competency.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Levels:</span>
                      {competency.levels.map((level, levelIndex) => (
                        <Badge key={levelIndex} variant="outline" size="sm">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {framework.competencies.length > 2 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{framework.competencies.length - 2} more competencies
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="contained" size="small" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  <Eye className="w-3 h-3 mr-1" />
                  View Framework
                </Button>
                <Button variant="outlined" size="small">
                  <Copy className="w-3 h-3" />
                </Button>
                <Button variant="outlined" size="small">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 mb-4">Questions ({selectedTemplate.questions.length})</h3>
                  <div className="space-y-4">
                    {selectedTemplate.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          <Badge variant="outline" size="sm">
                            {question.points} pts
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{question.question}</p>

                        {question.options && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <li key={optIndex} className="flex items-center">
                                  <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                                    {optIndex + 1}
                                  </span>
                                  {option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.evaluationCriteria && question.evaluationCriteria.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">Evaluation Criteria:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {question.evaluationCriteria.map((criteria, critIndex) => (
                                <li key={critIndex} className="flex items-center">
                                  <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Template Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <Badge className={getCategoryInfo(selectedTemplate.category).color} size="sm">
                          {getCategoryInfo(selectedTemplate.category).label}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Difficulty:</span>
                        <Badge className={getDifficultyColor(selectedTemplate.difficulty)} size="sm">
                          {selectedTemplate.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usage:</span>
                        <span className="font-medium">{selectedTemplate.usage} times</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created by:</span>
                        <span className="font-medium">{selectedTemplate.createdBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{selectedTemplate.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-3">Validation Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-orange-700">Reliability</span>
                          <span className="font-medium text-orange-900">
                            {Math.round(selectedTemplate.validationMetrics.reliability * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${selectedTemplate.validationMetrics.reliability * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-orange-700">Validity</span>
                          <span className="font-medium text-orange-900">
                            {Math.round(selectedTemplate.validationMetrics.validity * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${selectedTemplate.validationMetrics.validity * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-orange-700">Consistency</span>
                          <span className="font-medium text-orange-900">
                            {Math.round(selectedTemplate.validationMetrics.consistency * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{ width: `${selectedTemplate.validationMetrics.consistency * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="contained"
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Use This Template
                    </Button>
                    <Button variant="outlined" className="w-full">
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'templates' && filteredTemplates.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
              ? 'No templates found'
              : 'No templates available'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your search criteria or filters'
              : 'Create your first assessment template to get started'
            }
          </p>
          <Button
            variant="contained"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}
    </div>
  );
};

export default BehavioralAssessmentLibrary;
