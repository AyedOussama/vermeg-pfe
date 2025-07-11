package com.pfe2025.interview_service.dto;

import com.pfe2025.interview_service.model.InterviewFeedback;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTOs for Interview Feedback operations.
 */
public class FeedbackDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitFeedbackRequest {
        @NotNull
        @Min(1)
        @Max(5)
        private Integer technicalScore;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer culturalScore;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer communicationScore;

        private String technicalComments;
        private String culturalComments;
        private String communicationComments;
        private String generalComments;

        @NotNull
        private InterviewFeedback.FeedbackRecommendation recommendation;

        private String recommendationReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackResponse {
        private Long id;
        private String evaluatorId;
        private String evaluatorName;
        private Integer technicalScore;
        private Integer culturalScore;
        private Integer communicationScore;
        private String technicalComments;
        private String culturalComments;
        private String communicationComments;
        private String generalComments;
        private InterviewFeedback.FeedbackRecommendation feedbackRecommendation;
        private String recommendationReason;
        private Boolean hasSubmitted;
        private java.time.LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackSummary {
        private Double averageTechnicalScore;
        private Double averageCulturalScore;
        private Double averageCommunicationScore;
        private Double overallAverage;
        private java.util.Map<InterviewFeedback.FeedbackRecommendation, Long> recommendations;
        private InterviewFeedback.FeedbackRecommendation finalRecommendation;
        private String summary;
    }
}