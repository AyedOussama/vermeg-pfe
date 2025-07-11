import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Award,
  Edit,
  Upload,
  Download,
  Trash2,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';

interface CandidateProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  summary: string;
  profilePicture?: string;
  resume?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  languages: Language[];
  portfolio: PortfolioItem[];
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  location: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  technologies: string[];
  type: 'Project' | 'Publication' | 'Award' | 'Other';
}

interface CandidateProfileProps {
  candidateId?: string;
  editable?: boolean;
  className?: string;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({ 
  candidateId, 
  editable = true, 
  className = '' 
}) => {
  const [profile, setProfile] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Load profile data from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading candidate profile...');

        // Import candidateService dynamically to avoid circular dependencies
        const { candidateService } = await import('../../services/candidateService');
        const profileData = await candidateService.getCompleteProfile();

        console.log('✅ Profile loaded successfully:', profileData);
        setProfile(profileData);
      } catch (error) {
        console.error('❌ Error loading profile:', error);
        // Set a minimal profile structure on error
        setProfile({
          id: candidateId || 'unknown',
          firstName: 'Unknown',
          lastName: 'User',
          email: 'unknown@example.com',
          phone: '',
          location: '',
          dateOfBirth: '',
          summary: 'Unable to load profile. Please try again.',
          profilePicture: '',
          linkedinUrl: '',
          portfolioUrl: '',
          githubUrl: '',
          personalWebsite: '',
          currentPosition: '',
          yearsOfExperience: 0,
          expectedSalaryRange: '',
          availabilityToStart: '',
          workPreference: 'hybrid',
          resume: undefined,
          experience: [],
          education: [],
          skills: [],
          certifications: [],
          languages: [],
          portfolio: [],
          preferredJobCategories: [],
          preferredLocations: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileCompleteness: 0,
          isPublic: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [candidateId]);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800 border-green-200';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Beginner': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Native': return 'bg-green-100 text-green-800 border-green-200';
      case 'Fluent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Conversational': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Basic': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-600 mt-1">{profile.summary}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {profile.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {profile.phone}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </div>
              </div>
            </div>
          </div>
          
          {editable && (
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                variant="contained"
                size="small"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download CV
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
            { id: 'skills', label: 'Skills' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'portfolio', label: 'Portfolio' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
              <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
            </Card>

            {/* Recent Experience */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Experience</h3>
              {profile.experience.slice(0, 2).map((exp) => (
                <div key={exp.id} className="border-l-2 border-red-200 pl-4 mb-4 last:mb-0">
                  <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                  <p className="text-red-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(exp.startDate).toLocaleDateString()} - 
                    {exp.current ? ' Present' : ` ${new Date(exp.endDate!).toLocaleDateString()}`}
                  </p>
                  <p className="text-gray-700 text-sm">{exp.description}</p>
                </div>
              ))}
            </Card>
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-medium">5+ years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills</span>
                  <span className="font-medium">{profile.skills.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certifications</span>
                  <span className="font-medium">{profile.certifications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Languages</span>
                  <span className="font-medium">{profile.languages.length}</span>
                </div>
              </div>
            </Card>

            {/* Top Skills */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
              <div className="space-y-2">
                {profile.skills.slice(0, 5).map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{skill.name}</span>
                    <Badge className={getSkillLevelColor(skill.level)}>
                      {skill.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
              <div className="space-y-2">
                {profile.languages.map((language) => (
                  <div key={language.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{language.name}</span>
                    <Badge className={getProficiencyColor(language.proficiency)}>
                      {language.proficiency}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeSection === 'experience' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
            {editable && (
              <Button
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            )}
          </div>
          
          <div className="space-y-6">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-red-200 pl-6 relative">
                <div className="absolute w-3 h-3 bg-red-600 rounded-full -left-2 top-2"></div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{exp.position}</h4>
                    <p className="text-red-600 font-medium text-lg">{exp.company}</p>
                    <p className="text-gray-600 mb-2">
                      {new Date(exp.startDate).toLocaleDateString()} - 
                      {exp.current ? ' Present' : ` ${new Date(exp.endDate!).toLocaleDateString()}`}
                      {' • '}{exp.location}
                    </p>
                    <p className="text-gray-700">{exp.description}</p>
                  </div>
                  {editable && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outlined" size="small">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outlined" size="small" className="text-red-600 border-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSection === 'education' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            {editable && (
              <Button
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </Button>
            )}
          </div>
          
          <div className="space-y-6">
            {profile.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-blue-200 pl-6 relative">
                <div className="absolute w-3 h-3 bg-blue-600 rounded-full -left-2 top-2"></div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                    <p className="text-gray-600 mb-2">
                      {edu.field} • {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                    </p>
                    {edu.gpa && (
                      <p className="text-gray-700">GPA: {edu.gpa}</p>
                    )}
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                  {editable && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outlined" size="small">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outlined" size="small" className="text-red-600 border-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSection === 'skills' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
            {editable && (
              <Button
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            )}
          </div>
          
          <div className="space-y-6">
            {Object.entries(
              profile.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) acc[skill.category] = [];
                acc[skill.category].push(skill);
                return acc;
              }, {} as Record<string, Skill[]>)
            ).map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-md font-semibold text-gray-900 mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="font-medium text-gray-900">{skill.name}</span>
                      <Badge className={getSkillLevelColor(skill.level)}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSection === 'certifications' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
            {editable && (
              <Button
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <p className="text-gray-600">{cert.issuer}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      {cert.expiryDate && (
                        <span> • Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      )}
                    </p>
                    {cert.credentialId && (
                      <p className="text-xs text-gray-500 mt-1">ID: {cert.credentialId}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {cert.url && (
                      <Button variant="outlined" size="small">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    {editable && (
                      <>
                        <Button variant="outlined" size="small">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outlined" size="small" className="text-red-600 border-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSection === 'portfolio' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
            {editable && (
              <Button
                variant="outlined"
                size="small"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.portfolio.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.url && (
                      <Button variant="outlined" size="small" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    )}
                    {editable && (
                      <div className="flex items-center gap-1">
                        <Button variant="outlined" size="small">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outlined" size="small" className="text-red-600 border-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CandidateProfile;
