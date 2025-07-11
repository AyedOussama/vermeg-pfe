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
 * Classes DTO pour les modèles d'offres d'emploi.
 */
public class PostingTemplateDTO {

    /**
     * DTO pour les requêtes de création ou mise à jour de modèle.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Données pour la création ou mise à jour d'un modèle d'offre")
    public static class Request {

        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 3, max = 100, message = "Le nom doit contenir entre 3 et 100 caractères")
        @Schema(description = "Nom du modèle", example = "Modèle Développeur IT")
        private String name;

        @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
        @Schema(description = "Description du modèle")
        private String description;

        @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
        @Schema(description = "Département associé au modèle", example = "IT")
        private String department;

        @NotNull(message = "La structure est obligatoire")
        @Schema(description = "Structure JSON définissant le format du modèle")
        private String structure;

        @Schema(description = "Indique si le modèle est actif", example = "true")
        private Boolean isActive;
    }

    /**
     * DTO pour les réponses contenant les détails complets d'un modèle.
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Détails complets d'un modèle d'offre")
    public static class Response {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Nom du modèle")
        private String name;

        @Schema(description = "Description du modèle")
        private String description;

        @Schema(description = "Département associé au modèle")
        private String department;

        @Schema(description = "Structure JSON définissant le format du modèle")
        private String structure;

        @Schema(description = "Indique si le modèle est actif")
        private Boolean isActive;

        @Schema(description = "Date de création")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @Schema(description = "Identifiant du créateur")
        private String createdBy;

        @Schema(description = "Date de dernière modification")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastModifiedAt;

        @Schema(description = "Version (pour le verrouillage optimiste)")
        private Integer version;
    }

    /**
     * DTO pour les résumés de modèles (utilisé dans les listes).
     */
    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Résumé d'un modèle d'offre pour les listings")
    public static class Summary {

        @Schema(description = "Identifiant unique")
        private Long id;

        @Schema(description = "Nom du modèle")
        private String name;

        @Schema(description = "Description du modèle")
        private String description;

        @Schema(description = "Département associé au modèle")
        private String department;

        @Schema(description = "Indique si le modèle est actif")
        private Boolean isActive;
    }
}
