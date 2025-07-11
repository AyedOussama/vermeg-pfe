package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement reçu lorsqu'un entretien est terminé.
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
    private Boolean isRecommended; // Recommandation générale
    private String feedback;       // Résumé du feedback
    private LocalDateTime completedAt;
}