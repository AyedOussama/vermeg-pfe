package com.pfe2025.ai_processing_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * DTO pour la requête vers l'API Together AI.
 */
@Data
@Builder
public class TogetherAiRequest {
    private String model;
    private List<Message> messages;
    private Integer max_tokens; // Nom avec underscore comme dans l'API
    private Double temperature;
    // Ajouter 'response_format' si on veut forcer une réponse JSON (si supporté par le modèle)
    // private ResponseFormat response_format;

    @Data
    @Builder
    public static class Message {
        private String role; // "system", "user", "assistant"
        private String content;
    }


}

