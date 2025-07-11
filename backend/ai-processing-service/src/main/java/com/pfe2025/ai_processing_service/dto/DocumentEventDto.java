package com.pfe2025.ai_processing_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO pour l'événement de document consommé depuis la queue document-events.
 * Correspond au message publié par le document-management-service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEventDto {
    private Long documentId;           // ID du document en base de données
    private String keycloakId;         // ID Keycloak du candidat (pas candidateId)
    private String documentType;       // "CV", "COVER_LETTER", etc.
    private String filePath;           // Chemin complet dans MinIO
    private String contentType;        // Type MIME (application/pdf, etc.)
    private LocalDateTime timestamp;   // Timestamp de l'événement
}