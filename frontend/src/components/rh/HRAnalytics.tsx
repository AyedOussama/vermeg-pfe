import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  Award,
  MessageSquare,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface HRMetrics {
  totalApplications: number;
  applicationsThisMonth: number;
  applicationsGrowth: number;
  averageTimeToHire: number;
  timeToHireChange: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offerAcceptanceRate: number;
  acceptanceRateChange: number;
  candidateRating: number;
  ratingChange: number;
}

interface DepartmentMetrics {
  department: string;
  applications: number;
  hires: number;
  averageScore: number;
  timeToHire: number;
  conversionRate: number;
}

interface HiringFunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

interface HRAnalyticsProps {
  className?: string;
}

const HRAnalytics: React.FC<HRAnalyticsProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<HRMetrics | null>(null);
  const [departmentMetrics, setDepartmentMetrics] = useState<DepartmentMetrics[]>([]);
  const [hiringFunnel, setHiringFunnel] = useState<HiringFunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMetrics: HRMetrics = {
      totalApplications: 1247,
      applicationsThisMonth: 89,
      applicationsGrowth: 12.5,
      averageTimeToHire: 18,
      timeToHireChange: -2.3,
      interviewsScheduled: 45,
      interviewsCompleted: 38,
      offerAcceptanceRate: 78.5,
      acceptanceRateChange: 5.2,
      candidateRating: 4.2,
      ratingChange: 0.3
    };

    const mockDepartmentMetrics: DepartmentMetrics[] = [
      {
        department: 'Engineering',
        applications: 456,
        hires: 23,
        averageScore: 82.5,
        timeToHire: 21,
        conversionRate: 5.0
      },
      {
        department: 'Product',
        applications: 234,
        hires: 12,
        averageScore: 78.3,
        timeToHire: 16,
        conversionRate: 5.1
      },
      {
        department: 'Design',
        applications: 189,
        hires: 8,
        averageScore: 85.1,
        timeToHire: 14,
        conversionRate: 4.2
      },
      {
        department: 'Marketing',
        applications: 156,
        hires: 6,
        averageScore: 76.8,
        timeToHire: 12,
        conversionRate: 3.8
      },
      {
        department: 'Sales',
        applications: 212,
        hires: 15,
        averageScore: 79.2,
        timeToHire: 10,
        conversionRate: 7.1
      }
    ];

    const mockHiringFunnel: HiringFunnelData[] = [
      { stage: 'Applications', count: 1247, percentage: 100 },
      { stage: 'Initial Review', count: 623, percentage: 50, dropoffRate: 50 },
      { stage: 'Technical Test', count: 312, percentage: 25, dropoffRate: 50 },
      { stage: 'HR Interview', count: 187, percentage: 15, dropoffRate: 40 },
      { stage: 'Final Interview', count: 94, percentage: 7.5, dropoffRate: 50 },
      { stage: 'Offers', count: 47, percentage: 3.8, dropoffRate: 50 },
      { stage: 'Hires', count: 37, percentage: 3.0, dropoffRate: 21 }
    ];

    setTimeout(() => {
      setMetrics(mockMetrics);
      setDepartmentMetrics(mockDepartmentMetrics);
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
          <h1 className="text-2xl font-bold text-gray-900">HR Analytics</h1>
          <p className="text-gray-600">Human resources metrics and insights</p>
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
              <p className="text-sm font-medium text-gray-600">Offer Acceptance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(metrics.offerAcceptanceRate)}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.acceptanceRateChange)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.acceptanceRateChange)}`}>
                  {formatPercentage(Math.abs(metrics.acceptanceRateChange))} vs last period
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidate Rating</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.candidateRating}/5</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(metrics.ratingChange)}
                <span className={`text-sm ml-1 ${getTrendColor(metrics.ratingChange)}`}>
                  {Math.abs(metrics.ratingChange)} vs last period
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

      {/* Department Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Department Performance</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Hires</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Conversion Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg. Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Time to Hire</th>
              </tr>
            </thead>
            <tbody>
              {departmentMetrics.map((dept) => (
                <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{dept.department}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{formatNumber(dept.applications)}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.hires}</td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      dept.conversionRate >= 5 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : dept.conversionRate >= 3
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {formatPercentage(dept.conversionRate)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-gray-900">{dept.averageScore.toFixed(1)}</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${dept.averageScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{dept.timeToHire} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interview Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Interview Metrics</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Interviews Scheduled</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{metrics.interviewsScheduled}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Interviews Completed</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{metrics.interviewsCompleted}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Completion Rate</p>
                  <p className="text-sm text-gray-600">Scheduled vs completed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {formatPercentage((metrics.interviewsCompleted / metrics.interviewsScheduled) * 100)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="space-y-3">
            <Button
              variant="outlined"
              className="w-full flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Detailed Report
            </Button>
            
            <Button
              variant="outlined"
              className="w-full flex items-center justify-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              View Diversity Metrics
            </Button>
            
            <Button
              variant="outlined"
              className="w-full flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" />
              Set Hiring Goals
            </Button>
            
            <Button
              variant="outlined"
              className="w-full flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Candidate Feedback
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HRAnalytics;
