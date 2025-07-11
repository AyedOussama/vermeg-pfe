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
public class DocumentEventDto {
    private Long documentId;
    private String keycloakId;
    private String documentType;
    private String filePath;
    private String contentType;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
