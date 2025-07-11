package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Événement émis pour demander l'évaluation d'une candidature.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationEvaluationRequestedEvent {
    private Long applicationId;
    private String reference;
    private String candidateId;
    private Long jobPostingId;
    private Long resumeDocumentId;
    private Long coverLetterDocumentId;
    private String candidateName;
    private String jobTitle;
    private String jobDescription;
    private Map<String, Object> additionalContext;
    private LocalDateTime requestedAt;
}