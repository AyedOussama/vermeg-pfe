package com.pfe2025.application_service.event;

import com.pfe2025.application_service.model.Application.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Événement émis lors d'un changement de statut d'une candidature.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationStatusChangedEvent {
    private Long applicationId;
    private String reference;
    private String candidateId;
    private Long jobPostingId;
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private LocalDateTime changedAt;
    private String changedBy;
    private Boolean isSystemChange;
    private Boolean isAutomaticDecision;
    private String candidateName;
    private String jobTitle;
}