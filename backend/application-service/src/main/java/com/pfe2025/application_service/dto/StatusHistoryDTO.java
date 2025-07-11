package com.pfe2025.application_service.dto;

import com.pfe2025.application_service.model.Application.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour l'historique des changements de statut.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryDTO {
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private String changedBy;
    private String reason;
    private LocalDateTime changedAt;
    private Boolean isSystemChange;
    private Boolean isAutomaticDecision;
}