package com.pfe2025.application_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Événement reçu lors d'une soumission de candidature externe.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationSubmittedEvent {
    private String candidateId;
    private Long jobPostingId;
    private Long resumeDocumentId;
    private Long coverLetterDocumentId;
    private Set<Long> additionalDocumentIds;
    private String candidateMessage;
    private LocalDateTime submittedAt;
    private String candidateName;
    private String jobTitle;
}