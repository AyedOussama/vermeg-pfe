import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  Download,
  Users,
  Zap,
  Shield,
  Settings,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface SupportResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'download' | 'link';
  category: string;
  url: string;
  duration?: string;
  size?: string;
}

const HelpSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('faq');

  // Mock FAQ data
  const faqs: FAQItem[] = [
    {
      id: 'faq-1',
      question: 'How do I create a new job posting?',
      answer: 'To create a new job posting, navigate to the "Create Job" page from the main navigation. Fill in the job details including title, description, requirements, and technical questions. Once complete, submit for HR review.',
      category: 'jobs',
      helpful: 45,
      notHelpful: 3
    },
    {
      id: 'faq-2',
      question: 'How can I review candidate applications?',
      answer: 'Go to the "Applications" page to see all applications for your job postings. You can filter by job, status, or candidate name. Click on any application to view detailed candidate information, scores, and documents.',
      category: 'applications',
      helpful: 38,
      notHelpful: 2
    },
    {
      id: 'faq-3',
      question: 'What is the job approval process?',
      answer: 'After creating a job, it goes through a 3-step approval process: 1) HR review for compliance and enhancement, 2) CEO approval for final authorization, 3) Publication to the careers page.',
      category: 'workflow',
      helpful: 52,
      notHelpful: 1
    },
    {
      id: 'faq-4',
      question: 'How do I create technical assessment questions?',
      answer: 'When creating a job, you can add technical questions in the "Questions" step. Choose from multiple choice, text answer, or code challenge formats. Each question can have custom points and difficulty levels.',
      category: 'assessments',
      helpful: 29,
      notHelpful: 4
    },
    {
      id: 'faq-5',
      question: 'Can I use job templates?',
      answer: 'Yes! Visit the "Job Templates" page to create reusable templates or use existing ones. Templates save time by pre-filling common job requirements and questions.',
      category: 'templates',
      helpful: 41,
      notHelpful: 2
    }
  ];

  // Mock support resources
  const resources: SupportResource[] = [
    {
      id: 'res-1',
      title: 'Project Leader Quick Start Guide',
      description: 'Complete guide to get started with the recruitment platform',
      type: 'guide',
      category: 'getting-started',
      url: '/guides/project-leader-quickstart.pdf',
      size: '2.3 MB'
    },
    {
      id: 'res-2',
      title: 'Creating Effective Job Postings',
      description: 'Best practices for writing compelling job descriptions',
      type: 'video',
      category: 'jobs',
      url: '/videos/effective-job-postings',
      duration: '12 min'
    },
    {
      id: 'res-3',
      title: 'Technical Assessment Best Practices',
      description: 'How to create fair and effective technical assessments',
      type: 'guide',
      category: 'assessments',
      url: '/guides/technical-assessments.pdf',
      size: '1.8 MB'
    },
    {
      id: 'res-4',
      title: 'Platform API Documentation',
      description: 'Complete API reference for integrations',
      type: 'link',
      category: 'technical',
      url: 'https://api.vermeg.com/docs'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'jobs', label: 'Job Management', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <Zap className="w-4 h-4" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesCategory;
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'guide': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'link': return <ExternalLink className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <Book className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact Support', icon: <MessageCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600">Find answers to common questions and get help with the platform</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-2xl mx-auto">
          <Input
            placeholder="Search for help articles, guides, or FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="text-lg"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedCategory === category.id
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                {category.icon}
                <span className="text-xs font-medium">{category.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700 mb-4">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <div className="flex gap-2">
                              <Button variant="outlined" size="small">
                                👍 Yes ({faq.helpful})
                              </Button>
                              <Button variant="outlined" size="small">
                                👎 No ({faq.notHelpful})
                              </Button>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
                  <p className="text-gray-600">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                          {resource.duration && (
                            <span className="text-xs text-gray-500">{resource.duration}</span>
                          )}
                          {resource.size && (
                            <span className="text-xs text-gray-500">{resource.size}</span>
                          )}
                        </div>
                        <Button variant="outlined" size="small">
                          {resource.type === 'link' ? 'Visit' : 'View'}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-sm text-gray-600 mb-4">Get instant help from our support team</p>
                  <Button className="bg-green-600 hover:bg-green-700">Start Chat</Button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Send us an email and we'll respond within 24 hours</p>
                  <Button variant="outlined">Send Email</Button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                  <p className="text-sm text-gray-600 mb-4">Call us for urgent issues</p>
                  <Button variant="outlined">+216 71 123 456</Button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Submit a Support Request</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <Input placeholder="Brief description of your issue" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      placeholder="Please describe your issue in detail..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Submit Request
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
