package com.pfe2025.document_management_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDeleteResponse {
    private String message;
    private Long documentId;
    private boolean success;
}
