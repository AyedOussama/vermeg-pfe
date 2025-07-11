package com.pfe2025.document_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
