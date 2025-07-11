import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserX,
  Shield,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Briefcase,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Lock,
  Unlock,
  Settings,
  Trash2,
  Clock,
  User
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { SAMPLE_CANDIDATES, SAMPLE_PROJECT_LEADERS, SAMPLE_HR_MANAGERS, CEO_USER } from '@/data/dummyData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'project_leader' | 'hr_manager' | 'ceo';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  avatar?: string;
  phone?: string;
  location?: string;
  joinDate: string;
  lastLogin?: string;
  permissions: string[];
  department?: string;
  jobTitle?: string;
  activityScore: number;
  securityLevel: 'low' | 'medium' | 'high';
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

const UserManagementInterface: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    newUsersThisMonth: 0,
    usersByRole: {}
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'status' | 'joinDate' | 'lastLogin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddRHForm, setShowAddRHForm] = useState(false);
  const [showAddProjectLeaderForm, setShowAddProjectLeaderForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'candidates' | 'rh' | 'project_leaders'>('candidates');

  // Error states for form validation
  const [rhFormErrors, setRhFormErrors] = useState<string[]>([]);
  const [projectLeaderFormErrors, setProjectLeaderFormErrors] = useState<string[]>([]);
  const [isSubmittingRH, setIsSubmittingRH] = useState(false);
  const [isSubmittingProjectLeader, setIsSubmittingProjectLeader] = useState(false);

  // Form data states
  const [rhFormData, setRhFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    jobTitle: '',
    officeLocation: '',
    yearsInHR: '',
    specialization: '',
    password: '',
    confirmPassword: ''
  });

  const [projectLeaderFormData, setProjectLeaderFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    jobTitle: '',
    officeLocation: '',
    yearsInManagement: '',
    expectedTeamSize: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  // Validation functions
  const validateRHForm = (data: typeof rhFormData): string[] => {
    const errors: string[] = [];

    if (!data.firstName.trim()) errors.push('First name is required');
    if (!data.lastName.trim()) errors.push('Last name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.email.includes('@') || !data.email.includes('.')) errors.push('Please enter a valid email address');
    if (!data.phone.trim()) errors.push('Phone number is required');
    if (!data.employeeId.trim()) errors.push('Employee ID is required');
    if (!data.department.trim()) errors.push('Department is required');
    if (!data.jobTitle.trim()) errors.push('Job title is required');
    if (!data.officeLocation.trim()) errors.push('Office location is required');
    if (!data.password.trim()) errors.push('Password is required');
    if (data.password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!data.confirmPassword.trim()) errors.push('Password confirmation is required');
    if (data.password !== data.confirmPassword) errors.push('Passwords do not match');

    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) errors.push('Email address is already in use');

    // Check if employee ID already exists
    const employeeIdExists = users.some(user => user.id.includes(data.employeeId));
    if (employeeIdExists) errors.push('Employee ID is already in use');

    return errors;
  };

  const validateProjectLeaderForm = (data: typeof projectLeaderFormData): string[] => {
    const errors: string[] = [];

    if (!data.firstName.trim()) errors.push('First name is required');
    if (!data.lastName.trim()) errors.push('Last name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.email.includes('@') || !data.email.includes('.')) errors.push('Please enter a valid email address');
    if (!data.phone.trim()) errors.push('Phone number is required');
    if (!data.employeeId.trim()) errors.push('Employee ID is required');
    if (!data.department.trim()) errors.push('Department is required');
    if (!data.jobTitle.trim()) errors.push('Job title is required');
    if (!data.officeLocation.trim()) errors.push('Office location is required');
    if (!data.password.trim()) errors.push('Password is required');
    if (data.password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!data.confirmPassword.trim()) errors.push('Password confirmation is required');
    if (data.password !== data.confirmPassword) errors.push('Passwords do not match');

    // Check if email already exists
    const emailExists = users.some(user => user.email.toLowerCase() === data.email.toLowerCase());
    if (emailExists) errors.push('Email address is already in use');

    // Check if employee ID already exists
    const employeeIdExists = users.some(user => user.id.includes(data.employeeId));
    if (employeeIdExists) errors.push('Employee ID is already in use');

    return errors;
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Combine all user data
      const allUsers: User[] = [
        // CEO
        {
          id: 'ceo-1',
          name: 'CEO Admin',
          email: 'ceo@vermeg.com',
          role: 'ceo',
          status: 'active',
          avatar: CEO_USER.avatar,
          phone: '+352-26-12-34-50',
          location: 'Luxembourg',
          joinDate: '2023-01-01',
          lastLogin: new Date().toISOString(),
          permissions: ['all'],
          department: 'Executive',
          jobTitle: 'Chief Executive Officer',
          activityScore: 100,
          securityLevel: 'high'
        },
        // Project Leaders
        ...SAMPLE_PROJECT_LEADERS.map((pl, index) => ({
          id: pl.id,
          name: pl.name,
          email: pl.email,
          role: 'project_leader' as const,
          status: ['active', 'active', 'inactive', 'active'][index % 4] as any,
          avatar: pl.avatar,
          phone: pl.phone,
          location: pl.location || 'Luxembourg',
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['create_jobs', 'manage_applications', 'view_analytics'],
          department: pl.department,
          jobTitle: pl.jobTitle,
          activityScore: 70 + Math.floor(Math.random() * 30),
          securityLevel: 'medium' as const
        })),
        // HR Managers
        ...SAMPLE_HR_MANAGERS.map((hr, index) => ({
          id: hr.id,
          name: `${hr.firstName} ${hr.lastName}`,
          email: hr.email,
          role: 'hr_manager' as const,
          status: ['active', 'active', 'pending', 'active'][index % 4] as any,
          avatar: hr.avatar,
          phone: hr.phone,
          location: hr.officeLocation || 'Luxembourg',
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['enhance_jobs', 'create_assessments', 'view_candidates'],
          department: hr.hrDivision,
          jobTitle: 'HR Manager',
          activityScore: 60 + Math.floor(Math.random() * 40),
          securityLevel: 'medium' as const
        })),
        // Candidates (sample)
        ...SAMPLE_CANDIDATES.slice(0, 10).map((candidate, index) => ({
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          role: 'candidate' as const,
          status: ['active', 'active', 'suspended', 'active', 'pending'][index % 5] as any,
          avatar: candidate.avatar,
          phone: candidate.phone,
          location: candidate.location || 'Luxembourg',
          joinDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          permissions: ['apply_jobs', 'view_applications', 'take_assessments'],
          department: 'N/A',
          jobTitle: candidate.currentPosition || 'Job Seeker',
          activityScore: 30 + Math.floor(Math.random() * 70),
          securityLevel: 'low' as const
        }))
      ];

      setUsers(allUsers);

      // Calculate stats
      const totalUsers = allUsers.length;
      const activeUsers = allUsers.filter(u => u.status === 'active').length;
      const pendingUsers = allUsers.filter(u => u.status === 'pending').length;
      const suspendedUsers = allUsers.filter(u => u.status === 'suspended').length;
      const newUsersThisMonth = allUsers.filter(u => {
        const joinDate = new Date(u.joinDate);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return joinDate > thirtyDaysAgo;
      }).length;

      const usersByRole = allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      setStats({
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        newUsersThisMonth,
        usersByRole
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'joinDate' || sortBy === 'lastLogin') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'suspend' | 'delete') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (action === 'delete') {
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: action === 'activate' ? 'active' : 'suspended' }
            : u
        ));
      }
      
      console.log(`User ${userId} ${action}d`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'suspend' | 'delete') => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === 'delete') {
        setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
      } else {
        setUsers(prev => prev.map(u =>
          selectedUsers.includes(u.id)
            ? { ...u, status: action === 'activate' ? 'active' : 'suspended' }
            : u
        ));
      }

      setSelectedUsers([]);
      console.log(`Bulk ${action} completed for ${selectedUsers.length} users`);
    } catch (error) {
      console.error(`Error in bulk ${action}:`, error);
    }
  };

  // Handle RH form submission
  const handleRHFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setRhFormErrors([]);
    setIsSubmittingRH(true);

    console.log('Form submitted with data:', rhFormData);

    // Validate form data
    const validationErrors = validateRHForm(rhFormData);
    if (validationErrors.length > 0) {
      setRhFormErrors(validationErrors);
      setIsSubmittingRH(false);
      return;
    }

    try {
      console.log('Creating new RH user...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new RH user
      const newRHUser: User = {
        id: `rh-${Date.now()}`,
        name: `${rhFormData.firstName} ${rhFormData.lastName}`,
        email: rhFormData.email,
        role: 'hr_manager',
        status: 'active',
        phone: rhFormData.phone,
        location: rhFormData.officeLocation,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        permissions: ['enhance_jobs', 'create_assessments', 'view_candidates'],
        department: rhFormData.department,
        jobTitle: rhFormData.jobTitle,
        activityScore: 85,
        securityLevel: 'medium'
      };

      console.log('New RH user object:', newRHUser);

      // Add to users list
      setUsers(prev => {
        const updatedUsers = [...prev, newRHUser];
        console.log('Updated users list:', updatedUsers);
        return updatedUsers;
      });

      // Reset form and close modal
      setRhFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        officeLocation: '',
        yearsInHR: '',
        specialization: '',
        password: '',
        confirmPassword: ''
      });
      setRhFormErrors([]);
      setShowAddRHForm(false);

      // Switch to RH tab to show the new user
      setActiveCategory('rh');

      console.log('RH user created successfully and tab switched to RH');
    } catch (error) {
      console.error('Error creating RH user:', error);
      setRhFormErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsSubmittingRH(false);
    }
  };

  // Handle Project Leader form submission
  const handleProjectLeaderFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setProjectLeaderFormErrors([]);
    setIsSubmittingProjectLeader(true);

    console.log('Project Leader form submitted with data:', projectLeaderFormData);

    // Validate form data
    const validationErrors = validateProjectLeaderForm(projectLeaderFormData);
    if (validationErrors.length > 0) {
      setProjectLeaderFormErrors(validationErrors);
      setIsSubmittingProjectLeader(false);
      return;
    }

    try {
      console.log('Creating new Project Leader user...');

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new Project Leader user
      const newProjectLeaderUser: User = {
        id: `pl-${Date.now()}`,
        name: `${projectLeaderFormData.firstName} ${projectLeaderFormData.lastName}`,
        email: projectLeaderFormData.email,
        role: 'project_leader',
        status: 'active',
        phone: projectLeaderFormData.phone,
        location: projectLeaderFormData.officeLocation,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        permissions: ['create_jobs', 'manage_applications', 'view_analytics'],
        department: projectLeaderFormData.department,
        jobTitle: projectLeaderFormData.jobTitle,
        activityScore: 80,
        securityLevel: 'medium'
      };

      console.log('New Project Leader user object:', newProjectLeaderUser);

      // Add to users list
      setUsers(prev => {
        const updatedUsers = [...prev, newProjectLeaderUser];
        console.log('Updated users list:', updatedUsers);
        return updatedUsers;
      });

      // Reset form and close modal
      setProjectLeaderFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        jobTitle: '',
        officeLocation: '',
        yearsInManagement: '',
        expectedTeamSize: '',
        password: '',
        confirmPassword: ''
      });
      setProjectLeaderFormErrors([]);
      setShowAddProjectLeaderForm(false);

      // Switch to Project Leaders tab to show the new user
      setActiveCategory('project_leaders');

      console.log('Project Leader user created successfully and tab switched to Project Leaders');
    } catch (error) {
      console.error('Error creating Project Leader user:', error);
      setProjectLeaderFormErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsSubmittingProjectLeader(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ceo': return <Crown className="w-4 h-4" />;
      case 'project_leader': return <Briefcase className="w-4 h-4" />;
      case 'hr_manager': return <UserCheck className="w-4 h-4" />;
      case 'candidate': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-purple-100 text-purple-800';
      case 'project_leader': return 'bg-green-100 text-green-800';
      case 'hr_manager': return 'bg-orange-100 text-orange-800';
      case 'candidate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  // Filter users by role
  const getUsersByRole = (role: string) => {
    return filteredUsers.filter(user => user.role === role);
  };

  // Render user table for specific role
  const renderUserTable = (role: string, title: string, headerBg: string, titleColor: string) => {
    const roleUsers = getUsersByRole(role);
    const roleSelectedUsers = selectedUsers.filter(id => roleUsers.some(u => u.id === id));

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                {roleUsers.length} users
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={roleSelectedUsers.length === roleUsers.length && roleUsers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers.filter(id => !roleUsers.some(u => u.id === id)), ...roleUsers.map(u => u.id)]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => !roleUsers.some(u => u.id === id)));
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  User Information
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Join Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {roleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                  <td className="px-6 py-5">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {user.avatar ? (
                          <img
                            className="h-12 w-12 rounded-xl object-cover shadow-sm"
                            src={user.avatar}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                            <Users className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.jobTitle && (
                          <div className="text-xs text-gray-400 mt-1">{user.jobTitle}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'suspended'
                        ? 'bg-red-100 text-red-800'
                        : user.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'suspended' && <XCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'pending' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-gray-900">{user.department}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-600">{formatDate(user.joinDate)}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-600">
                      {user.lastLogin ? formatTimeAgo(user.lastLogin) : (
                        <span className="text-gray-400 italic">Never</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                          title="Suspend User"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Activate User"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {roleUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {title.toLowerCase()} found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : `No ${title.toLowerCase()} have been added to the platform yet. They will appear here once registered.`
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                  <p className="text-gray-500 text-lg">
                    Manage all platform users, roles, and permissions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outlined"
                onClick={loadUserData}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>

              <Button
                variant="outlined"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-400 mt-1">All platform users</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Currently active</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Suspended</p>
                <p className="text-3xl font-bold text-red-600">{stats.suspendedUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Temporarily disabled</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">New This Month</p>
                <p className="text-3xl font-bold text-blue-600">{stats.newUsersThisMonth}</p>
                <p className="text-xs text-gray-400 mt-1">Recent additions</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Filter</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="ceo">CEO</option>
                  <option value="project_leader">Project Leaders</option>
                  <option value="hr_manager">RH Managers</option>
                  <option value="candidate">Candidates</option>
                </select>
              </div>

              <div className="min-w-[160px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-purple-900">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBulkAction('activate')}
                    className="text-green-600 border-green-300 hover:bg-green-50 transition-all duration-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBulkAction('suspend')}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 transition-all duration-200"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 border-red-300 hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Category Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveCategory('candidates')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeCategory === 'candidates'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Candidates</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeCategory === 'candidates'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {users.filter(u => u.role === 'candidate').length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('rh')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeCategory === 'rh'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/25'
                  : 'text-gray-600 hover:text-orange-700 hover:bg-orange-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>RH</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeCategory === 'rh'
                  ? 'bg-white/20 text-white'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {users.filter(u => u.role === 'hr_manager').length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('project_leaders')}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeCategory === 'project_leaders'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/25'
                  : 'text-gray-600 hover:text-green-700 hover:bg-green-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Project Leaders</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeCategory === 'project_leaders'
                  ? 'bg-white/20 text-white'
                  : 'bg-green-100 text-green-700'
              }`}>
                {users.filter(u => u.role === 'project_leader').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Enhanced Category Content */}
        <div className="space-y-8">
          {activeCategory === 'candidates' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Candidates</h3>
                      <p className="text-blue-100">Job seekers and applicants on the platform</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{users.filter(u => u.role === 'candidate').length}</div>
                    <div className="text-blue-100 text-sm">Total candidates</div>
                  </div>
                </div>
              </div>
              {renderUserTable('candidate', 'Candidates', 'bg-white border-gray-100', 'text-gray-800')}
            </div>
          )}

          {activeCategory === 'rh' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">RH Team</h3>
                      <p className="text-orange-100">Human resources managers and recruiters</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold">{users.filter(u => u.role === 'hr_manager').length}</div>
                      <div className="text-orange-100 text-sm">Total RH members</div>
                    </div>
                    <Button
                      variant="contained"
                      onClick={() => setShowAddRHForm(true)}
                      className="font-medium transform hover:scale-105 bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-800 hover:to-orange-900 text-white border-orange-700 hover:border-orange-800 transition-all duration-200 shadow-lg shadow-orange-700/30 hover:shadow-xl hover:shadow-orange-700/40"
                      sx={{
                        background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%) !important',
                        boxShadow: '0 10px 15px -3px rgba(194, 65, 12, 0.3), 0 4px 6px -2px rgba(194, 65, 12, 0.15) !important',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #9a3412 0%, #7c2d12 100%) !important',
                          boxShadow: '0 20px 25px -5px rgba(194, 65, 12, 0.4), 0 10px 10px -5px rgba(194, 65, 12, 0.2) !important',
                          transform: 'scale(1.05) !important'
                        }
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add RH
                    </Button>
                  </div>
                </div>
              </div>
              {renderUserTable('hr_manager', 'RH', 'bg-white border-gray-100', 'text-gray-800')}
            </div>
          )}

          {activeCategory === 'project_leaders' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Project Leaders</h3>
                      <p className="text-emerald-100">Team leaders and project managers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold">{users.filter(u => u.role === 'project_leader').length}</div>
                      <div className="text-green-100 text-sm">Total leaders</div>
                    </div>
                    <Button
                      variant="contained"
                      onClick={() => setShowAddProjectLeaderForm(true)}
                      className="font-medium transform hover:scale-105 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white border-green-700 hover:border-green-800 transition-all duration-200 shadow-lg shadow-green-700/30 hover:shadow-xl hover:shadow-green-700/40"
                      sx={{
                        background: 'linear-gradient(135deg, #166534 0%, #14532d 100%) !important',
                        boxShadow: '0 10px 15px -3px rgba(22, 101, 52, 0.3), 0 4px 6px -2px rgba(22, 101, 52, 0.15) !important',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #14532d 0%, #052e16 100%) !important',
                          boxShadow: '0 20px 25px -5px rgba(22, 101, 52, 0.4), 0 10px 10px -5px rgba(22, 101, 52, 0.2) !important',
                          transform: 'scale(1.05) !important'
                        }
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Project Leader
                    </Button>
                  </div>
                </div>
              </div>
              {renderUserTable('project_leader', 'Project Leaders', 'bg-white border-gray-100', 'text-gray-800')}
            </div>
          )}
        </div>

        {/* Enhanced User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="relative p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                      <p className="text-gray-500">Complete user information and settings</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start gap-8 mb-8">
                  <div className="flex-shrink-0">
                    {selectedUser.avatar ? (
                      <img
                        className="h-24 w-24 rounded-2xl object-cover shadow-lg"
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                        <Users className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedUser.name}</h3>
                    <p className="text-lg text-gray-600 mb-4">{selectedUser.jobTitle}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.role === 'candidate' ? 'bg-blue-100 text-blue-800' :
                        selectedUser.role === 'hr_manager' ? 'bg-orange-100 text-orange-800' :
                        selectedUser.role === 'project_leader' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getRoleIcon(selectedUser.role)}
                        <span className="ml-2 capitalize">{selectedUser.role.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedUser.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        selectedUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="capitalize">{selectedUser.status}</span>
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                        <Shield className="w-3 h-3 mr-1" />
                        {selectedUser.securityLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-600" />
                      Contact Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium text-gray-900">{selectedUser.email}</div>
                        </div>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Phone className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium text-gray-900">{selectedUser.phone}</div>
                          </div>
                        </div>
                      )}
                      {selectedUser.location && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Location</div>
                            <div className="font-medium text-gray-900">{selectedUser.location}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-gray-600" />
                      Account Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Join Date</div>
                          <div className="font-medium text-gray-900">{formatDate(selectedUser.joinDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-orange-700" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Activity Score</div>
                          <div className="font-medium text-gray-900">{selectedUser.activityScore}%</div>
                        </div>
                      </div>
                      {selectedUser.lastLogin && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Last Login</div>
                            <div className="font-medium text-gray-900">{formatTimeAgo(selectedUser.lastLogin)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-600" />
                    Permissions & Access
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedUser.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700">
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4">
                <Button
                  variant="outlined"
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200"
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Add RH Form Modal */}
        {showAddRHForm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
              {/* Modern Header */}
              <div className="relative bg-gradient-to-r from-orange-600 to-orange-700 p-8 rounded-t-3xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Add New RH User</h2>
                      <p className="text-orange-100 text-lg">Create a new human resources team member</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddRHForm(false)}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 space-y-8">
                {/* Error Display */}
                {rhFormErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                        <ul className="text-sm text-red-700 space-y-1">
                          {rhFormErrors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRHFormSubmit} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-500">Basic details about the RH team member</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                          type="text"
                          placeholder="Enter first name"
                          value={rhFormData.firstName}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          placeholder="Enter last name"
                          value={rhFormData.lastName}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                        <input
                          type="email"
                          placeholder="name@vermeg.com"
                          value={rhFormData.email}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="+352-26-12-34-56"
                          value={rhFormData.phone}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="bg-orange-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-200 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-orange-800" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                        <p className="text-sm text-gray-500">Work-related information and credentials</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                        <input
                          type="text"
                          placeholder="RH001"
                          value={rhFormData.employeeId}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Department *</label>
                        <input
                          type="text"
                          placeholder="Human Resources"
                          value={rhFormData.department}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                        <input
                          type="text"
                          placeholder="RH Manager"
                          value={rhFormData.jobTitle}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Office Location *</label>
                        <input
                          type="text"
                          placeholder="Luxembourg"
                          value={rhFormData.officeLocation}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-red-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                        <p className="text-sm text-gray-500">Set up login credentials for the new user</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Temporary Password *</label>
                        <input
                          type="password"
                          placeholder="Enter temporary password"
                          value={rhFormData.password}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={rhFormData.confirmPassword}
                          onChange={(e) => setRhFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                          <p className="text-sm text-yellow-700">The user will be required to change this password on their first login.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Footer with Submit Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        All fields marked with * are required
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowAddRHForm(false)}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                        disabled={isSubmittingRH}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingRH}
                        className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingRH ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Create RH User
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
          </div>
        </div>
      )}

        {/* Enhanced Add Project Leader Form Modal */}
        {showAddProjectLeaderForm && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
              {/* Modern Header */}
              <div className="relative bg-gradient-to-r from-green-600 to-green-700 p-8 rounded-t-3xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Add New Project Leader</h2>
                      <p className="text-green-100 text-lg">Create a new project management team member</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddProjectLeaderForm(false)}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 space-y-8">
                {/* Error Display */}
                {projectLeaderFormErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                        <ul className="text-sm text-red-700 space-y-1">
                          {projectLeaderFormErrors.map((error, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleProjectLeaderFormSubmit} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <User className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-sm text-gray-500">Basic details about the project leader</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                          type="text"
                          placeholder="Enter first name"
                          value={projectLeaderFormData.firstName}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          placeholder="Enter last name"
                          value={projectLeaderFormData.lastName}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                        <input
                          type="email"
                          placeholder="name@vermeg.com"
                          value={projectLeaderFormData.email}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="+352-26-12-34-56"
                          value={projectLeaderFormData.phone}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information Section */}
                  <div className="bg-green-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-green-800" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                        <p className="text-sm text-gray-500">Work-related information and management experience</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Employee ID *</label>
                        <input
                          type="text"
                          placeholder="PL001"
                          value={projectLeaderFormData.employeeId}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Department *</label>
                        <input
                          type="text"
                          placeholder="Project Management"
                          value={projectLeaderFormData.department}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Job Title *</label>
                        <input
                          type="text"
                          placeholder="Senior Project Leader"
                          value={projectLeaderFormData.jobTitle}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Office Location *</label>
                        <input
                          type="text"
                          placeholder="Luxembourg"
                          value={projectLeaderFormData.officeLocation}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, officeLocation: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Years in Management</label>
                        <input
                          type="number"
                          placeholder="5"
                          value={projectLeaderFormData.yearsInManagement}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, yearsInManagement: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Expected Team Size</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={projectLeaderFormData.expectedTeamSize}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, expectedTeamSize: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="bg-red-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                        <p className="text-sm text-gray-500">Set up login credentials for the new project leader</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Temporary Password *</label>
                        <input
                          type="password"
                          placeholder="Enter temporary password"
                          value={projectLeaderFormData.password}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={projectLeaderFormData.confirmPassword}
                          onChange={(e) => setProjectLeaderFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">Leadership Access</p>
                          <p className="text-sm text-blue-700">This user will have project management permissions and team oversight capabilities.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Footer with Submit Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        All fields marked with * are required
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setShowAddProjectLeaderForm(false)}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                        disabled={isSubmittingProjectLeader}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingProjectLeader}
                        className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingProjectLeader ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Create Project Leader
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserManagementInterface;
