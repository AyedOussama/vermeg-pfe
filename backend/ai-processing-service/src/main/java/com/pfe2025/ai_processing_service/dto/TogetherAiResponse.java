package com.pfe2025.ai_processing_service.dto;



import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * DTO pour la réponse de l'API Together AI.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true) // Très important car l'API peut ajouter des champs
public class TogetherAiResponse {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;
    // Ajouter un champ 'error' si l'API peut retourner des erreurs structurées
    //private ApiError error;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {
        private int index;
        private Message message;
        private String finish_reason; // ex: "stop", "length"
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String role; // Devrait être "assistant"
        private String content; // Le contenu JSON généré par l'IA sera ici
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Usage {
        private int prompt_tokens;
        private int completion_tokens;
        private int total_tokens;
    }


}