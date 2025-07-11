package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Classes DTO pour l'assistance IA.
 */
public class AIAssistanceDTO {

    /**
     * DTO pour les requêtes d'amélioration de contenu par IA.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Requête pour l'amélioration de contenu par IA")
    public static class Request {

        @NotBlank(message = "Le contenu est obligatoire")
        @Size(min = 10, max = 5000, message = "Le contenu doit contenir entre 10 et 5000 caractères")
        @Schema(description = "Contenu à améliorer", example = "Description du poste à améliorer...")
        private String content;

        @NotBlank(message = "Le type d'amélioration est obligatoire")
        @Schema(description = "Type d'amélioration demandée",
                example = "IMPROVE_DESCRIPTION",
                allowableValues = {"IMPROVE_DESCRIPTION", "OPTIMIZE_TITLE", "SUGGEST_SKILLS", "ANALYZE_BIAS"})
        private String improvementType;

        @Schema(description = "Contexte supplémentaire pour l'IA")
        private String context;
    }

    /**
     * DTO pour les réponses d'amélioration de contenu par IA.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Réponse de l'amélioration de contenu par IA")
    public static class Response {

        @Schema(description = "Contenu original")
        private String originalContent;

        @Schema(description = "Contenu amélioré")
        private String improvedContent;

        @Schema(description = "Suggestions ou commentaires additionnels")
        private String suggestions;

        @Schema(description = "Score d'amélioration (si applicable)")
        private Double improvementScore;
    }
}
