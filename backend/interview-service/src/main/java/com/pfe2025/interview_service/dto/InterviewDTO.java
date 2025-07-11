package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.Interview;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for Interview operations.
 */
public class InterviewDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Application ID is required")
        private Long applicationId;

        @NotNull(message = "Interview type is required")
        private Interview.InterviewType type;

        private String description;
        private List<String> interviewerIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Interview.InterviewType type;
        private String description;
        private List<String> interviewerIds;
        private String location;
        private String meetingLink;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetailResponse {
        private Long id;
        private Long applicationId;
        private String applicationReference;
        private String candidateId;
        private String candidateName;
        private Long jobPostingId;
        private String jobTitle;
        private String jobDepartment;
        private Interview.InterviewStatus currentStatus;
        private Interview.InterviewType type;
        private String description;
        private LocalDateTime scheduleDate;
        private String format;
        private String location;
        private String meetingLink;
        private List<InterviewSlotDTO.SlotResponse> slots;
        private List<ParticipantDTO.ParticipantResponse> participants;
        private List<FeedbackDTO.FeedbackResponse> feedbacks;
        private Double overallScore;
        private String feedbackSummary;
        private Boolean isRecommended;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResponse {
        private Long id;
        private Long applicationId;
        private String applicationReference;
        private String candidateName;
        private String jobTitle;
        private Interview.InterviewStatus currentStatus;
        private Interview.InterviewType type;
        private LocalDateTime scheduleDate;
        private String format;
        private String location;
        private Boolean isRecommended;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateView {
        private Long id;
        private String applicationReference;
        private String jobTitle;
        private String jobDepartment;
        private Interview.InterviewStatus currentStatus;
        private Interview.InterviewType type;
        private String description;
        private LocalDateTime scheduleDate;
        private String format;
        private String location;
        private String meetingLink;
        private List<InterviewSlotDTO.SlotResponse> availableSlots;
        private LocalDateTime selectedSlotDate;
        private List<ParticipantDTO.ParticipantResponse> interviewers;
        private LocalDateTime createdAt;
        private String statusMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InternalResponse {
        private Long id;
        private Long applicationId;
        private String applicationReference;
        private String candidateId;
        private Interview.InterviewStatus status;
        private Interview.InterviewType type;
        private LocalDateTime scheduledAt;
        private Double overallScore;
        private Boolean isRecommended;
        private String feedbackSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InternalCreateRequest {
        @NotNull
        private Long applicationId;
        @NotNull
        private String applicationReference;
        @NotNull
        private String candidateId;
        @NotNull
        private String candidateName;
        @NotNull
        private Long jobPostingId;
        private String jobTitle;
        private String requestedBy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterviewStats {
        private Long totalInterviews;
        private Long upcomingInterviews;
        private Long completedInterviews;
        private Long canceledInterviews;
        private Double averageScore;
        private Double recommendationRate;
        private java.util.Map<String, Long> byStatus;
        private java.util.Map<String, Long> byType;
    }
}