package com.pfe2025.ai_processing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO pour l'événement d'erreur de traitement (optionnel).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingErrorEventDto {
    private Long documentId;
    private String keycloakId;        // ID Keycloak du candidat
    private String originalEventType; // ex: "document.cv.uploaded"
    private String errorMessage;
    // private String stackTrace; // Optionnel, potentiellement tronqué
    private LocalDateTime errorTimestamp;
    @Builder.Default
    private String eventType = "CV_PROCESSING_FAILED";
}
