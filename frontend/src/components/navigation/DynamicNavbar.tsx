import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, User, LogOut, MessageSquare } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_THEMES } from '@/data/dummyData';
import {
  coreNavigationConfig,
  roleNavigationConfig,
  avatarMenuConfig,
  publicNavigationConfig
} from '@/types/navigation';
import { getUserPrimaryRole } from '@/utils/authRedirect';

interface DynamicNavbarProps {
  className?: string;
}

const DynamicNavbar: React.FC<DynamicNavbarProps> = ({ className = '' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }

      // Close navigation dropdowns when clicking outside
      if (dropdownOpen) {
        const dropdownRef = dropdownRefs.current[dropdownOpen];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setDropdownOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Get navigation items based on user role
  const getNavigationItems = (forMobile = false) => {
    const coreItems = coreNavigationConfig;

    if (!isAuthenticated || !user) {
      return coreItems;
    }

    const primaryRole = getUserPrimaryRole(user);
    const roleItems = primaryRole ? roleNavigationConfig[primaryRole] || [] : [];

    // For RH users, filter out the messages item from desktop nav as it will be shown as an icon
    if (primaryRole === 'RH' && !forMobile) {
      const filteredRoleItems = roleItems.filter(item => item.id !== 'messages');
      return [...coreItems, ...filteredRoleItems];
    }

    return [...coreItems, ...roleItems];
  };

  // Get avatar menu items based on user role
  const getAvatarMenuItems = () => {
    if (!isAuthenticated || !user) return [];
    const primaryRole = getUserPrimaryRole(user);
    return primaryRole ? avatarMenuConfig[primaryRole] || [] : [];
  };

  // Get role-based notifications route
  const getNotificationsRoute = () => {
    if (!isAuthenticated || !user) return '/';
    const primaryRole = getUserPrimaryRole(user);

    switch (primaryRole) {
      case 'CANDIDATE':
        return '/candidate/notifications';
      case 'RH':
        return '/rh/notifications';
      case 'CEO':
        return '/ceo/notifications';
      case 'PROJECT_LEADER':
        return '/project-leader/notifications';
      default:
        return '/';
    }
  };

  const handleLogout = () => {
    logout();
    setAvatarMenuOpen(false);
    navigate('/');
  };

  // Handle section scrolling
  const handleSectionClick = (e: React.MouseEvent, href: string, isSection?: boolean) => {
    if (isSection && href.includes('#')) {
      e.preventDefault();
      const sectionId = href.split('#')[1];

      // First navigate to home page if not already there
      if (location.pathname !== '/') {
        navigate(href);
      } else {
        // Already on home page, just scroll
        const element = document.getElementById(sectionId);
        if (element) {
          // Add offset for fixed navbar
          const navbarHeight = 80; // Approximate navbar height
          const elementPosition = element.offsetTop - navbarHeight;

          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }
      setMobileMenuOpen(false);
      setAvatarMenuOpen(false);
    }
  };

  const isHomePage = location.pathname === '/';
  const navbarBg = scrolled || !isHomePage ? 'bg-white shadow-lg' : 'bg-transparent';
  const textColor = scrolled || !isHomePage ? 'text-gray-900' : 'text-white';
  const logoColor = scrolled || !isHomePage ? 'text-red-600' : 'text-red-400';

  // Get role-based theme colors
  const getRoleTheme = () => {
    const primaryRole = getUserPrimaryRole(user);
    if (!primaryRole) return ROLE_THEMES.CANDIDATE;
    return ROLE_THEMES[primaryRole as keyof typeof ROLE_THEMES] || ROLE_THEMES.CANDIDATE;
  };

  const roleTheme = getRoleTheme();

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${navbarBg} py-4 ${className}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold tracking-tight">
                <span className={logoColor}>/</span>
                <span className={textColor}>vermeg</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
            {getNavigationItems(false).map(item => (
              item.hasDropdown ? (
                <div
                  key={item.id}
                  className="relative"
                  ref={(el) => { dropdownRefs.current[item.id] = el; }}
                >
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
                    className={`flex items-center text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md cursor-pointer ${
                      dropdownOpen === item.id || (item.children && item.children.some(child => location.pathname === child.href))
                        ? `${scrolled || !isHomePage ? 'text-red-600 bg-red-50' : 'text-white bg-white/10'}`
                        : `${textColor} hover:text-red-600 hover:bg-gray-50`
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      dropdownOpen === item.id ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {dropdownOpen === item.id && item.children && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {item.children.map(child => (
                        <Link
                          key={child.id}
                          to={child.href || '#'}
                          className={`flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                            location.pathname === child.href
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                          }`}
                          onClick={() => setDropdownOpen(null)}
                        >
                          <span className="mr-3">{child.icon}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : item.isSection ? (
                <a
                  key={item.id}
                  href={item.href || '#'}
                  onClick={(e) => handleSectionClick(e, item.href || '#', item.isSection)}
                  className={`text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md cursor-pointer ${
                    location.pathname === item.href
                      ? `${scrolled || !isHomePage ? 'text-red-600 bg-red-50' : 'text-white bg-white/10'}`
                      : `${textColor} hover:text-red-600 hover:bg-gray-50`
                  }`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.href || '#'}
                  className={`text-sm font-medium transition-all duration-300 px-3 py-2 rounded-md ${
                    location.pathname === item.href
                      ? `${scrolled || !isHomePage ? 'text-red-600 bg-red-50' : 'text-white bg-white/10'}`
                      : `${textColor} hover:text-red-600 hover:bg-gray-50`
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      scrolled || !isHomePage 
                        ? 'text-gray-600 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">New application received</p>
                          <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">Job posting approved</p>
                          <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900">Interview scheduled</p>
                          <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          to={getNotificationsRoute()}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages Icon for RH Users */}
                {getUserPrimaryRole(user) === 'RH' && (
                  <Link
                    to="/rh/messages"
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      scrolled || !isHomePage
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                    } ${location.pathname === '/rh/messages' ? 'bg-red-50 text-red-600' : ''}`}
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {/* Optional: Add unread message badge */}
                    {/* <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      2
                    </span> */}
                  </Link>
                )}

                {/* User Avatar Menu */}
                <div className="relative" ref={avatarMenuRef}>
                  <button
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-full transition-colors duration-200 ${
                      scrolled || !isHomePage 
                        ? 'text-gray-600 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      {user.profile?.profilePicture ? (
                        <img
                          src={user.profile.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: roleTheme.primary }}
                        >
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Avatar Dropdown Menu */}
                  {avatarMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.firstName || ''} {user.lastName || ''}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p
                          className="text-xs font-medium mt-1"
                          style={{ color: roleTheme.primary }}
                        >
                          {getUserPrimaryRole(user) || 'User'}
                        </p>
                      </div>
                      
                      {getAvatarMenuItems().map(item => (
                        <Link
                          key={item.id}
                          to={item.href || '#'}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setAvatarMenuOpen(false)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                      
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Public Authentication Buttons */
              <div className="flex items-center space-x-3">
                {publicNavigationConfig.map(item => (
                  <Link key={item.id} to={item.href || '#'}>
                    <Button
                      variant={item.id === 'sign-in' ? 'outlined' : 'contained'}
                      size="small"
                      className={
                        item.id === 'sign-in'
                          ? scrolled || !isHomePage
                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            : 'border-white text-white hover:bg-white/10'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold'
                      }
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-colors duration-200 ${
                scrolled || !isHomePage 
                  ? 'text-gray-600 hover:bg-gray-100' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-2">
              {getNavigationItems(true).map(item => (
                item.hasDropdown ? (
                  <div key={item.id} className="space-y-1">
                    <div className="px-3 py-2 text-base font-medium text-gray-900 bg-gray-100 rounded-md">
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </div>
                    {item.children && (
                      <div className="ml-4 space-y-1">
                        {item.children.map(child => (
                          <Link
                            key={child.id}
                            to={child.href || '#'}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              location.pathname === child.href
                                ? 'text-red-600 bg-red-50'
                                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="mr-3">{child.icon}</span>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.isSection ? (
                  <a
                    key={item.id}
                    href={item.href || '#'}
                    onClick={(e) => handleSectionClick(e, item.href || '#', item.isSection)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 cursor-pointer ${
                      location.pathname === item.href
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.id}
                    to={item.href || '#'}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      location.pathname === item.href
                        ? 'text-red-600 bg-red-50'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              ))}

              {/* Authentication Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated && user ? (
                  /* Authenticated User Mobile Menu */
                  <>
                    <div className="px-3 py-3 bg-gray-50 rounded-lg mb-3">
                      <p className="text-sm font-medium text-gray-900">{user.firstName || ''} {user.lastName || ''}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p
                        className="text-xs font-medium mt-1"
                        style={{ color: roleTheme.primary }}
                      >
                        {getUserPrimaryRole(user) || 'User'}
                      </p>
                    </div>

                    {/* Avatar Menu Items for Mobile */}
                    {getAvatarMenuItems().map(item => (
                      <Link
                        key={item.id}
                        to={item.href || '#'}
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full mt-3 px-3 py-2 bg-red-600 text-white rounded-md text-base font-medium hover:bg-red-700 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </>
                ) : (
                  /* Public Authentication Buttons */
                  <div className="space-y-2">
                    {publicNavigationConfig.map(item => (
                      <Link
                        key={item.id}
                        to={item.href || '#'}
                        className={
                          item.id === 'sign-up'
                            ? "block px-3 py-2 rounded-md text-base font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all duration-300"
                            : "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                        }
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DynamicNavbar;
