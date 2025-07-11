import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import CandidateProfileView from '@/components/candidate/CandidateProfileView';
import CandidateProfileEdit from '@/components/candidate/CandidateProfileEdit';
import { CandidateProfileData } from '@/types/candidateProfile';
import { Eye, Edit, User } from 'lucide-react';

const ProfileDemo: React.FC = () => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [profileData, setProfileData] = useState<CandidateProfileData>({
    id: 'demo-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+216 12 345 678',
    location: 'Tunis, Tunisia',
    dateOfBirth: '1990-05-15',
    summary: 'Experienced Full Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Passionate about building scalable web applications and leading development teams.',
    profilePicture: undefined,
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.dev',
    currentPosition: 'Senior Full Stack Developer',
    yearsOfExperience: 5,
    expectedSalaryRange: '60,000 - 80,000 TND',
    availabilityToStart: 'Immediately',
    workPreference: 'hybrid',
    preferredJobCategories: ['Software Development', 'Web Development', 'Full Stack'],
    preferredLocations: ['Tunis', 'Remote'],
    experience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        position: 'Senior Full Stack Developer',
        startDate: '2021-01-01',
        current: true,
        description: 'Lead development of enterprise web applications using React, Node.js, and AWS. Mentor junior developers and collaborate with cross-functional teams.',
        location: 'Tunis, Tunisia',
        employmentType: 'full-time',
        achievements: [
          'Increased application performance by 40%',
          'Led a team of 5 developers',
          'Implemented CI/CD pipeline reducing deployment time by 60%'
        ],
        technologies: ['React', 'Node.js', 'AWS', 'TypeScript', 'MongoDB']
      },
      {
        id: '2',
        company: 'StartupXYZ',
        position: 'Full Stack Developer',
        startDate: '2019-06-01',
        endDate: '2020-12-31',
        current: false,
        description: 'Developed and maintained web applications for a fast-growing startup. Worked closely with product team to implement new features.',
        location: 'Tunis, Tunisia',
        employmentType: 'full-time',
        achievements: [
          'Built the entire frontend from scratch',
          'Reduced page load times by 50%'
        ],
        technologies: ['Vue.js', 'Express.js', 'PostgreSQL', 'Docker']
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Tunis',
        degree: 'Master of Science',
        field: 'Computer Science',
        startDate: '2016-09-01',
        endDate: '2018-06-30',
        gpa: '3.8/4.0',
        location: 'Tunis, Tunisia',
        honors: ['Magna Cum Laude', 'Dean\'s List'],
        relevantCoursework: ['Advanced Algorithms', 'Software Engineering', 'Database Systems']
      },
      {
        id: '2',
        institution: 'University of Tunis',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2013-09-01',
        endDate: '2016-06-30',
        gpa: '3.6/4.0',
        location: 'Tunis, Tunisia',
        honors: ['Dean\'s List'],
        relevantCoursework: ['Data Structures', 'Programming Fundamentals', 'Mathematics']
      }
    ],
    skills: [
      { id: '1', name: 'React', level: 'Expert', category: 'Technical', yearsOfExperience: 5 },
      { id: '2', name: 'Node.js', level: 'Advanced', category: 'Technical', yearsOfExperience: 4 },
      { id: '3', name: 'TypeScript', level: 'Advanced', category: 'Technical', yearsOfExperience: 3 },
      { id: '4', name: 'AWS', level: 'Intermediate', category: 'Technical', yearsOfExperience: 2 },
      { id: '5', name: 'Leadership', level: 'Intermediate', category: 'Soft', yearsOfExperience: 2 },
      { id: '6', name: 'Docker', level: 'Intermediate', category: 'Tool', yearsOfExperience: 3 }
    ],
    certifications: [
      {
        id: '1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2023-01-15',
        expiryDate: '2026-01-15',
        credentialId: 'AWS-CSA-123456',
        url: 'https://aws.amazon.com/certification/',
        skills: ['AWS', 'Cloud Architecture', 'DevOps']
      },
      {
        id: '2',
        name: 'React Developer Certification',
        issuer: 'Meta',
        issueDate: '2022-08-20',
        credentialId: 'META-REACT-789',
        skills: ['React', 'JavaScript', 'Frontend Development']
      }
    ],
    languages: [
      { id: '1', name: 'English', proficiency: 'Fluent', certificationLevel: 'C1' },
      { id: '2', name: 'French', proficiency: 'Native' },
      { id: '3', name: 'Arabic', proficiency: 'Native' }
    ],
    portfolio: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution built with React and Node.js',
        url: 'https://github.com/johndoe/ecommerce',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        type: 'Project',
        role: 'Lead Developer',
        achievements: ['Handled 10k+ concurrent users', 'Integrated payment gateway']
      },
      {
        id: '2',
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates',
        url: 'https://github.com/johndoe/taskapp',
        technologies: ['Vue.js', 'Socket.io', 'Express.js', 'PostgreSQL'],
        type: 'Project',
        role: 'Full Stack Developer',
        achievements: ['Real-time collaboration features', 'Mobile-responsive design']
      }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    profileCompleteness: 85,
    isPublic: true
  });

  const handleEdit = () => {
    setMode('edit');
  };

  const handleCancelEdit = () => {
    setMode('view');
  };

  const handleSaveProfile = async (updatedData: Partial<CandidateProfileData>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update profile data
    setProfileData(prev => ({ ...prev, ...updatedData }));

    // Switch back to view mode
    setMode('view');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-8 h-8 text-red-600" />
                Candidate Profile Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Demonstration of the new candidate profile view and edit components
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={mode === 'view' ? 'contained' : 'outlined'}
                onClick={() => setMode('view')}
                icon={<Eye className="w-4 h-4" />}
                size="small"
              >
                View Mode
              </Button>
              <Button
                variant={mode === 'edit' ? 'contained' : 'outlined'}
                onClick={() => setMode('edit')}
                icon={<Edit className="w-4 h-4" />}
                size="small"
              >
                Edit Mode
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Component */}
        {mode === 'view' ? (
          <CandidateProfileView
            profileData={profileData}
            editable={true}
            onEdit={handleEdit}
          />
        ) : (
          <CandidateProfileEdit
            profileData={profileData}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Features Info */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Implemented</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✅ Profile View</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Comprehensive profile display</li>
                <li>• Sectioned navigation</li>
                <li>• Social links integration</li>
                <li>• Privacy controls</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✅ Profile Edit</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Form validation</li>
                <li>• Dynamic sections</li>
                <li>• Add/remove items</li>
                <li>• Auto-save functionality</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✅ Enhanced Services</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• File upload support</li>
                <li>• Profile validation</li>
                <li>• Bulk operations</li>
                <li>• Privacy settings</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfileDemo;
