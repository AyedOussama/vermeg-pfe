package com.PFE2025.user_service.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Classe représentant une erreur API standardisée.
 * Utilisée pour les réponses d'erreur dans la documentation Swagger.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private String error;
    private String message;
    private String field;
    private Object value;
    private LocalDateTime timestamp;
    private String path;
    private int status;
}
