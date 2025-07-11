package com.pfe2025.interview_service.service;

import com.pfe2025.interview_service.dto.*;
import com.pfe2025.interview_service.event.*;
import com.pfe2025.interview_service.exception.InvalidOperationException;
import com.pfe2025.interview_service.exception.ResourceNotFoundException;
import com.pfe2025.interview_service.integration.ApplicationServiceClient;
import com.pfe2025.interview_service.mapper.InterviewMapper;
import com.pfe2025.interview_service.model.Interview;
import com.pfe2025.interview_service.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for managing interviews.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewMapper interviewMapper;
    private final StreamBridge streamBridge;
    private final ApplicationServiceClient applicationServiceClient;
    private final SlotManagementService slotManagementService;
    private final FeedbackService feedbackService;
    private final GoogleCalendarService googleCalendarService;

    @Transactional
    public InterviewDTO.DetailResponse createInterview(InterviewDTO.CreateRequest request) {
        log.debug("Creating interview for application: {}", request.getApplicationId());

        // Check if interview already exists for this application
        interviewRepository.findByApplicationId(request.getApplicationId())
                .ifPresent(existing -> {
                    throw new InvalidOperationException("Interview already exists for this application");
                });

        // Create interview entity
        Interview interview = Interview.builder()
                .applicationId(request.getApplicationId())
                .applicationReference("REF-" + request.getApplicationId()) // Should get from application service
                .candidateId("dummy-candidate-id") // Should get from application service
                .candidateName("Candidate Name") // Should get from application service
                .jobPostingId(1L) // Should get from application service
                .jobTitle("Job Title") // Should get from application service
                .status(Interview.InterviewStatus.REQUESTED)
                .type(request.getType())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .createdBy("HR") // Should get from security context
                .build();

        interview = interviewRepository.save(interview);

        // Publish event
        InterviewRequestedEvent event = InterviewRequestedEvent.builder()
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .candidateId(interview.getCandidateId())
                .candidateName(interview.getCandidateName())
                .jobPostingId(interview.getJobPostingId())
                .jobTitle(interview.getJobTitle())
                .requestedAt(LocalDateTime.now())
                .build();

        streamBridge.send("interviewRequestedSupplier-out-0", event);

        return interviewMapper.toDetailResponse(interview);
    }

    @Transactional
    public void processInterviewRequested(InterviewRequestedEvent event) {
        log.debug("Processing interview requested event for application: {}", event.getApplicationId());

        // Create interview from event
        Interview interview = interviewMapper.fromEvent(event);
        interview = interviewRepository.save(interview);

        // Update status to SLOTS_PROPOSED will be done when slots are proposed
        log.info("Interview created with ID: {} for application: {}", interview.getId(), event.getApplicationId());
    }

    @Transactional
    public InterviewDTO.DetailResponse updateInterview(Long id, InterviewDTO.UpdateRequest request) {
        log.debug("Updating interview: {}", id);

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        interviewMapper.updateFromDto(request, interview);
        interview.setUpdatedAt(LocalDateTime.now());
        interview = interviewRepository.save(interview);

        return interviewMapper.toDetailResponse(interview);
    }

    @Transactional
    public InterviewDTO.DetailResponse cancelInterview(Long id, String reason) {
        log.debug("Canceling interview: {}", id);

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        // Cancel all proposed and selected slots
        slotManagementService.cancelAllSlots(id, reason);

        // Update interview status
        interview.setStatus(Interview.InterviewStatus.CANCELED);
        interview.setCancellationReason(reason);
        interview.setCanceledAt(LocalDateTime.now());
        interview.setCanceledBy("HR");
        interview = interviewRepository.save(interview);

        // Cancel in Google Calendar
        if (interview.getGoogleCalendarEventId() != null) {
            try {
                googleCalendarService.cancelCalendarEvent(interview.getGoogleCalendarEventId(), "HR");
            } catch (Exception e) {
                log.error("Failed to cancel Google Calendar event: {}", e.getMessage());
            }
        }

        // Publish event
        InterviewCanceledEvent event = InterviewCanceledEvent.builder()
                .interviewId(interview.getId())
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .reason(reason)
                .canceledBy("HR")
                .canceledAt(LocalDateTime.now())
                .build();

        streamBridge.send("interviewCanceledSupplier-out-0", event);

        // Update application status
        applicationServiceClient.updateInterviewStatus(interview.getApplicationId(),
                interview.getId(), "CANCELED").subscribe();

        return interviewMapper.toDetailResponse(interview);
    }

    @Transactional
    public InterviewDTO.DetailResponse completeInterview(Long id) {
        log.debug("Completing interview: {}", id);

        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (interview.getStatus() != Interview.InterviewStatus.SCHEDULED) {
            throw new InvalidOperationException("Interview must be scheduled to complete");
        }

        // Calculate overall feedback
        FeedbackDTO.FeedbackSummary feedbackSummary = feedbackService.calculateFeedbackSummary(id);

        interview.setStatus(Interview.InterviewStatus.COMPLETED);
        interview.setCompletedAt(LocalDateTime.now());
        interview.setOverallScore(feedbackSummary.getOverallAverage());
        interview.setIsRecommended(feedbackSummary.getFinalRecommendation() ==
                com.pfe2025.interview_service.model.InterviewFeedback.FeedbackRecommendation.HIRE);
        interview.setFeedbackSummary(feedbackSummary.getSummary());
        interview = interviewRepository.save(interview);

        // Publish event
        InterviewCompletedEvent event = InterviewCompletedEvent.builder()
                .interviewId(interview.getId())
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .overallScore(interview.getOverallScore())
                .isRecommended(interview.getIsRecommended())
                .feedback(interview.getFeedbackSummary())
                .completedAt(interview.getCompletedAt())
                .build();

        streamBridge.send("interviewCompletedSupplier-out-0", event);

        // Update application status
        String newStatus = interview.getIsRecommended() ? "INTERVIEW_SUCCESSFUL" : "INTERVIEW_FAILED";
        applicationServiceClient.updateInterviewStatus(interview.getApplicationId(),
                interview.getId(), newStatus).subscribe();

        return interviewMapper.toDetailResponse(interview);
    }

    @Transactional(readOnly = true)
    public InterviewDTO.DetailResponse getInterviewDetails(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        return interviewMapper.toDetailResponse(interview);
    }

    @Transactional(readOnly = true)
    public Page<InterviewDTO.SummaryResponse> getAllInterviews(Pageable pageable) {
        Page<Interview> interviews = interviewRepository.findAll(pageable);
        return interviews.map(interviewMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public Page<InterviewDTO.CandidateView> getCandidateInterviews(Pageable pageable) {
        // Get current candidate ID from security context
        String candidateId = getCurrentCandidateId();
        Page<Interview> interviews = interviewRepository.findByCandidateId(candidateId, pageable);
        return interviews.map(this::toCandidateView);
    }

    @Transactional(readOnly = true)
    public InterviewDTO.CandidateView getCandidateInterviewDetails(Long id) {
        String candidateId = getCurrentCandidateId();
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getCandidateId().equals(candidateId)) {
            throw new InvalidOperationException("Interview not found for this candidate");
        }

        return toCandidateView(interview);
    }

    @Transactional
    public InterviewDTO.CandidateView candidateCancelInterview(Long id, String reason) {
        String candidateId = getCurrentCandidateId();
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getCandidateId().equals(candidateId)) {
            throw new InvalidOperationException("Interview not found for this candidate");
        }

        if (interview.getStatus() != Interview.InterviewStatus.SCHEDULED &&
                interview.getStatus() != Interview.InterviewStatus.SLOT_SELECTED) {
            throw new InvalidOperationException("Cannot cancel interview in current status");
        }

        // Cancel the interview
        interview.setStatus(Interview.InterviewStatus.CANCELED);
        interview.setCancellationReason(reason);
        interview.setCanceledAt(LocalDateTime.now());
        interview.setCanceledBy("CANDIDATE");
        interview = interviewRepository.save(interview);

        // Cancel in Google Calendar
        if (interview.getGoogleCalendarEventId() != null) {
            try {
                googleCalendarService.cancelCalendarEvent(interview.getGoogleCalendarEventId(), candidateId);
            } catch (Exception e) {
                log.error("Failed to cancel Google Calendar event: {}", e.getMessage());
            }
        }

        // Publish event
        InterviewCanceledEvent event = InterviewCanceledEvent.builder()
                .interviewId(interview.getId())
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .reason(reason)
                .canceledBy("CANDIDATE")
                .canceledAt(LocalDateTime.now())
                .build();

        streamBridge.send("interviewCanceledSupplier-out-0", event);

        // Update application status
        applicationServiceClient.updateInterviewStatus(interview.getApplicationId(),
                interview.getId(), "CANCELED").subscribe();

        return toCandidateView(interview);
    }

    @Transactional
    public InterviewDTO.CandidateView requestReschedule(Long id, String reason) {
        String candidateId = getCurrentCandidateId();
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (!interview.getCandidateId().equals(candidateId)) {
            throw new InvalidOperationException("Interview not found for this candidate");
        }

        // Implementation for reschedule request
        // This would typically involve creating a reschedule request record
        // and notifying HR

        return toCandidateView(interview);
    }

    @Transactional(readOnly = true)
    public Page<InterviewDTO.SummaryResponse> searchInterviews(SearchCriteriaDTO criteria, Pageable pageable) {
        Specification<Interview> spec = buildSearchSpecification(criteria);
        Page<Interview> interviews = interviewRepository.findAll(spec, pageable);
        return interviews.map(interviewMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public InterviewDTO.InterviewStats getInterviewStatistics() {
        log.debug("Calculating interview statistics");

        // Implement statistics calculation
        long totalInterviews = interviewRepository.count();
        long upcomingInterviews = interviewRepository.countByStatus(Interview.InterviewStatus.SCHEDULED);
        long completedInterviews = interviewRepository.countByStatus(Interview.InterviewStatus.COMPLETED);
        long canceledInterviews = interviewRepository.countByStatus(Interview.InterviewStatus.CANCELED);

        // Build status counts
        Map<String, Long> statusCounts = new HashMap<>();
        for (Interview.InterviewStatus status : Interview.InterviewStatus.values()) {
            statusCounts.put(status.name(), interviewRepository.countByStatus(status));
        }

        // Build type counts
        Map<String, Long> typeCounts = new HashMap<>();
        // Implement type counting

        return InterviewDTO.InterviewStats.builder()
                .totalInterviews(totalInterviews)
                .upcomingInterviews(upcomingInterviews)
                .completedInterviews(completedInterviews)
                .canceledInterviews(canceledInterviews)
                .averageScore(0.0) // Calculate average score
                .recommendationRate(0.0) // Calculate recommendation rate
                .byStatus(statusCounts)
                .byType(typeCounts)
                .build();
    }

    // Internal service methods
    @Transactional(readOnly = true)
    public InterviewDTO.InternalResponse getInterviewForInternal(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        return InterviewDTO.InternalResponse.builder()
                .id(interview.getId())
                .applicationId(interview.getApplicationId())
                .applicationReference(interview.getApplicationReference())
                .candidateId(interview.getCandidateId())
                .status(interview.getStatus())
                .type(interview.getType())
                .scheduledAt(interview.getScheduledAt())
                .overallScore(interview.getOverallScore())
                .isRecommended(interview.getIsRecommended())
                .feedbackSummary(interview.getFeedbackSummary())
                .build();
    }

    @Transactional(readOnly = true)
    public InterviewDTO.InternalResponse getInterviewByApplication(Long applicationId) {
        Interview interview = interviewRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found for application"));

        return getInterviewForInternal(interview.getId());
    }

    @Transactional
    public InterviewDTO.InternalResponse createInterviewFromApplication(InterviewDTO.InternalCreateRequest request) {
        log.debug("Creating interview from application service for: {}", request.getApplicationId());

        Interview interview = Interview.builder()
                .applicationId(request.getApplicationId())
                .applicationReference(request.getApplicationReference())
                .candidateId(request.getCandidateId())
                .candidateName(request.getCandidateName())
                .jobPostingId(request.getJobPostingId())
                .jobTitle(request.getJobTitle())
                .status(Interview.InterviewStatus.REQUESTED)
                .type(Interview.InterviewType.TECHNICAL) // Default type
                .createdAt(LocalDateTime.now())
                .createdBy(request.getRequestedBy())
                .build();

        interview = interviewRepository.save(interview);
        return getInterviewForInternal(interview.getId());
    }

    @Transactional
    public InterviewDTO.InternalResponse updateInterviewStatusFromExternal(Long id, String status) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        try {
            Interview.InterviewStatus newStatus = Interview.InterviewStatus.valueOf(status);
            interview.setStatus(newStatus);
            interview.setUpdatedAt(LocalDateTime.now());
            interview = interviewRepository.save(interview);
        } catch (IllegalArgumentException e) {
            throw new InvalidOperationException("Invalid interview status: " + status);
        }

        return getInterviewForInternal(interview.getId());
    }

    // Helper methods
    private InterviewDTO.CandidateView toCandidateView(Interview interview) {
        // Convert to candidate view with appropriate fields
        return InterviewDTO.CandidateView.builder()
                .id(interview.getId())
                .applicationReference(interview.getApplicationReference())
                .jobTitle(interview.getJobTitle())
                .jobDepartment(interview.getJobDepartment())
                .currentStatus(interview.getStatus())
                .type(interview.getType())
                .description(interview.getDescription())
                .scheduleDate(interview.getScheduledAt())
                .format(interview.getFormat())
                .location(interview.getLocation())
                .meetingLink(interview.getMeetingLink())
                .createdAt(interview.getCreatedAt())
                .statusMessage(getStatusMessage(interview.getStatus()))
                .build();
    }

    private Specification<Interview> buildSearchSpecification(SearchCriteriaDTO criteria) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (criteria.getCandidateName() != null && !criteria.getCandidateName().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("candidateName")),
                        "%" + criteria.getCandidateName().toLowerCase() + "%"));
            }

            if (criteria.getJobTitle() != null && !criteria.getJobTitle().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("jobTitle")),
                        "%" + criteria.getJobTitle().toLowerCase() + "%"));
            }

            if (criteria.getDepartment() != null && !criteria.getDepartment().isEmpty()) {
                predicates.add(cb.equal(root.get("jobDepartment"), criteria.getDepartment()));
            }

            if (criteria.getStatuses() != null && !criteria.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(criteria.getStatuses()));
            }

            if (criteria.getTypes() != null && !criteria.getTypes().isEmpty()) {
                predicates.add(root.get("type").in(criteria.getTypes()));
            }

            if (criteria.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("scheduledAt"), criteria.getStartDate()));
            }

            if (criteria.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("scheduledAt"), criteria.getEndDate()));
            }

            if (criteria.getIsRecommended() != null) {
                predicates.add(cb.equal(root.get("isRecommended"), criteria.getIsRecommended()));
            }

            if (criteria.getMinScore() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("overallScore"), criteria.getMinScore()));
            }

            if (criteria.getMaxScore() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("overallScore"), criteria.getMaxScore()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private String getCurrentCandidateId() {
        // Get from security context
        return "current-candidate-id"; // Placeholder
    }

    private String getStatusMessage(Interview.InterviewStatus status) {
        return switch (status) {
            case REQUESTED -> "Votre entretien a été demandé par nos recruteurs";
            case SLOTS_PROPOSED -> "Des créneaux d'entretien vous ont été proposés";
            case SLOT_SELECTED -> "Vous avez sélectionné un créneau d'entretien";
            case SCHEDULED -> "Votre entretien est confirmé";
            case COMPLETED -> "Votre entretien a été complété";
            case CANCELED -> "Votre entretien a été annulé";
            case NO_SHOW -> "Vous n'êtes pas venu à votre entretien";
            default -> "";
        };
    }
}