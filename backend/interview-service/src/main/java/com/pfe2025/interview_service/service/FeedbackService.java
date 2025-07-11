package com.pfe2025.interview_service.service;

import com.pfe2025.interview_service.dto.FeedbackDTO;
import com.pfe2025.interview_service.exception.InvalidOperationException;
import com.pfe2025.interview_service.exception.ResourceNotFoundException;
import com.pfe2025.interview_service.mapper.FeedbackMapper;
import com.pfe2025.interview_service.model.Interview;
import com.pfe2025.interview_service.model.InterviewFeedback;
import com.pfe2025.interview_service.repository.InterviewFeedbackRepository;
import com.pfe2025.interview_service.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing interview feedback.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    @Transactional
    public FeedbackDTO.FeedbackResponse submitFeedback(Long interviewId, FeedbackDTO.SubmitFeedbackRequest request) {
        log.debug("Submitting feedback for interview: {}", interviewId);

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found"));

        if (interview.getStatus() != Interview.InterviewStatus.SCHEDULED &&
                interview.getStatus() != Interview.InterviewStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot submit feedback for interview in current status");
        }

        // Check if feedback already exists
        String evaluatorId = getCurrentUserId();
        feedbackRepository.findByInterviewIdAndEvaluatorId(interviewId, evaluatorId)
                .ifPresent(existing -> {
                    throw new InvalidOperationException("Feedback already submitted for this interview");
                });

        // Create feedback
        InterviewFeedback feedback = feedbackMapper.fromRequest(request);
        feedback.setInterview(interview);
        feedback = feedbackRepository.save(feedback);

        return feedbackMapper.toResponse(feedback);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDTO.FeedbackResponse> getInterviewFeedback(Long interviewId) {
        List<InterviewFeedback> feedbacks = feedbackRepository.findByInterviewId(interviewId);
        return feedbacks.stream()
                .map(feedbackMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FeedbackDTO.FeedbackSummary calculateFeedbackSummary(Long interviewId) {
        log.debug("Calculating feedback summary for interview: {}", interviewId);

        List<InterviewFeedback> feedbacks = feedbackRepository.findSubmittedFeedbacksByInterviewId(interviewId);

        if (feedbacks.isEmpty()) {
            return FeedbackDTO.FeedbackSummary.builder()
                    .averageTechnicalScore(0.0)
                    .averageCulturalScore(0.0)
                    .averageCommunicationScore(0.0)
                    .overallAverage(0.0)
                    .recommendations(Map.of())
                    .finalRecommendation(InterviewFeedback.FeedbackRecommendation.ADDITIONAL_INTERVIEW)
                    .summary("No feedback submitted yet")
                    .build();
        }

        // Calculate averages
        double avgTechnical = feedbacks.stream()
                .mapToDouble(InterviewFeedback::getTechnicalScore)
                .average()
                .orElse(0.0);

        double avgCultural = feedbacks.stream()
                .mapToDouble(InterviewFeedback::getCulturalScore)
                .average()
                .orElse(0.0);

        double avgCommunication = feedbacks.stream()
                .mapToDouble(InterviewFeedback::getCommunicationScore)
                .average()
                .orElse(0.0);

        double overallAverage = (avgTechnical + avgCultural + avgCommunication) / 3.0;

        // Calculate recommendation distribution
        Map<InterviewFeedback.FeedbackRecommendation, Long> recommendations = feedbacks.stream()
                .collect(Collectors.groupingBy(
                        InterviewFeedback::getRecommendation,
                        Collectors.counting()
                ));

        // Determine final recommendation
        InterviewFeedback.FeedbackRecommendation finalRecommendation = determineFinalRecommendation(recommendations);

        // Build summary text
        String summary = buildFeedbackSummary(feedbacks, avgTechnical, avgCultural, avgCommunication);

        return FeedbackDTO.FeedbackSummary.builder()
                .averageTechnicalScore(avgTechnical)
                .averageCulturalScore(avgCultural)
                .averageCommunicationScore(avgCommunication)
                .overallAverage(overallAverage)
                .recommendations(recommendations)
                .finalRecommendation(finalRecommendation)
                .summary(summary)
                .build();
    }

    private InterviewFeedback.FeedbackRecommendation determineFinalRecommendation(
            Map<InterviewFeedback.FeedbackRecommendation, Long> recommendations) {

        // Simple majority rule with tiebreaker
        long hireCount = recommendations.getOrDefault(InterviewFeedback.FeedbackRecommendation.HIRE, 0L);
        long rejectCount = recommendations.getOrDefault(InterviewFeedback.FeedbackRecommendation.REJECT, 0L);
        long additionalCount = recommendations.getOrDefault(InterviewFeedback.FeedbackRecommendation.ADDITIONAL_INTERVIEW, 0L);
        long hireWithReservationsCount = recommendations.getOrDefault(InterviewFeedback.FeedbackRecommendation.HIRE_WITH_RESERVATIONS, 0L);

        if (hireCount > rejectCount && hireCount > additionalCount && hireCount > hireWithReservationsCount) {
            return InterviewFeedback.FeedbackRecommendation.HIRE;
        } else if (rejectCount > hireCount && rejectCount > additionalCount && rejectCount > hireWithReservationsCount) {
            return InterviewFeedback.FeedbackRecommendation.REJECT;
        } else if (hireWithReservationsCount > 0) {
            return InterviewFeedback.FeedbackRecommendation.HIRE_WITH_RESERVATIONS;
        } else {
            return InterviewFeedback.FeedbackRecommendation.ADDITIONAL_INTERVIEW;
        }
    }

    private String buildFeedbackSummary(List<InterviewFeedback> feedbacks,
                                        double avgTechnical, double avgCultural, double avgCommunication) {
        StringBuilder summary = new StringBuilder();

        summary.append(String.format("Based on %d feedback(s):\n\n", feedbacks.size()));
        summary.append(String.format("Technical Skills: %.1f/5\n", avgTechnical));
        summary.append(String.format("Cultural Fit: %.1f/5\n", avgCultural));
        summary.append(String.format("Communication: %.1f/5\n\n", avgCommunication));

        // Add strengths
        summary.append("Strengths: ");
        feedbacks.stream()
                .filter(f -> f.getTechnicalComments() != null && !f.getTechnicalComments().isEmpty())
                .map(InterviewFeedback::getTechnicalComments)
                .limit(2)
                .forEach(c -> summary.append(c).append("; "));

        summary.append("\n\n");

        // Add weaknesses/areas for improvement
        summary.append("Areas for improvement: ");
        feedbacks.stream()
                .filter(f -> f.getCommunicationComments() != null && !f.getCommunicationComments().isEmpty())
                .map(InterviewFeedback::getCommunicationComments)
                .limit(2)
                .forEach(c -> summary.append(c).append("; "));

        summary.append("\n\n");

        // Add summary conclusion
        summary.append("Conclusion: ");
        InterviewFeedback.FeedbackRecommendation finalRecommendation = determineFinalRecommendation(
                feedbacks.stream()
                        .collect(Collectors.groupingBy(InterviewFeedback::getRecommendation, Collectors.counting()))
        );

        switch (finalRecommendation) {
            case HIRE:
                summary.append("Recommended for hire based on strong overall performance.");
                break;
            case HIRE_WITH_RESERVATIONS:
                summary.append("Recommended for hire with some reservations. Consider additional training or support.");
                break;
            case REJECT:
                summary.append("Not recommended for this position at this time.");
                break;
            case ADDITIONAL_INTERVIEW:
                summary.append("Further assessment recommended before making a final decision.");
                break;
        }

        return summary.toString();
    }

    private String getCurrentUserId() {
        // Get from security context
        return "current-user-id"; // Placeholder
    }
}