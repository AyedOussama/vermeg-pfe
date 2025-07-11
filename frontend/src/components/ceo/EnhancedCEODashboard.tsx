import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  FileText,
  Award,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Eye,
  ArrowRight,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Globe,
  Database,
  Lock
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SAMPLE_JOBS, SAMPLE_APPLICATIONS, SAMPLE_CANDIDATES, SAMPLE_PROJECT_LEADERS, SAMPLE_HR_MANAGERS, CEO_USER } from '@/data/dummyData';

interface ExecutiveMetrics {
  totalUsers: number;
  activeJobs: number;
  pendingApprovals: number;
  totalApplications: number;
  hireRate: number;
  avgTimeToHire: number;
  platformRevenue: number;
  systemUptime: number;
  userGrowth: number;
  jobCompletionRate: number;
}

interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'user' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface RecentActivity {
  id: string;
  type: 'approval' | 'user_action' | 'system_event' | 'security_event';
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

const EnhancedCEODashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    totalUsers: 0,
    activeJobs: 0,
    pendingApprovals: 0,
    totalApplications: 0,
    hireRate: 0,
    avgTimeToHire: 0,
    platformRevenue: 0,
    systemUptime: 0,
    userGrowth: 0,
    jobCompletionRate: 0
  });
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate metrics from dummy data
      const totalUsers = SAMPLE_CANDIDATES.length + SAMPLE_PROJECT_LEADERS.length + SAMPLE_HR_MANAGERS.length + 1; // +1 for CEO
      const activeJobs = SAMPLE_JOBS.filter(job => job.status === 'Published').length;
      const pendingApprovals = SAMPLE_JOBS.filter(job => job.status === 'CEO_Approval').length;
      const totalApplications = SAMPLE_APPLICATIONS.length;
      const hiredApplications = SAMPLE_APPLICATIONS.filter(app => app.status === 'Accepted').length;
      const hireRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;

      setMetrics({
        totalUsers,
        activeJobs,
        pendingApprovals,
        totalApplications,
        hireRate: Math.round(hireRate),
        avgTimeToHire: 12.5,
        platformRevenue: 2450000,
        systemUptime: 99.8,
        userGrowth: 15.3,
        jobCompletionRate: 87.2
      });

      // Mock system alerts
      setSystemAlerts([
        {
          id: 'alert-1',
          type: 'security',
          severity: 'medium',
          title: 'Multiple Failed Login Attempts',
          message: 'Detected 5 failed login attempts from IP 192.168.1.100',
          timestamp: '2024-06-22T10:30:00Z',
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'performance',
          severity: 'low',
          title: 'Database Query Performance',
          message: 'Average query response time increased by 15%',
          timestamp: '2024-06-22T09:15:00Z',
          resolved: false
        },
        {
          id: 'alert-3',
          type: 'user',
          severity: 'high',
          title: 'Unusual User Activity',
          message: 'HR Manager attempted to access restricted admin functions',
          timestamp: '2024-06-22T08:45:00Z',
          resolved: true
        }
      ]);

      // Mock recent activities
      setRecentActivities([
        {
          id: 'activity-1',
          type: 'approval',
          user: 'CEO',
          action: 'Approved job posting "Senior Frontend Developer"',
          timestamp: '2024-06-22T11:00:00Z',
          details: 'Job moved to published status'
        },
        {
          id: 'activity-2',
          type: 'user_action',
          user: 'Emma Wilson (HR)',
          action: 'Enhanced job posting with behavioral assessment',
          timestamp: '2024-06-22T10:45:00Z',
          details: 'Added 5 HR questions to Data Science Manager position'
        },
        {
          id: 'activity-3',
          type: 'system_event',
          user: 'System',
          action: 'Automated backup completed successfully',
          timestamp: '2024-06-22T10:30:00Z',
          details: 'Database backup size: 2.3GB'
        },
        {
          id: 'activity-4',
          type: 'user_action',
          user: 'John Smith (Project Leader)',
          action: 'Created new job posting "Full Stack Developer"',
          timestamp: '2024-06-22T10:15:00Z',
          details: 'Job submitted for HR enhancement'
        },
        {
          id: 'activity-5',
          type: 'security_event',
          user: 'Security System',
          action: 'Password policy updated',
          timestamp: '2024-06-22T09:30:00Z',
          details: 'Minimum password length increased to 12 characters'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Activity className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'user_action': return <Users className="w-4 h-4 text-blue-600" />;
      case 'system_event': return <Settings className="w-4 h-4 text-gray-600" />;
      case 'security_event': return <Shield className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Critical Alerts */}
      {systemAlerts.filter(alert => !alert.resolved && (alert.severity === 'critical' || alert.severity === 'high')).length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Critical Alerts Require Attention</h3>
          </div>
          <div className="space-y-2">
            {systemAlerts
              .filter(alert => !alert.resolved && (alert.severity === 'critical' || alert.severity === 'high'))
              .slice(0, 2)
              .map((alert) => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded border border-red-200">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-medium text-red-900">{alert.title}</p>
                      <p className="text-sm text-red-700">{alert.message}</p>
                    </div>
                  </div>
                  <Button variant="outlined" size="small" className="text-red-600 border-red-300">
                    Resolve
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Executive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Platform Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">+{metrics.userGrowth}% growth</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Job Postings</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeJobs}</p>
              <p className="text-xs text-blue-600 mt-1">{metrics.jobCompletionRate}% completion rate</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingApprovals}</p>
              <p className="text-xs text-orange-600 mt-1">Require your attention</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hire Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.hireRate}%</p>
              <p className="text-xs text-green-600 mt-1">Above industry average</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(metrics.platformRevenue)}</p>
          <p className="text-xs text-green-600 mt-1">+18% from last quarter</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">System Uptime</span>
            <Globe className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.systemUptime}%</p>
          <p className="text-xs text-blue-600 mt-1">Excellent performance</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Avg. Time to Hire</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.avgTimeToHire} days</p>
          <p className="text-xs text-purple-600 mt-1">-2 days improvement</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Applications</span>
            <FileText className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-xl font-bold text-gray-900">{metrics.totalApplications}</p>
          <p className="text-xs text-orange-600 mt-1">+25% this month</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Executive Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outlined"
            className="flex items-center justify-center gap-2 h-16 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
            asChild
          >
            <Link to="/ceo/jobs">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <span>Jobs Management</span>
            </Link>
          </Button>

          <Button
            variant="outlined"
            className="flex items-center justify-center gap-2 h-16 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            asChild
          >
            <Link to="/ceo/users">
              <Users className="w-5 h-5 text-blue-600" />
              <span>User Management</span>
            </Link>
          </Button>

          <Button
            variant="outlined"
            className="flex items-center justify-center gap-2 h-16 border-green-200 hover:border-green-300 hover:bg-green-50"
            asChild
          >
            <Link to="/ceo/analytics">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <span>System Analytics</span>
            </Link>
          </Button>

          <Button
            variant="outlined"
            className="flex items-center justify-center gap-2 h-16 border-red-200 hover:border-red-300 hover:bg-red-50"
            asChild
          >
            <Link to="/ceo/security">
              <Shield className="w-5 h-5 text-red-600" />
              <span>Security Center</span>
            </Link>
          </Button>
        </div>
      </Card>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activities</h2>
                <Button variant="ghost" size="small" asChild>
                  <Link to="/ceo/audit">
                    View All Logs
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* System Alerts & Status */}
        <div className="space-y-6">
          {/* System Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Platform Status</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Database</span>
                </div>
                <Badge variant="success">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">API Response</span>
                </div>
                <Badge variant="warning">Slow</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Security</span>
                </div>
                <Badge variant="success">Secure</Badge>
              </div>
            </div>

            <Button variant="outlined" size="small" className="w-full mt-4" asChild>
              <Link to="/ceo/system-status">
                <Activity className="w-4 h-4 mr-2" />
                View Detailed Status
              </Link>
            </Button>
          </Card>

          {/* Active Alerts */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <Badge variant="outline">
                {systemAlerts.filter(alert => !alert.resolved).length} active
              </Badge>
            </div>

            <div className="space-y-3">
              {systemAlerts.filter(alert => !alert.resolved).slice(0, 3).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <p className="text-xs mt-1">{alert.message}</p>
                      <p className="text-xs mt-1 opacity-75">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outlined" size="small" className="w-full mt-4" asChild>
              <Link to="/ceo/alerts">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Manage All Alerts
              </Link>
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jobs This Month</span>
                <span className="font-medium text-gray-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-medium text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Successful Hires</span>
                <span className="font-medium text-gray-900">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Platform Efficiency</span>
                <span className="font-medium text-green-600">94.2%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCEODashboard;
