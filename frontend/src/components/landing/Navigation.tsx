/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { navigationConfig } from '@/types/navigation';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  setShowCandidateModal: (show: boolean) => void;
  setShowInternalModal: (show: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  isAuthenticated?: boolean;
  user?: any;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  setActiveSection,
  setShowCandidateModal,
  setShowInternalModal,
  setMobileMenuOpen,
  isAuthenticated = false,
  user,
  onLogout
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200 py-4' : 'bg-black/20 backdrop-blur-sm py-6'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => handleNavigation('home')}
            >
              <span className="text-3xl font-black tracking-tight transition-all duration-300 group-hover:scale-105">
                <span className={`${scrolled || activeSection !== 'home' ? 'text-red-600' : 'text-red-400'} transition-colors duration-300`}>/</span>
                <span className={`${scrolled || activeSection !== 'home' ? 'text-black' : 'text-white'} transition-colors duration-300`}>vermeg</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              {navigationConfig.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`relative text-sm font-semibold transition-all duration-300 px-4 py-2 rounded-full ${
                    activeSection === item.id
                      ? scrolled || activeSection !== 'home'
                        ? 'text-white bg-red-600 shadow-lg'
                        : 'text-black bg-white shadow-lg'
                      : scrolled || activeSection !== 'home'
                        ? 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                        : 'text-white hover:text-red-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${scrolled || activeSection !== 'home' ? 'text-gray-700' : 'text-white'}`}>
                  Welcome, {user.name}
                </span>
                <Button
                  onClick={onLogout}
                  variant="outlined"
                  size="small"
                  className={scrolled || activeSection !== 'home'
                    ? 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                    : 'text-white border-2 border-white hover:bg-white hover:text-black'}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => setShowCandidateModal(true)}
                  variant="outlined"
                  size="small"
                  className={scrolled || activeSection !== 'home'
                    ? 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 shadow-sm'
                    : 'bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50'}
                >
                  Candidate Portal
                </Button>
                <Button
                  onClick={() => setShowInternalModal(true)}
                  variant="contained"
                  size="small"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Employee Login
                </Button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-3 rounded-full transition-all duration-300 ${
                scrolled || activeSection !== 'home'
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;