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
 * DTO pour les compétences requises d'une offre d'emploi.
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Compétence requise pour un poste")
public class JobPostingSkillDTO {

    @Schema(description = "Identifiant unique")
    private Long id;

    @NotBlank(message = "Le nom de la compétence est obligatoire")
    @Size(min = 1, max = 100, message = "Le nom de la compétence doit contenir entre 1 et 100 caractères")
    @Schema(description = "Nom de la compétence", example = "Java")
    private String name;

    @Schema(description = "Indique si la compétence est obligatoire", example = "true")
    private Boolean isRequired;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    @Schema(description = "Description détaillée de la compétence")
    private String description;

    @Size(max = 50, message = "Le niveau ne peut pas dépasser 50 caractères")
    @Schema(description = "Niveau requis pour la compétence", example = "Avancé")
    private String level;
}
