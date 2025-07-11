package com.pfe2025.interview_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "interview_feedbacks")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedback extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false)
    @NotNull
    private String evaluatorId;

    @Column(nullable = false)
    @NotNull
    private String evaluatorName;

    @Column(nullable = false)
    @NotNull
    @Min(1)
    @Max(5)
    private Integer technicalScore;

    @Column(nullable = false)
    @NotNull
    @Min(1)
    @Max(5)
    private Integer culturalScore;

    @Column(nullable = false)
    @NotNull
    @Min(1)
    @Max(5)
    private Integer communicationScore;

    @Column(columnDefinition = "TEXT")
    private String technicalComments;

    @Column(columnDefinition = "TEXT")
    private String culturalComments;

    @Column(columnDefinition = "TEXT")
    private String communicationComments;

    @Column(columnDefinition = "TEXT")
    private String generalComments;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull
    private FeedbackRecommendation recommendation;

    @Column(columnDefinition = "TEXT")
    private String recommendationReason;

    private Boolean hasSubmitted;

    public enum FeedbackRecommendation {
        HIRE,
        REJECT,
        ADDITIONAL_INTERVIEW,
        HIRE_WITH_RESERVATIONS
    }
}