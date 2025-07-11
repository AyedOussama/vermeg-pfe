/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { X, User, Briefcase, Users, Building, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { navigationConfig } from '@/types/navigation';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  setShowCandidateModal?: (show: boolean) => void;
  setShowInternalModal?: (show: boolean) => void;
  user?: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  activeSection,
  setActiveSection,
  setShowCandidateModal,
  setShowInternalModal,
  user
}) => {
  const navigate = useNavigate();

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);

    // Check if we're on the landing page
    const currentPath = window.location.pathname;

    if (currentPath === '/') {
      // We're on the landing page, scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    } else {
      // We're on a different page, navigate to landing page with section hash
      navigate(`/#${sectionId}`);
    }
  };

  // Authentication options for different user types
  const authOptions = [
    {
      type: 'candidate',
      title: 'Job Seeker',
      subtitle: 'Find your dream job',
      description: 'Browse opportunities and apply to positions',
      icon: User,
      loginPath: '/auth/login',
      registerPath: '/auth/candidate-register',
      color: 'red',
      canRegister: true,
      priority: 1
    },
    {
      type: 'hr',
      title: 'HR Manager',
      subtitle: 'Manage recruitment process',
      description: 'Post jobs, review applications, and manage candidates',
      icon: Users,
      loginPath: '/auth/internal-login',
      registerPath: '/auth/enhanced-internal-register',
      color: 'green',
      canRegister: true,
      priority: 2
    },
    {
      type: 'project-leader',
      title: 'Project Leader',
      subtitle: 'Lead project teams',
      description: 'Manage projects and coordinate team members',
      icon: Briefcase,
      loginPath: '/auth/internal-login',
      registerPath: '/auth/enhanced-internal-register',
      color: 'purple',
      canRegister: true,
      priority: 3
    },
    {
      type: 'ceo',
      title: 'CEO / Executive',
      subtitle: 'Executive dashboard access',
      description: 'Strategic oversight and company-wide analytics',
      icon: Building,
      loginPath: '/auth/internal-login',
      registerPath: null,
      color: 'red',
      canRegister: false,
      priority: 4,
      isPreRegistered: true
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${
      mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-red-600">Recruit</span>
              <span className="text-gray-900">Pro</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navigationConfig.map(item => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'bg-red-50 text-red-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>


        {/* Auth Section */}
        <div className="p-4 border-t border-gray-100 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Get Started</h3>
            <p className="text-sm text-gray-600">Choose your role to access the platform</p>
          </div>

          <div className="space-y-3">
            {authOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <div key={option.type} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                        option.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        option.color === 'green' ? 'bg-green-100 text-green-600' :
                        option.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">{option.title}</h4>
                          {option.isPreRegistered && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Pre-registered
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{option.subtitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          navigate(option.loginPath);
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                      {option.canRegister ? (
                        <button
                          onClick={() => {
                            navigate(option.registerPath!);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                            option.color === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                            option.color === 'green' ? 'bg-green-600 text-white hover:bg-green-700' :
                            option.color === 'purple' ? 'bg-purple-600 text-white hover:bg-purple-700' :
                            'bg-red-600 text-white hover:bg-red-700'
                          }`}
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Get Started</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                          <Building className="w-4 h-4" />
                          <span>Contact Admin</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help getting started? <a href="#contact" className="text-red-600 hover:text-red-700 font-medium">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;