package com.pfe2025.jobpostingservice.dto;



import com.fasterxml.jackson.annotation.JsonInclude;

import com.pfe2025.jobpostingservice.model.enums.EmploymentType;
import com.pfe2025.jobpostingservice.model.enums.PostingStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Set;

/**
 * DTO pour les critères de recherche d'offres d'emploi.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Critères de recherche d'offres d'emploi")
public class SearchCriteriaDTO {

    @Schema(description = "Terme de recherche (recherche dans le titre et la description)", example = "développeur")
    private String keyword;

    @Schema(description = "Département", example = "IT")
    private String department;

    @Schema(description = "Localisation", example = "Paris")
    private String location;

    @Schema(description = "Type de contrat")
    private EmploymentType employmentType;

    @Schema(description = "Statut de l'offre (pour les recherches internes)")
    private PostingStatus status;

    @Schema(description = "Liste des identifiants de compétences requises")
    private Set<String> skillNames;

    @Schema(description = "Expérience minimale requise (en années)")
    private Integer minExperience;

    @Schema(description = "Expérience maximale requise (en années)")
    private Integer maxExperience;

    @Schema(description = "Salaire minimum")
    private Double minSalary;

    @Schema(description = "Inclure uniquement les offres publiées")
    @Builder.Default
    private Boolean publishedOnly = true;
}
