import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Star,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface JobTemplate {
  id: string;
  name: string;
  description: string;
  department: string;
  category: 'technical' | 'management' | 'design' | 'marketing' | 'sales';
  level: 'junior' | 'mid' | 'senior' | 'lead';
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdDate: string;
  lastUsed?: string;
  tags: string[];
  template: {
    title: string;
    requirements: string[];
    skills: string[];
    description: string;
    salaryRange: { min: number; max: number; currency: string };
    technicalQuestions: number;
  };
}

const JobTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for job templates
  const templates: JobTemplate[] = [
    {
      id: 'tpl-001',
      name: 'Senior Full Stack Developer',
      description: 'Template for senior full stack developer positions with React and Node.js focus',
      department: 'Engineering',
      category: 'technical',
      level: 'senior',
      isPublic: true,
      isFavorite: true,
      usageCount: 15,
      createdDate: '2024-01-15',
      lastUsed: '2024-06-15',
      tags: ['React', 'Node.js', 'TypeScript', 'AWS'],
      template: {
        title: 'Senior Full Stack Developer',
        requirements: ['5+ years experience', 'React expertise', 'Node.js proficiency'],
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
        description: 'We are looking for a senior full stack developer...',
        salaryRange: { min: 80000, max: 120000, currency: 'USD' },
        technicalQuestions: 8
      }
    },
    {
      id: 'tpl-002',
      name: 'Frontend Developer (React)',
      description: 'Standard template for React frontend developer positions',
      department: 'Engineering',
      category: 'technical',
      level: 'mid',
      isPublic: false,
      isFavorite: false,
      usageCount: 8,
      createdDate: '2024-02-20',
      lastUsed: '2024-06-10',
      tags: ['React', 'JavaScript', 'CSS', 'HTML'],
      template: {
        title: 'Frontend Developer (React)',
        requirements: ['3+ years React experience', 'Strong CSS skills'],
        skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
        description: 'Join our frontend team to build amazing user experiences...',
        salaryRange: { min: 60000, max: 85000, currency: 'USD' },
        technicalQuestions: 6
      }
    },
    {
      id: 'tpl-003',
      name: 'DevOps Engineer',
      description: 'Template for DevOps engineer positions with AWS and Kubernetes',
      department: 'Engineering',
      category: 'technical',
      level: 'senior',
      isPublic: true,
      isFavorite: true,
      usageCount: 12,
      createdDate: '2024-03-10',
      lastUsed: '2024-06-12',
      tags: ['AWS', 'Kubernetes', 'Docker', 'CI/CD'],
      template: {
        title: 'DevOps Engineer',
        requirements: ['4+ years DevOps experience', 'AWS certification preferred'],
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins'],
        description: 'We need a DevOps engineer to manage our cloud infrastructure...',
        salaryRange: { min: 90000, max: 130000, currency: 'USD' },
        technicalQuestions: 10
      }
    }
  ];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(term) ||
        template.description.toLowerCase().includes(term) ||
        template.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter);
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(template => template.level === levelFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastUsed || b.createdDate).getTime() - new Date(a.lastUsed || a.createdDate).getTime();
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchTerm, categoryFilter, levelFilter, sortBy]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-red-100 text-red-800';
      case 'management': return 'bg-purple-100 text-purple-800';
      case 'design': return 'bg-pink-100 text-pink-800';
      case 'marketing': return 'bg-orange-100 text-orange-800';
      case 'sales': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'management', label: 'Management' },
    { value: 'design', label: 'Design' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' }
  ];

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Used' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'name', label: 'Name' },
    { value: 'created', label: 'Date Created' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Templates</h1>
          <p className="text-gray-600">Create and manage reusable job posting templates</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outlined" size="small">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outlined" size="small">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.isFavorite).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Public Templates</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.filter(t => t.isPublic).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Select
            label="Level"
            options={levelOptions}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-4">
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Template Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {template.name}
                      </h3>
                      {template.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Template Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </Badge>
                  <Badge className={`text-xs ${getLevelColor(template.level)}`}>
                    {template.level}
                  </Badge>
                  {template.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>

                {/* Template Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" size="small" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" size="small" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Template Stats */}
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Used {template.usageCount} times</span>
                  <span>
                    {template.lastUsed
                      ? `Last used ${formatDate(template.lastUsed)}`
                      : `Created ${formatDate(template.createdDate)}`
                    }
                  </span>
                </div>

                {/* Template Actions */}
                <div className="flex gap-2">
                  <Button size="small" className="flex-1 bg-green-600 hover:bg-green-700">
                    <Copy className="w-3 h-3 mr-1" />
                    Use Template
                  </Button>
                  <Button variant="outlined" size="small">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="outlined" size="small">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outlined" size="small" className="text-red-600 border-red-300">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                ? "No templates match your current filters"
                : "You haven't created any job templates yet"
              }
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobTemplates;
