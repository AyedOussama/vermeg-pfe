package com.pfe2025.application_service.event;

import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Événement reçu lorsqu'une évaluation de candidature est terminée.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationEvaluatedEvent {
    private Long applicationId;
    private String reference;
    private Double overallScore;
    private String justification;
    private Map<String, Double> categoryScores;
    private String strengths;
    private String weaknesses;
    private EvaluationRecommendation recommendation;
    private String modelUsed;
    private LocalDateTime evaluatedAt;
    private String rawResponse;
}