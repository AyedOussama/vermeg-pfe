import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, Video, Users } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Application, Interview } from '@/types/job';
import { interviewService } from '@/services/interviewService';

interface InterviewSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onInterviewScheduled: (interview: Interview) => void;
}

const InterviewSchedulingModal: React.FC<InterviewSchedulingModalProps> = ({
  isOpen,
  onClose,
  application,
  onInterviewScheduled
}) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    type: 'video' as 'phone' | 'video' | 'in_person',
    location: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduledDate || !formData.scheduledTime) {
      notifyError('Please select both date and time for the interview');
      return;
    }

    if (formData.type === 'in_person' && !formData.location) {
      notifyError('Please provide a location for in-person interviews');
      return;
    }

    // Show confirmation step instead of directly scheduling
    setShowConfirmation(true);
  };

  const handleConfirmSchedule = async () => {
    setIsConfirming(true);

    try {
      const interview = await interviewService.scheduleInterview({
        applicationId: application.id,
        candidateId: application.candidateId,
        candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        candidateEmail: application.candidate.email,
        candidatePhone: application.candidate.phone,
        jobTitle: application.jobTitle,
        rhUserId: 'current-rh-user', // This should come from auth context
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        type: formData.type,
        location: formData.location || undefined,
        notes: formData.notes || undefined
      });

      notifySuccess('Interview scheduled successfully! Candidate has been notified.');
      onInterviewScheduled(interview);
      onClose();

      // Reset form
      setFormData({
        scheduledDate: '',
        scheduledTime: '',
        duration: 60,
        type: 'video',
        location: '',
        notes: ''
      });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      notifyError('Failed to schedule interview. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackToForm = () => {
    setShowConfirmation(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper functions for formatting
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />;
      case 'phone': return <Phone className="w-5 h-5 text-green-600" />;
      case 'in_person': return <MapPin className="w-5 h-5 text-purple-600" />;
      default: return <Users className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Video Call';
      case 'phone': return 'Phone Call';
      case 'in_person': return 'In-Person';
      default: return 'Interview';
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto">
      <div className="min-h-full w-full flex items-start justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl my-8 bg-white rounded-xl shadow-2xl border border-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  {showConfirmation ? 'Confirm Interview Schedule' : 'Schedule Interview'}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600 ml-13">
                {showConfirmation
                  ? 'Please review and confirm the interview details'
                  : `Schedule an interview with ${application.candidate.firstName} ${application.candidate.lastName}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 flex-shrink-0 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>

          {/* Candidate Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {application.candidate.firstName} {application.candidate.lastName}
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {application.candidate.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {application.candidate.phone}
                  </p>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {application.jobTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Content */}
          {!showConfirmation ? (
            /* Scheduling Form */
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Date and Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Interview Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interview Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interview Time
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Duration
              </h3>
              <select
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Interview Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Interview Type
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'video')}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-200 group ${
                    formData.type === 'video'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Video className={`w-8 h-8 mx-auto mb-3 ${formData.type === 'video' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                  <div className="font-semibold text-sm mb-1">Video Call</div>
                  <div className="text-xs text-gray-500">Online meeting</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'phone')}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-200 group ${
                    formData.type === 'phone'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <Phone className={`w-8 h-8 mx-auto mb-3 ${formData.type === 'phone' ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'}`} />
                  <div className="font-semibold text-sm mb-1">Phone Call</div>
                  <div className="text-xs text-gray-500">Voice only</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('type', 'in_person')}
                  className={`p-6 border-2 rounded-xl text-center transition-all duration-200 group ${
                    formData.type === 'in_person'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <MapPin className={`w-8 h-8 mx-auto mb-3 ${formData.type === 'in_person' ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500'}`} />
                  <div className="font-semibold text-sm mb-1">In Person</div>
                  <div className="text-xs text-gray-500">Office visit</div>
                </button>
              </div>
            </div>

            {/* Location (for in-person or video link) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {formData.type === 'in_person' ? 'Meeting Location' :
                 formData.type === 'video' ? 'Video Meeting Link (optional)' :
                 'Phone Number (optional)'}
              </h3>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={
                  formData.type === 'in_person' ? 'Enter office address or meeting room' :
                  formData.type === 'video' ? 'Meeting link will be sent separately if not provided' :
                  'Phone number will be provided separately if not entered'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
                required={formData.type === 'in_person'}
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Additional Notes (optional)
              </h3>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information for the candidate..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-8 border-t border-gray-200 mt-8">
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={isSubmitting}
                className="order-2 sm:order-1 px-8 py-4 text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 order-1 sm:order-2 px-8 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Preparing...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Continue to Confirmation
                  </>
                )}
              </Button>
            </div>
          </form>
          ) : (
            /* Confirmation View */
            <div className="space-y-8">
              {/* Interview Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  Interview Summary
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-white/70 rounded-xl p-4">
                      <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Date</label>
                      <p className="text-lg text-blue-900 font-bold mt-1">{formatDate(formData.scheduledDate)}</p>
                    </div>

                    <div className="bg-white/70 rounded-xl p-4">
                      <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Time</label>
                      <p className="text-lg text-blue-900 font-bold mt-1">{formatTime(formData.scheduledTime)}</p>
                    </div>

                    <div className="bg-white/70 rounded-xl p-4">
                      <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Duration</label>
                      <p className="text-lg text-blue-900 font-bold mt-1">{formData.duration} minutes</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white/70 rounded-xl p-4">
                      <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Interview Type</label>
                      <div className="flex items-center gap-3 mt-1">
                        {getTypeIcon(formData.type)}
                        <p className="text-lg text-blue-900 font-bold">{getTypeLabel(formData.type)}</p>
                      </div>
                    </div>

                    {formData.location && (
                      <div className="bg-white/70 rounded-xl p-4">
                        <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Location</label>
                        <p className="text-base text-blue-900 font-semibold break-words mt-1">{formData.location}</p>
                      </div>
                    )}

                    {formData.notes && (
                      <div className="bg-white/70 rounded-xl p-4">
                        <label className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Notes</label>
                        <p className="text-base text-blue-900 break-words mt-1">{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* What happens next */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  What happens next?
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 bg-white/70 rounded-xl p-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-green-900 font-medium">Interview will be saved to your calendar</span>
                  </li>
                  <li className="flex items-start gap-4 bg-white/70 rounded-xl p-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-green-900 font-medium">Candidate will receive an email notification with interview details</span>
                  </li>
                  <li className="flex items-start gap-4 bg-white/70 rounded-xl p-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-green-900 font-medium">A message will be sent to the candidate through the messaging system</span>
                  </li>
                  <li className="flex items-start gap-4 bg-white/70 rounded-xl p-4">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <span className="text-green-900 font-medium">You can manage this interview from the Interview Management page</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-8 border-t-2 border-gray-200 mt-8">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleBackToForm}
                  disabled={isConfirming}
                  className="flex items-center justify-center gap-2 order-3 sm:order-1 px-6 py-4 text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                >
                  ← Back to Edit
                </Button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 order-1 sm:order-2">
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={onClose}
                    disabled={isConfirming}
                    className="order-2 sm:order-1 px-8 py-4 text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleConfirmSchedule}
                    disabled={isConfirming}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 order-1 sm:order-2 px-8 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  >
                    {isConfirming ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Confirming...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Confirm Schedule Interview
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSchedulingModal;
