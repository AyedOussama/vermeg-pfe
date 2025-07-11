import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Briefcase,
  Clock
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'lead';
  location: string;
  joinedDate: string;
  profilePicture?: string;
  skills: string[];
  currentProjects: number;
  completedProjects: number;
  performanceRating: number;
  status: 'active' | 'on_leave' | 'remote';
  lastActive: string;
  reportsTo?: string;
  directReports: string[];
}

interface TeamStats {
  totalMembers: number;
  activeProjects: number;
  avgPerformance: number;
  teamCapacity: number;
}

const TeamManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock team data
  const teamMembers: TeamMember[] = [
    {
      id: 'tm-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@vermeg.com',
      phone: '+216 98 123 456',
      role: 'Frontend Developer',
      department: 'Engineering',
      level: 'senior',
      location: 'Tunis, Tunisia',
      joinedDate: '2022-03-15',
      profilePicture: '/images/team-member-1.jpg',
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
      currentProjects: 2,
      completedProjects: 12,
      performanceRating: 4.5,
      status: 'active',
      lastActive: '2024-06-21T10:30:00Z',
      directReports: []
    },
    {
      id: 'tm-002',
      name: 'Ahmed Ben Ali',
      email: 'ahmed.benali@vermeg.com',
      phone: '+216 97 234 567',
      role: 'Backend Developer',
      department: 'Engineering',
      level: 'mid',
      location: 'Sfax, Tunisia',
      joinedDate: '2023-01-20',
      skills: ['Node.js', 'Python', 'MongoDB', 'AWS'],
      currentProjects: 1,
      completedProjects: 8,
      performanceRating: 4.2,
      status: 'remote',
      lastActive: '2024-06-21T09:15:00Z',
      directReports: []
    },
    {
      id: 'tm-003',
      name: 'Fatima Zahra',
      email: 'fatima.zahra@vermeg.com',
      phone: '+216 99 345 678',
      role: 'DevOps Engineer',
      department: 'Engineering',
      level: 'senior',
      location: 'Tunis, Tunisia',
      joinedDate: '2021-09-10',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      currentProjects: 3,
      completedProjects: 18,
      performanceRating: 4.8,
      status: 'active',
      lastActive: '2024-06-21T11:45:00Z',
      directReports: ['tm-002']
    },
    {
      id: 'tm-004',
      name: 'Mohamed Slim',
      email: 'mohamed.slim@vermeg.com',
      phone: '+216 96 456 789',
      role: 'Junior Developer',
      department: 'Engineering',
      level: 'junior',
      location: 'Tunis, Tunisia',
      joinedDate: '2024-02-01',
      skills: ['JavaScript', 'React', 'HTML', 'CSS'],
      currentProjects: 1,
      completedProjects: 3,
      performanceRating: 3.8,
      status: 'active',
      lastActive: '2024-06-21T08:30:00Z',
      directReports: []
    }
  ];

  // Calculate team stats
  const teamStats: TeamStats = useMemo(() => {
    return {
      totalMembers: teamMembers.length,
      activeProjects: teamMembers.reduce((sum, member) => sum + member.currentProjects, 0),
      avgPerformance: teamMembers.reduce((sum, member) => sum + member.performanceRating, 0) / teamMembers.length,
      teamCapacity: teamMembers.filter(member => member.status === 'active').length
    };
  }, [teamMembers]);

  // Filter and sort team members
  const filteredMembers = useMemo(() => {
    let filtered = teamMembers;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term) ||
        member.skills.some(skill => skill.toLowerCase().includes(term))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role.toLowerCase().includes(roleFilter.toLowerCase()));
    }

    // Level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(member => member.level === levelFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'performance':
          return b.performanceRating - a.performanceRating;
        case 'projects':
          return b.currentProjects - a.currentProjects;
        case 'joined':
          return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [teamMembers, searchTerm, roleFilter, levelFilter, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'remote': return 'bg-blue-100 text-blue-800';
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

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    if (rating >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActive = (dateString: string) => {
    const now = new Date();
    const lastActive = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'developer', label: 'Developer' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Manager' }
  ];

  const levelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'remote', label: 'Remote' },
    { value: 'on_leave', label: 'On Leave' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'performance', label: 'Performance' },
    { value: 'projects', label: 'Current Projects' },
    { value: 'joined', label: 'Date Joined' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and track performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outlined" size="small">
            <Filter className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.activeProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.avgPerformance.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Team Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.teamCapacity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            label="Role"
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          <Select
            label="Level"
            options={levelOptions}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Select
            label="Sort by"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {filteredMembers.length > 0 ? (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Profile Picture */}
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                        {member.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={`text-xs ${getLevelColor(member.level)}`}>
                        {member.level}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-2">{member.role}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{member.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatDate(member.joinedDate)}</span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {member.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" size="small" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skills.length > 4 && (
                        <Badge variant="outline" size="small" className="text-xs">
                          +{member.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance & Stats */}
                <div className="text-right">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Performance</p>
                      <p className={`text-lg font-bold ${getPerformanceColor(member.performanceRating)}`}>
                        {member.performanceRating.toFixed(1)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Current</p>
                      <p className="text-lg font-bold text-gray-900">
                        {member.currentProjects}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Completed</p>
                      <p className="text-lg font-bold text-gray-900">
                        {member.completedProjects}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Last active: {formatLastActive(member.lastActive)}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outlined" size="small">
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button variant="outlined" size="small">
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                    <Button variant="outlined" size="small">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="outlined" size="small">
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || roleFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all'
                ? "No team members match your current filters"
                : "You haven't added any team members yet"
              }
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Your First Team Member
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
