package com.pfe2025.application_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.pfe2025.application_service.model.Evaluation.EvaluationRecommendation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO pour l'évaluation des candidatures.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EvaluationDTO {
    private Long id;
    private Double overallScore;
    private String justification;
    private Double technicalSkillScore;
    private Double experienceScore;
    private Double educationScore;
    private Double softSkillScore;
    private String strengths;
    private String weaknesses;
    private EvaluationRecommendation recommendation;
    private String modelUsed;
    private Boolean exceededAutoThreshold;
    private Map<String, Double> categoryScores;
    private LocalDateTime evaluatedAt;
}