import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  FileText,
  Eye,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Zap,
  Activity
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SAMPLE_JOBS, SAMPLE_APPLICATIONS, SAMPLE_CANDIDATES } from '@/data/dummyData';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  percentage: number;
  avgTimeInStage: number;
  conversionRate: number;
  bottleneck: boolean;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface PipelineMetrics {
  totalApplications: number;
  activeJobs: number;
  avgTimeToHire: number;
  conversionRate: number;
  bottlenecks: string[];
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    conversionRate: number;
  }>;
}

interface CandidateFlow {
  date: string;
  applications: number;
  hrReviews: number;
  interviews: number;
  offers: number;
  hires: number;
}

const PipelineManagementDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalApplications: 0,
    activeJobs: 0,
    avgTimeToHire: 0,
    conversionRate: 0,
    bottlenecks: [],
    topPerformingJobs: []
  });
  const [candidateFlow, setCandidateFlow] = useState<CandidateFlow[]>([]);

  useEffect(() => {
    loadPipelineData();
  }, [timeRange]);

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate pipeline stages from dummy data
      const stages: PipelineStage[] = [
        {
          id: 'applications',
          name: 'Applications Received',
          count: SAMPLE_APPLICATIONS.length,
          percentage: 100,
          avgTimeInStage: 0,
          conversionRate: 100,
          bottleneck: false,
          trend: 'up',
          trendPercentage: 12
        },
        {
          id: 'technical_review',
          name: 'Technical Review',
          count: SAMPLE_APPLICATIONS.filter(app => 
            ['Technical Review', 'HR Review', 'Under Review', 'Interview Scheduled', 'Accepted'].includes(app.status)
          ).length,
          percentage: 85,
          avgTimeInStage: 2.5,
          conversionRate: 85,
          bottleneck: false,
          trend: 'up',
          trendPercentage: 8
        },
        {
          id: 'hr_review',
          name: 'HR Assessment',
          count: SAMPLE_APPLICATIONS.filter(app => 
            ['HR Review', 'Under Review', 'Interview Scheduled', 'Accepted'].includes(app.status)
          ).length,
          percentage: 72,
          avgTimeInStage: 3.2,
          conversionRate: 72,
          bottleneck: true,
          trend: 'down',
          trendPercentage: 5
        },
        {
          id: 'interviews',
          name: 'Interviews',
          count: SAMPLE_APPLICATIONS.filter(app => 
            ['Interview Scheduled', 'Under Review', 'Accepted'].includes(app.status)
          ).length,
          percentage: 58,
          avgTimeInStage: 5.8,
          conversionRate: 58,
          bottleneck: false,
          trend: 'stable',
          trendPercentage: 2
        },
        {
          id: 'final_review',
          name: 'Final Review',
          count: SAMPLE_APPLICATIONS.filter(app => 
            ['Under Review', 'Accepted'].includes(app.status)
          ).length,
          percentage: 45,
          avgTimeInStage: 2.1,
          conversionRate: 45,
          bottleneck: false,
          trend: 'up',
          trendPercentage: 15
        },
        {
          id: 'offers',
          name: 'Offers Extended',
          count: SAMPLE_APPLICATIONS.filter(app => app.status === 'Accepted').length,
          percentage: 28,
          avgTimeInStage: 1.5,
          conversionRate: 28,
          bottleneck: false,
          trend: 'up',
          trendPercentage: 20
        }
      ];

      setPipelineStages(stages);

      // Calculate metrics
      const activeJobs = SAMPLE_JOBS.filter(job => job.status === 'Published').length;
      const totalApplications = SAMPLE_APPLICATIONS.length;
      const avgTimeToHire = 14.5; // Mock data
      const conversionRate = (stages[stages.length - 1].count / totalApplications) * 100;

      setMetrics({
        totalApplications,
        activeJobs,
        avgTimeToHire,
        conversionRate,
        bottlenecks: stages.filter(stage => stage.bottleneck).map(stage => stage.name),
        topPerformingJobs: [
          { id: 'JOB001', title: 'Senior Frontend Developer', applications: 15, conversionRate: 35 },
          { id: 'JOB003', title: 'Full Stack Developer', applications: 12, conversionRate: 28 },
          { id: 'JOB002', title: 'Data Science Manager', applications: 8, conversionRate: 42 }
        ]
      });

      // Mock candidate flow data
      setCandidateFlow([
        { date: '2024-06-15', applications: 8, hrReviews: 6, interviews: 4, offers: 2, hires: 1 },
        { date: '2024-06-16', applications: 12, hrReviews: 8, interviews: 5, offers: 3, hires: 2 },
        { date: '2024-06-17', applications: 6, hrReviews: 10, interviews: 6, offers: 2, hires: 1 },
        { date: '2024-06-18', applications: 15, hrReviews: 7, interviews: 8, offers: 4, hires: 3 },
        { date: '2024-06-19', applications: 9, hrReviews: 12, interviews: 3, offers: 1, hires: 0 },
        { date: '2024-06-20', applications: 11, hrReviews: 9, interviews: 7, offers: 3, hires: 2 },
        { date: '2024-06-21', applications: 7, hrReviews: 11, interviews: 5, offers: 2, hires: 1 }
      ]);

    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string, trendPercentage: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <ArrowRight className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getStageColor = (index: number, bottleneck: boolean) => {
    if (bottleneck) return 'bg-red-100 border-red-300';
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-indigo-100 border-indigo-300',
      'bg-purple-100 border-purple-300',
      'bg-pink-100 border-pink-300',
      'bg-orange-100 border-orange-300',
      'bg-green-100 border-green-300'
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Management</h1>
          <p className="text-gray-600">
            System-wide recruitment metrics and candidate flow analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button variant="outlined" onClick={loadPipelineData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button variant="outlined">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
              <p className="text-xs text-blue-600 mt-1">+12% from last period</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeJobs}</p>
              <p className="text-xs text-green-600 mt-1">3 new this week</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgTimeToHire} days</p>
              <p className="text-xs text-orange-600 mt-1">-2 days improvement</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.conversionRate)}%</p>
              <p className="text-xs text-purple-600 mt-1">+5% improvement</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pipeline Visualization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recruitment Pipeline Flow</h2>
          <div className="flex items-center gap-2">
            {metrics.bottlenecks.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {metrics.bottlenecks.length} bottleneck{metrics.bottlenecks.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {pipelineStages.map((stage, index) => (
            <div
              key={stage.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                getStageColor(index, stage.bottleneck)
              } ${selectedStage === stage.id ? 'ring-2 ring-orange-500' : ''}`}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
            >
              {/* Connection Arrow */}
              {index < pipelineStages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )}

              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">{stage.name}</h3>

                <div className="mb-2">
                  <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
                  <div className="text-xs text-gray-600">{stage.percentage}% of total</div>
                </div>

                <div className="flex items-center justify-center gap-1 mb-2">
                  {getTrendIcon(stage.trend, stage.trendPercentage)}
                  <span className={`text-xs font-medium ${getTrendColor(stage.trend)}`}>
                    {stage.trendPercentage}%
                  </span>
                </div>

                {stage.avgTimeInStage > 0 && (
                  <div className="text-xs text-gray-600">
                    Avg: {stage.avgTimeInStage} days
                  </div>
                )}

                {stage.bottleneck && (
                  <div className="mt-2">
                    <Badge variant="destructive" size="sm">
                      <Zap className="w-3 h-3 mr-1" />
                      Bottleneck
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stage Details */}
        {selectedStage && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            {(() => {
              const stage = pipelineStages.find(s => s.id === selectedStage);
              if (!stage) return null;

              return (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">{stage.name} - Detailed Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Candidates in Stage</div>
                      <div className="text-xl font-bold text-gray-900">{stage.count}</div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                      <div className="text-xl font-bold text-gray-900">{stage.conversionRate}%</div>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <div className="text-sm text-gray-600">Avg. Time in Stage</div>
                      <div className="text-xl font-bold text-gray-900">{stage.avgTimeInStage} days</div>
                    </div>
                  </div>

                  {stage.bottleneck && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Bottleneck Identified</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        This stage is experiencing delays. Consider reviewing processes or allocating additional resources.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </Card>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Flow Chart */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Daily Candidate Flow</h3>
              <Button variant="ghost" size="small">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>

            <div className="space-y-4">
              {candidateFlow.slice(-7).map((flow, index) => (
                <div key={flow.date} className="flex items-center gap-4">
                  <div className="w-16 text-sm text-gray-600">
                    {new Date(flow.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>

                  <div className="flex-1 grid grid-cols-5 gap-2">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Apps</div>
                      <div className="h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-800">{flow.applications}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">HR</div>
                      <div className="h-8 bg-orange-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-800">{flow.hrReviews}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Interviews</div>
                      <div className="h-8 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-800">{flow.interviews}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Offers</div>
                      <div className="h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-green-800">{flow.offers}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Hires</div>
                      <div className="h-8 bg-emerald-100 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-emerald-800">{flow.hires}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performing Jobs */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Jobs</h3>
            <div className="space-y-4">
              {metrics.topPerformingJobs.map((job, index) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                      <span>{job.applications} applications</span>
                      <span>{job.conversionRate}% conversion</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      #{index + 1}
                    </Badge>
                    <Button variant="ghost" size="small">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Bottleneck Analysis */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bottleneck Analysis</h3>

            {metrics.bottlenecks.length > 0 ? (
              <div className="space-y-3">
                {metrics.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-red-900">{bottleneck}</div>
                      <div className="text-sm text-red-700">Experiencing delays</div>
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Review HR assessment process efficiency</li>
                    <li>• Consider additional HR resources</li>
                    <li>• Implement automated screening tools</li>
                    <li>• Set up process optimization meetings</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">No Bottlenecks Detected</h4>
                <p className="text-sm text-gray-600">Your recruitment pipeline is flowing smoothly!</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outlined" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Review Pending Applications
              </Button>
              <Button variant="outlined" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interviews
              </Button>
              <Button variant="outlined" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Generate Pipeline Report
              </Button>
              <Button variant="outlined" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                Optimize Bottlenecks
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PipelineManagementDashboard;
