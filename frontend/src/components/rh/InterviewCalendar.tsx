import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Video,
  Users,
  Filter,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Interview, Application } from '@/types/job';
import { interviewService } from '@/services/interviewService';
import InterviewSchedulingModal from '@/components/rh/InterviewSchedulingModal';

interface InterviewCalendarProps {
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  interviews: Interview[];
}

interface InterviewEvent extends Interview {
  startTime: Date;
  endTime: Date;
}

const InterviewCalendar: React.FC<InterviewCalendarProps> = ({ className = '' }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    loadInterviews();
  }, [currentDate, viewMode]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const rhUserId = 'current-rh-user'; // This should come from auth context

      // Get date range based on current view
      const { startDate, endDate } = getDateRange();

      const interviewData = await interviewService.getInterviewsByDateRange(
        rhUserId,
        startDate,
        endDate
      );

      setInterviews(interviewData);
    } catch (error) {
      console.error('Error loading interviews:', error);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'week':
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        end.setDate(start.getDate() + 6);
        break;
      case 'day':
        // Same day
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  // Generate calendar days for month view
  const generateCalendarDays = useMemo((): CalendarDay[] => {
    if (viewMode !== 'month') return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the beginning of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End at the end of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const days: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    const today = new Date();

    while (currentDay <= endDate) {
      const dayInterviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate.toDateString() === currentDay.toDateString();
      });

      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === today.toDateString(),
        interviews: dayInterviews
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [currentDate, interviews, viewMode]);
      
  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);

    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Utility functions
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDateRangeDisplay = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric'
    };

    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', options);
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endOfWeek.getFullYear()}`;
        }
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      default:
        return '';
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'rescheduled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-600" />;
      case 'phone': return <Phone className="w-4 h-4 text-green-600" />;
      case 'in_person': return <MapPin className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  // Handle scheduling new interview
  const handleScheduleInterview = () => {
    // Create a sample application for demonstration
    // In a real app, this would come from selecting an accepted application
    const sampleApplication: Application = {
      id: 'sample_app_' + Date.now(),
      jobId: 'sample_job_1',
      candidateId: 'sample_candidate_1',
      jobTitle: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Tunis, Tunisia',
      status: 'accepted',
      priority: 'high',
      candidate: {
        id: 'sample_candidate_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+216 12 345 678',
        location: 'Tunis, Tunisia',
        profilePicture: undefined,
        summary: 'Experienced Frontend Developer with 5+ years in React',
        experience: 5,
        education: 'Master in Computer Science',
        currentPosition: 'Frontend Developer',
        expectedSalary: '3000 TND',
        availabilityToStart: 'Immediately',
        workPreference: 'hybrid'
      },
      coverLetter: 'I am very interested in this position...',
      additionalComments: undefined,
      documents: [],
      technicalAssessment: undefined,
      hrAssessment: undefined,
      overallScore: 85,
      interviews: [],
      scheduledInterview: undefined,
      projectLeaderDecision: {
        decision: 'accept',
        feedback: 'Excellent technical skills and experience',
        rating: 5,
        decidedAt: new Date().toISOString(),
        decidedBy: 'project-leader-1',
        nextSteps: 'Schedule HR interview'
      },
      rhInterviewScheduling: undefined,
      conversationId: undefined,
      hasUnreadMessages: false,
      timeline: [],
      appliedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      internalNotes: undefined,
      tags: ['frontend', 'react', 'typescript'],
      viewedByProjectLeader: true,
      viewedAt: new Date().toISOString()
    };

    setSelectedApplication(sampleApplication);
    setShowSchedulingModal(true);
  };

  const handleInterviewScheduled = (interview: Interview) => {
    // Add the new interview to the list
    setInterviews(prev => [...prev, interview]);
    setShowSchedulingModal(false);
    setSelectedApplication(null);
  };

  const filteredInterviews = getFilteredInterviews();

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interview Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and track all scheduled interviews</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Badge variant="info" className="flex items-center justify-center gap-1 px-3 py-2 sm:py-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{filteredInterviews.length} interviews</span>
          </Badge>
          <Button
            variant="contained"
            size="small"
            onClick={handleScheduleInterview}
            className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm sm:text-base">Schedule Interview</span>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 sm:p-6 bg-white shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
          {/* Date Navigation */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg sm:text-xl font-bold text-gray-900 min-w-[200px] sm:min-w-[250px] text-center px-2">
                {getDateRangeDisplay()}
              </div>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              variant="outlined"
              size="small"
              onClick={goToToday}
              className="px-3 sm:px-4 py-2 text-blue-600 border-blue-200 hover:bg-blue-50 text-sm sm:text-base"
            >
              Today
            </Button>
          </div>

          {/* View Mode Toggle & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 flex-1 sm:flex-none ${
                    viewMode === mode
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 lg:w-64 text-sm sm:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white w-full sm:w-auto text-sm sm:text-base"
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
        </div>
      </Card>

      {/* Calendar Content */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Loading calendar...</p>
        </Card>
      ) : (
        <>
          {/* Month View */}
          {viewMode === 'month' && (
            <Card className="p-6 bg-white shadow-sm border border-gray-200">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-px mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {generateCalendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 bg-white hover:bg-gray-50 transition-colors ${
                      !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                    } ${day.isToday ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>

                    {/* Interviews for this day */}
                    <div className="space-y-1">
                      {day.interviews.slice(0, 3).map((interview) => (
                        <div
                          key={interview.id}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(interview.status)}`}
                          onClick={() => setSelectedInterview(interview)}
                          title={`${interview.candidateName} - ${interview.jobTitle}`}
                        >
                          <div className="flex items-center gap-1">
                            {getTypeIcon(interview.type)}
                            <span className="truncate font-medium">
                              {formatTime(interview.scheduledTime)} {interview.candidateName}
                            </span>
                          </div>
                        </div>
                      ))}
                      {day.interviews.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                          +{day.interviews.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <Card className="p-6 bg-white shadow-sm border border-gray-200">
              <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No interviews this week</h3>
                    <p className="text-gray-600">No interviews scheduled for the selected week</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInterviews.map((interview) => (
                      <Card key={interview.id} className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-blue-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(interview.type)}
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{interview.candidateName}</h3>
                                <Badge className={`${getStatusColor(interview.status)} text-xs`}>
                                  {interview.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{interview.jobTitle}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>{formatTime(interview.scheduledTime)} ({interview.duration} min)</span>
                                {interview.location && <span>{interview.location}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => setSelectedInterview(interview)}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <Card className="p-6 bg-white shadow-sm border border-gray-200">
              <div className="space-y-6">
                {filteredInterviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No interviews today</h3>
                    <p className="text-gray-600">No interviews scheduled for the selected day</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInterviews.map((interview) => (
                      <Card key={interview.id} className="p-6 hover:shadow-lg transition-all duration-200 border border-gray-200">
                        <div className="flex items-start gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              {getTypeIcon(interview.type)}
                            </div>
                            <Badge className={`${getStatusColor(interview.status)} text-xs px-2 py-1`}>
                              {getStatusIcon(interview.status)}
                              <span className="ml-1">{interview.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{interview.candidateName}</h3>
                                <p className="text-gray-600 font-medium">{interview.jobTitle}</p>
                              </div>

                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">{formatTime(interview.scheduledTime)}</div>
                                <div className="text-sm text-gray-500">{interview.duration} minutes</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>{formatDate(interview.scheduledDate)}</span>
                              </div>
                              {interview.location && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-green-500" />
                                  <span>{interview.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span>HR Interview</span>
                              </div>
                            </div>

                            {interview.notes && (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                <p className="text-sm text-gray-600">{interview.notes}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <Button
                                variant="contained"
                                size="small"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setSelectedInterview(interview)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Interview Scheduling Modal */}
      {showSchedulingModal && selectedApplication && (
        <InterviewSchedulingModal
          isOpen={showSchedulingModal}
          application={selectedApplication}
          onClose={() => {
            setShowSchedulingModal(false);
            setSelectedApplication(null);
          }}
          onInterviewScheduled={handleInterviewScheduled}
        />
      )}
    </div>
  );
};

export default InterviewCalendar;
