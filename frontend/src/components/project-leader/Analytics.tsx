import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Briefcase, 
  Clock, 
  Award,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Star
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Select } from '@/components/common/Select';

interface AnalyticsData {
  overview: {
    totalJobs: number;
    totalApplications: number;
    averageTimeToHire: number;
    successRate: number;
    trends: {
      jobs: number;
      applications: number;
      timeToHire: number;
      successRate: number;
    };
  };
  jobMetrics: {
    byStatus: { status: string; count: number; percentage: number }[];
    byDepartment: { department: string; count: number; applications: number }[];
    topPerforming: { id: string; title: string; applications: number; successRate: number }[];
  };
  applicationMetrics: {
    bySource: { source: string; count: number; percentage: number }[];
    byStage: { stage: string; count: number; conversionRate: number }[];
    timeToHire: { month: string; days: number }[];
  };
  candidateMetrics: {
    topSkills: { skill: string; demand: number; avgSalary: number }[];
    experienceDistribution: { level: string; count: number; percentage: number }[];
    locationDistribution: { location: string; count: number; percentage: number }[];
  };
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('last_30_days');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    overview: {
      totalJobs: 24,
      totalApplications: 156,
      averageTimeToHire: 18,
      successRate: 68,
      trends: {
        jobs: 12,
        applications: 23,
        timeToHire: -15,
        successRate: 8
      }
    },
    jobMetrics: {
      byStatus: [
        { status: 'Published', count: 12, percentage: 50 },
        { status: 'HR Review', count: 6, percentage: 25 },
        { status: 'CEO Approval', count: 4, percentage: 17 },
        { status: 'Draft', count: 2, percentage: 8 }
      ],
      byDepartment: [
        { department: 'Engineering', count: 15, applications: 89 },
        { department: 'Product', count: 4, applications: 32 },
        { department: 'Design', count: 3, applications: 21 },
        { department: 'Marketing', count: 2, applications: 14 }
      ],
      topPerforming: [
        { id: 'job-001', title: 'Senior Full Stack Developer', applications: 45, successRate: 78 },
        { id: 'job-002', title: 'DevOps Engineer', applications: 32, successRate: 72 },
        { id: 'job-003', title: 'Frontend Developer', applications: 28, successRate: 65 }
      ]
    },
    applicationMetrics: {
      bySource: [
        { source: 'Direct Application', count: 68, percentage: 44 },
        { source: 'LinkedIn', count: 42, percentage: 27 },
        { source: 'Job Boards', count: 31, percentage: 20 },
        { source: 'Referrals', count: 15, percentage: 9 }
      ],
      byStage: [
        { stage: 'Applied', count: 156, conversionRate: 100 },
        { stage: 'Screening', count: 89, conversionRate: 57 },
        { stage: 'Technical Test', count: 54, conversionRate: 35 },
        { stage: 'Interview', count: 32, conversionRate: 21 },
        { stage: 'Offer', count: 18, conversionRate: 12 },
        { stage: 'Hired', count: 12, conversionRate: 8 }
      ],
      timeToHire: [
        { month: 'Jan', days: 22 },
        { month: 'Feb', days: 19 },
        { month: 'Mar', days: 21 },
        { month: 'Apr', days: 18 },
        { month: 'May', days: 16 },
        { month: 'Jun', days: 18 }
      ]
    },
    candidateMetrics: {
      topSkills: [
        { skill: 'React', demand: 45, avgSalary: 85000 },
        { skill: 'Node.js', demand: 38, avgSalary: 82000 },
        { skill: 'Python', demand: 32, avgSalary: 88000 },
        { skill: 'AWS', demand: 28, avgSalary: 92000 },
        { skill: 'Docker', demand: 24, avgSalary: 78000 }
      ],
      experienceDistribution: [
        { level: 'Junior (0-2 years)', count: 42, percentage: 27 },
        { level: 'Mid (3-5 years)', count: 68, percentage: 44 },
        { level: 'Senior (6+ years)', count: 46, percentage: 29 }
      ],
      locationDistribution: [
        { location: 'Tunis', count: 89, percentage: 57 },
        { location: 'Sfax', count: 32, percentage: 21 },
        { location: 'Sousse', count: 21, percentage: 13 },
        { location: 'Other', count: 14, percentage: 9 }
      ]
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const timeRangeOptions = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const metricOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'jobs', label: 'Job Metrics' },
    { value: 'applications', label: 'Application Metrics' },
    { value: 'candidates', label: 'Candidate Metrics' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your recruitment performance and metrics</p>
        </div>
        <div className="flex gap-3">
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-40"
          />
          <Button variant="outlined" size="small">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outlined" size="small">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalJobs}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon(analyticsData.overview.trends.jobs)}
            <span className={`text-sm ml-1 ${getTrendColor(analyticsData.overview.trends.jobs)}`}>
              {Math.abs(analyticsData.overview.trends.jobs)}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalApplications}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon(analyticsData.overview.trends.applications)}
            <span className={`text-sm ml-1 ${getTrendColor(analyticsData.overview.trends.applications)}`}>
              {Math.abs(analyticsData.overview.trends.applications)}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageTimeToHire} days</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon(analyticsData.overview.trends.timeToHire)}
            <span className={`text-sm ml-1 ${getTrendColor(analyticsData.overview.trends.timeToHire)}`}>
              {Math.abs(analyticsData.overview.trends.timeToHire)}% vs last period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.successRate}%</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon(analyticsData.overview.trends.successRate)}
            <span className={`text-sm ml-1 ${getTrendColor(analyticsData.overview.trends.successRate)}`}>
              {Math.abs(analyticsData.overview.trends.successRate)}% vs last period
            </span>
          </div>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4">
          <Select
            label="View Metrics"
            options={metricOptions}
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Detailed Analytics */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Job Status Distribution
            </h3>
            <div className="space-y-3">
              {analyticsData.jobMetrics.byStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'Published' ? 'bg-green-500' :
                      item.status === 'HR Review' ? 'bg-yellow-500' :
                      item.status === 'CEO Approval' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">{item.count}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Top Performing Jobs
            </h3>
            <div className="space-y-4">
              {analyticsData.jobMetrics.topPerforming.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.applications} applications</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" className="text-xs">
                      {job.successRate}% success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Sources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Application Sources
            </h3>
            <div className="space-y-3">
              {analyticsData.applicationMetrics.bySource.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{source.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">{source.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Pipeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Application Pipeline
            </h3>
            <div className="space-y-3">
              {analyticsData.applicationMetrics.byStage.map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{stage.count}</span>
                    <Badge variant="outline" className="text-xs">
                      {stage.conversionRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'candidates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills in Demand */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              Top Skills in Demand
            </h3>
            <div className="space-y-4">
              {analyticsData.candidateMetrics.topSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.skill}</h4>
                    <p className="text-sm text-gray-600">{skill.demand} candidates</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${skill.avgSalary.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">avg salary</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Experience Distribution
            </h3>
            <div className="space-y-3">
              {analyticsData.candidateMetrics.experienceDistribution.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{level.level}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${level.percentage}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">{level.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMetric === 'jobs' && (
        <div className="grid grid-cols-1 gap-6">
          {/* Jobs by Department */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              Jobs by Department
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analyticsData.jobMetrics.byDepartment.map((dept, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{dept.department}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Jobs:</span>
                      <span className="font-medium">{dept.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Applications:</span>
                      <span className="font-medium">{dept.applications}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg per job:</span>
                      <span className="font-medium">{Math.round(dept.applications / dept.count)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
