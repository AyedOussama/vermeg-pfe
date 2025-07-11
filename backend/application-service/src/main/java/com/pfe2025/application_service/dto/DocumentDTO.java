package com.pfe2025.application_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour les documents associés aux candidatures.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private String filename;
    private String contentType;
    private String documentType;
    private LocalDateTime uploadedAt;
    private String previewUrl;
    private String downloadUrl;
}