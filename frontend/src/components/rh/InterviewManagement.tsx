import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Video, Users, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Interview } from '@/types/job';
import { interviewService } from '@/services/interviewService';
import { toast } from 'react-toastify';

interface InterviewManagementProps {
  className?: string;
}

const InterviewManagement: React.FC<InterviewManagementProps> = ({ className = '' }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const rhUserId = 'current-rh-user'; // This should come from auth context
      const fetchedInterviews = await interviewService.getInterviewsForRH(rhUserId);
      setInterviews(fetchedInterviews);
    } catch (error) {
      console.error('Error loading interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredInterviews = () => {
    let filtered = interviews;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(interview => interview.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(interview =>
        interview.candidateName.toLowerCase().includes(search) ||
        interview.jobTitle.toLowerCase().includes(search) ||
        interview.notes?.toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const handleStatusUpdate = async (interviewId: string, newStatus: Interview['status']) => {
    try {
      await interviewService.updateInterviewStatus(interviewId, newStatus);
      toast.success(`Interview status updated to ${newStatus}`);
      loadInterviews();
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error('Failed to update interview status');
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;

    try {
      await interviewService.cancelInterview(interviewId, 'Cancelled by HR');
      toast.success('Interview cancelled successfully');
      loadInterviews();
    } catch (error) {
      console.error('Error cancelling interview:', error);
      toast.error('Failed to cancel interview');
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUpcomingInterviews = () => {
    const now = new Date();
    return interviews.filter(interview => {
      const interviewDate = new Date(`${interview.scheduledDate}T${interview.scheduledTime}`);
      return interviewDate > now && interview.status === 'scheduled';
    }).slice(0, 3);
  };

  const filteredInterviews = getFilteredInterviews();
  const upcomingInterviews = getUpcomingInterviews();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600">Manage and track all scheduled interviews</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {filteredInterviews.length} interviews
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interviews</p>
              <p className="text-xl font-bold text-gray-900">{interviews.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">
                {interviews.filter(i => i.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
          <div className="space-y-3">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getTypeIcon(interview.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{interview.candidateName}</p>
                    <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(interview.scheduledDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatTime(interview.scheduledTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Interview List */}
      {loading ? (
        <Card className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interviews...</p>
        </Card>
      ) : filteredInterviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No interviews found</h3>
          <p className="text-gray-600">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters to see more interviews'
              : 'No interviews have been scheduled yet'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {getTypeIcon(interview.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {interview.candidateName}
                        </h3>
                        <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                        <p className="text-sm text-gray-500">{interview.candidateEmail}</p>
                      </div>
                      
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(interview.scheduledTime)} ({interview.duration} min)
                      </div>
                      {interview.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {interview.location}
                        </div>
                      )}
                    </div>
                    
                    {interview.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                        {interview.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {interview.status === 'scheduled' && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleStatusUpdate(interview.id, 'confirmed')}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCancelInterview(interview.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {interview.status === 'confirmed' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleStatusUpdate(interview.id, 'completed')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewManagement;
