// DocumentDto.java
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
public class DocumentDto {
    private Long id;
    private String keycloakId;
    private String documentType;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}






