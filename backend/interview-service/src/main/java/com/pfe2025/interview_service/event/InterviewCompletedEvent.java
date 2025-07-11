package com.pfe2025.interview_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Event emitted when an interview has been completed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewCompletedEvent {
    private Long interviewId;
    private Long applicationId;
    private String applicationReference;
    private Double overallScore;
    private Boolean isRecommended;
    private String feedback;
    private LocalDateTime completedAt;
}