import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Clock, 
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Star
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface TeamMetrics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  applicationsThisMonth: number;
  applicationsGrowth: number;
  averageTimeToHire: number;
  timeToHireChange: number;
  hiresThisMonth: number;
  hiresGrowth: number;
  conversionRate: number;
  conversionRateChange: number;
  averageApplicationScore: number;
  scoreChange: number;
}

interface JobPerformance {
  jobId: string;
  jobTitle: string;
  status: string;
  applications: number;
  views: number;
  conversionRate: number;
  averageScore: number;
  timeToFill: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

interface HiringFunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

interface TeamAnalyticsProps {
  className?: string;
}

const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
  const [jobPerformance, setJobPerformance] = useState<JobPerformance[]>([]);
  const [hiringFunnel, setHiringFunnel] = useState<HiringFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMetrics: TeamMetrics = {
      totalJobs: 12,
      activeJobs: 8,
      totalApplications: 234,
      applicationsThisMonth: 45,
      applicationsGrowth: 18.5,
      averageTimeToHire: 21,
      timeToHireChange: -3.2,
      hiresThisMonth: 3,
      hiresGrowth: 50.0,
      conversionRate: 6.7,
      conversionRateChange: 2.1,
      averageApplicationScore: 78.5,
      scoreChange: 4.2
    };

    const mockJobPerformance: JobPerformance[] = [
      {
        jobId: '1',
        jobTitle: 'Senior Full Stack Developer',
        status: 'published',
        applications: 45,
        views: 234,
        conversionRate: 8.9,
        averageScore: 82.1,
        timeToFill: 18,
        priority: 'high',
        createdAt: '2024-01-10'
      },
      {
        jobId: '2',
        jobTitle: 'Product Manager',
        status: 'published',
        applications: 23,
        views: 156,
        conversionRate: 5.2,
        averageScore: 78.5,
        timeToFill: 25,
        priority: 'medium',
        createdAt: '2024-01-08'
      },
      {
        jobId: '3',
        jobTitle: 'UX/UI Designer',
        status: 'pending_approval',
        applications: 67,
        views: 289,
        conversionRate: 12.3,
        averageScore: 85.3,
        timeToFill: 0,
        priority: 'medium',
        createdAt: '2024-01-05'
      },
      {
        jobId: '4',
        jobTitle: 'Backend Developer',
        status: 'draft',
        applications: 0,
        views: 0,
        conversionRate: 0,
        averageScore: 0,
        timeToFill: 0,
        priority: 'urgent',
        createdAt: '2024-01-15'
      }
    ];

    const mockHiringFunnel: HiringFunnelData[] = [
      { stage: 'Applications', count: 234, percentage: 100 },
      { stage: 'Initial Review', count: 117, percentage: 50, dropoffRate: 50 },
      { stage: 'Technical Test', count: 70, percentage: 30, dropoffRate: 40 },
      { stage: 'HR Interview', count: 35, percentage: 15, dropoffRate: 50 },
      { stage: 'Final Review', count: 18, percentage: 7.7, dropoffRate: 49 },
      { stage: 'Offers', count: 9, percentage: 3.8, dropoffRate: 50 },
      { stage: 'Hires', count: 7, percentage: 3.0, dropoffRate: 22 }
    ];

    setTimeout(() => {
      setMetrics(mockMetrics);
      setJobPerformance(mockJobPerformance);
      setHiringFunnel(mockHiringFunnel);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
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

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Analytics</h1>
          <p className="text-gray-600">Track your hiring performance and team metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <Button
            variant="outlined"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          
          <Button
            variant="outlined"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalApplications)}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.applicationsGrowth)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.applicationsGrowth)}`}>
                  {formatPercentage(Math.abs(metrics.applicationsGrowth))} vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageTimeToHire} days</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.timeToHireChange)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.timeToHireChange)}`}>
                  {Math.abs(metrics.timeToHireChange)} days vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.conversionRate)}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.conversionRateChange)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.conversionRateChange)}`}>
                  {formatPercentage(Math.abs(metrics.conversionRateChange))} vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageApplicationScore.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.scoreChange)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.scoreChange)}`}>
                  {Math.abs(metrics.scoreChange).toFixed(1)}% vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Hiring Funnel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Hiring Funnel</h2>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            {timeRange === '7d' ? 'Last 7 days' : 
             timeRange === '30d' ? 'Last 30 days' : 
             timeRange === '90d' ? 'Last 90 days' : 'Last year'}
          </Badge>
        </div>
        
        <div className="space-y-4">
          {hiringFunnel.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{stage.stage}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{formatNumber(stage.count)} candidates</span>
                  <span className="text-sm font-medium text-gray-900">{formatPercentage(stage.percentage)}</span>
                  {stage.dropoffRate && (
                    <span className="text-sm text-red-600">-{formatPercentage(stage.dropoffRate)} dropoff</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Job Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Performance</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Job Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Conversion</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Time to Fill</th>
              </tr>
            </thead>
            <tbody>
              {jobPerformance.map((job) => (
                <tr key={job.jobId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{job.jobTitle}</span>
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatNumber(job.applications)}</td>
                  <td className="py-3 px-4 text-gray-600">{formatNumber(job.views)}</td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      job.conversionRate >= 10 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : job.conversionRate >= 5
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : job.conversionRate > 0
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {job.conversionRate > 0 ? formatPercentage(job.conversionRate) : 'N/A'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {job.averageScore > 0 ? (
                      <div className="flex items-center">
                        <span className="text-gray-900">{job.averageScore.toFixed(1)}%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${job.averageScore}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {job.timeToFill > 0 ? `${job.timeToFill} days` : 'Ongoing'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Job Status Overview</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Active Jobs</p>
                  <p className="text-sm text-gray-600">Currently published</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{metrics.activeJobs}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Pending Approval</p>
                  <p className="text-sm text-gray-600">Awaiting approval</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {jobPerformance.filter(j => j.status === 'pending_approval').length}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Draft Jobs</p>
                  <p className="text-sm text-gray-600">Not yet published</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-600">
                {jobPerformance.filter(j => j.status === 'draft').length}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">3 new applications received</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Job "UX/UI Designer" sent for approval</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Technical assessment completed by candidate</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Interview scheduled for tomorrow</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamAnalytics;
