package com.pfe2025.jobpostingservice.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

/**
 * Classes DTO pour les fragments de contenu réutilisables.
 */
public class ContentFragmentDTO {

    /**
     * DTO pour les requêtes de création ou mise à jour de fragment.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Données pour la création ou mise à jour d'un fragment de contenu")
    public static class Request {

        @NotBlank(message = "La clé est obligatoire")
        @Size(min = 3, max = 100, message = "La clé doit contenir entre 3 et 100 caractères")
        @Schema(description = "Clé unique du fragment", example = "benefits.std")
        private String fragmentKey;

        @NotBlank(message = "Le contenu est obligatoire")
        @Size(min = 1, max = 5000, message = "Le contenu doit contenir entre 1 et 5000 caractères")
        @Schema(description = "Contenu textuel du fragment")
        private String content;

        @NotBlank(message = "Le type est obligatoire")
        @Size(min = 1, max = 50, message = "Le type doit contenir entre 1 et 50 caractères")
        @Schema(description = "Type de fragment", example = "BENEFIT")
        private String type;

        @Size(max = 10, message = "Le code de langue ne peut pas dépasser 10 caractères")
        @Schema(description = "Code de langue (ISO)", example = "fr")
        private String language;

        @Schema(description = "Indique si le fragment est actif", example = "true")
        private Boolean isActive;
    }

    /**
     * DTO pour les réponses contenant les détails complets d'un fragment.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Détails complets d'un fragment de contenu")
    public static class Response {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Clé unique du fragment")
        private String fragmentKey;

        @Schema(description = "Contenu textuel du fragment")
        private String content;

        @Schema(description = "Type de fragment")
        private String type;

        @Schema(description = "Code de langue (ISO)")
        private String language;

        @Schema(description = "Indique si le fragment est actif")
        private Boolean isActive;

        @Schema(description = "Date de création")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "Identifiant du créateur")
        private String createdBy;

        @Schema(description = "Date de dernière modification")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastModifiedAt;

        @Schema(description = "Identifiant du dernier modificateur")
        private String lastModifiedBy;
    }

    /**
     * DTO pour les résumés de fragments (utilisé dans les listes).
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Résumé d'un fragment de contenu pour les listings")
    public static class Summary {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Clé unique du fragment")
        private String fragmentKey;

        @Schema(description = "Type de fragment")
        private String type;

        @Schema(description = "Code de langue (ISO)")
        private String language;

        @Schema(description = "Indique si le fragment est actif")
        private Boolean isActive;
    }
}
