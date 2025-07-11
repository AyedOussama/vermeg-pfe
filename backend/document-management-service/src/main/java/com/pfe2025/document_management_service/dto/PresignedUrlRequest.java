package com.pfe2025.document_management_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlRequest {
    @NotNull(message = "La méthode HTTP (GET ou PUT) est obligatoire")
    private HttpMethod method;
    private String contentType; // Pour PUT
    private Long expirationInSeconds; // Optionnel (défaut 1h)
    public enum HttpMethod { GET, PUT }
}
