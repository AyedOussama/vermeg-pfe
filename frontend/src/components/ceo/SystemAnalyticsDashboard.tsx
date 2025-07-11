import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Target,
  Activity,
  Globe,
  Database,
  Zap,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  ArrowRight,
  PieChart,
  LineChart,
  Award,
  CheckCircle,
  AlertTriangle,
  Star,
  UserCheck,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SAMPLE_JOBS, SAMPLE_APPLICATIONS, SAMPLE_CANDIDATES, SAMPLE_PROJECT_LEADERS, SAMPLE_HR_MANAGERS } from '@/data/dummyData';

// Color palette for charts
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#A855F7',
  pink: '#EC4899'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.info, COLORS.purple, COLORS.pink];

interface UsersByRoleData {
  role: string;
  count: number;
  percentage: number;
  color: string;
}

interface JobPostingsData {
  status: string;
  count: number;
  color: string;
}

interface AcceptedCandidatesData {
  month: string;
  accepted: number;
  total: number;
  rate: number;
}

interface AnalyticsMetrics {
  totalUsers: number;
  usersByRole: UsersByRoleData[];
  totalJobPostings: number;
  jobPostingsByStatus: JobPostingsData[];
  totalApplications: number;
  acceptedCandidates: number;
  acceptanceRate: number;
  monthlyAcceptanceData: AcceptedCandidatesData[];
}

const SystemAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    usersByRole: [],
    totalJobPostings: 0,
    jobPostingsByStatus: [],
    totalApplications: 0,
    acceptedCandidates: 0,
    acceptanceRate: 0,
    monthlyAcceptanceData: []
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate real metrics from dummy data
      const totalCandidates = SAMPLE_CANDIDATES.length;
      const totalProjectLeaders = SAMPLE_PROJECT_LEADERS.length;
      const totalHRManagers = SAMPLE_HR_MANAGERS.length;
      const totalCEOs = 1; // CEO user
      const totalUsers = totalCandidates + totalProjectLeaders + totalHRManagers + totalCEOs;

      // Users by role data
      const usersByRole: UsersByRoleData[] = [
        {
          role: 'Candidates',
          count: totalCandidates,
          percentage: Math.round((totalCandidates / totalUsers) * 100),
          color: COLORS.primary
        },
        {
          role: 'Project Leaders',
          count: totalProjectLeaders,
          percentage: Math.round((totalProjectLeaders / totalUsers) * 100),
          color: COLORS.success
        },
        {
          role: 'HR Managers',
          count: totalHRManagers,
          percentage: Math.round((totalHRManagers / totalUsers) * 100),
          color: COLORS.warning
        },
        {
          role: 'CEO',
          count: totalCEOs,
          percentage: Math.round((totalCEOs / totalUsers) * 100),
          color: COLORS.secondary
        }
      ];

      // Job postings by status
      const publishedJobs = SAMPLE_JOBS.filter(job => job.status === 'Published').length;
      const draftJobs = SAMPLE_JOBS.filter(job => job.status === 'Draft').length;
      const reviewJobs = SAMPLE_JOBS.filter(job => job.status === 'HR Review').length;
      const closedJobs = SAMPLE_JOBS.filter(job => job.status === 'Closed').length;

      const jobPostingsByStatus: JobPostingsData[] = [
        { status: 'Published', count: publishedJobs, color: COLORS.success },
        { status: 'Draft', count: draftJobs, color: COLORS.warning },
        { status: 'HR Review', count: reviewJobs, color: COLORS.info },
        { status: 'Closed', count: closedJobs, color: COLORS.danger }
      ];

      // Applications and acceptance data
      const totalApplications = SAMPLE_APPLICATIONS.length;
      const acceptedApplications = SAMPLE_APPLICATIONS.filter(app => app.status === 'Accepted').length;
      const acceptanceRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

      // Monthly acceptance data (mock data for trend)
      const monthlyAcceptanceData: AcceptedCandidatesData[] = [
        { month: 'Jan', accepted: 8, total: 25, rate: 32 },
        { month: 'Feb', accepted: 12, total: 30, rate: 40 },
        { month: 'Mar', accepted: 10, total: 28, rate: 36 },
        { month: 'Apr', accepted: 15, total: 35, rate: 43 },
        { month: 'May', accepted: 18, total: 40, rate: 45 },
        { month: 'Jun', accepted: acceptedApplications, total: totalApplications, rate: acceptanceRate }
      ];

      setMetrics({
        totalUsers,
        usersByRole,
        totalJobPostings: SAMPLE_JOBS.length,
        jobPostingsByStatus,
        totalApplications,
        acceptedCandidates: acceptedApplications,
        acceptanceRate,
        monthlyAcceptanceData
      });



    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">
            Executive-level insights and business intelligence for recruitment platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          <Button variant="outlined" onClick={loadAnalyticsData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outlined">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Total Users</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-1">
            {metrics.totalUsers}
          </p>
          <p className="text-sm text-purple-600">
            Across all roles
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Job Postings</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900 mb-1">
            {metrics.totalJobPostings}
          </p>
          <p className="text-sm text-blue-600">
            Total positions
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-700">Applications</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-1">
            {metrics.totalApplications}
          </p>
          <p className="text-sm text-green-600">
            Total received
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Accepted</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-900 mb-1">
            {metrics.acceptedCandidates}
          </p>
          <p className="text-sm text-orange-600">
            {formatPercentage(metrics.acceptanceRate)} success rate
          </p>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Users by Role
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={metrics.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percentage }) => `${role}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Job Postings by Status Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Job Postings by Status
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.jobPostingsByStatus} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {metrics.jobPostingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Acceptance Rate Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Candidate Acceptance Rate Trend
          </h3>
          <Badge className="bg-green-100 text-green-800">
            {formatPercentage(metrics.acceptanceRate)} Current Rate
          </Badge>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.monthlyAcceptanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="acceptanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#666"
                label={{ value: 'Acceptance Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={COLORS.success}
                fillOpacity={1}
                fill="url(#acceptanceGradient)"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="accepted"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.acceptedCandidates}</p>
            <p className="text-sm text-gray-600">Total Accepted</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{formatPercentage(metrics.acceptanceRate)}</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemAnalyticsDashboard;
