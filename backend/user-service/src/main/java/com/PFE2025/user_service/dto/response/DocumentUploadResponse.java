package com.PFE2025.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour la réponse d'upload de document depuis document-management-service.
 * Structure identique à celle du document-service pour compatibilité.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadResponse {
    private Long documentId;
    private String message;
    private String documentType;
    private String fileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;
}
