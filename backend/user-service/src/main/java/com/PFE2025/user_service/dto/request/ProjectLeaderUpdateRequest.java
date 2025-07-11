package com.PFE2025.user_service.dto.request;

import com.PFE2025.user_service.model.ProjectLeaderProfile;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO pour la mise à jour d'un profil Project Leader.
 * Tous les champs sont optionnels pour permettre des mises à jour partielles.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requête de mise à jour d'un profil Project Leader")
public class ProjectLeaderUpdateRequest {

    // === DONNÉES DE BASE UTILISATEUR ===
    
    @Size(max = 100, message = "Le prénom ne peut pas dépasser 100 caractères")
    @Schema(description = "Prénom", example = "John")
    private String firstName;

    @Size(max = 100, message = "Le nom de famille ne peut pas dépasser 100 caractères")
    @Schema(description = "Nom de famille", example = "Doe")
    private String lastName;

    @Email(message = "Format d'email invalide")
    @Schema(description = "Adresse email", example = "john.doe@vermeg.com")
    private String email;

    @Pattern(regexp = "^\\+?[0-9\\s()-]{8,20}$", message = "Format de téléphone invalide")
    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    @Size(max = 100, message = "La localisation ne peut pas dépasser 100 caractères")
    @Schema(description = "Localisation/Ville", example = "Paris, France")
    private String location;

    // === CHAMPS SPÉCIFIQUES PROJECT LEADER ===

    @Size(max = 100, message = "Le département ne peut pas dépasser 100 caractères")
    @Schema(description = "Département", example = "IT Development")
    private String department;

    @Min(value = 1, message = "La taille de l'équipe doit être d'au moins 1")
    @Max(value = 1000, message = "La taille de l'équipe ne peut pas dépasser 1000")
    @Schema(description = "Nombre de personnes dans l'équipe", example = "10")
    private Integer teamSize;

    @Schema(description = "Liste des projets gérés", example = "[\"Projet Alpha\", \"Projet Beta\", \"Projet Gamma\"]")
    private List<String> projectsManaged;

    @Schema(description = "Spécialisations techniques", example = "[\"Java\", \"Spring Boot\", \"Microservices\", \"Docker\"]")
    private List<String> specializations;

    @Schema(description = "Niveau de management", example = "LEAD")
    private ProjectLeaderProfile.ManagementLevel managementLevel;

    @Min(value = 0, message = "L'expérience ne peut pas être négative")
    @Max(value = 50, message = "L'expérience ne peut pas dépasser 50 ans")
    @Schema(description = "Années d'expérience", example = "12")
    private Integer yearsOfExperience;

    @Schema(description = "Certifications professionnelles", example = "[\"PMP\", \"Scrum Master\", \"AWS Certified\", \"Azure Certified\"]")
    private List<String> certifications;

    @DecimalMin(value = "0.0", message = "Le budget ne peut pas être négatif")
    @Schema(description = "Montant du budget géré (en euros)", example = "750000.0")
    private Double budgetResponsibility;

    @Min(value = 0, message = "Le nombre de projets actuels ne peut pas être négatif")
    @Schema(description = "Nombre de projets actuels", example = "4")
    private Integer currentProjects;

    @Min(value = 0, message = "Le nombre de projets terminés ne peut pas être négatif")
    @Schema(description = "Nombre de projets terminés", example = "20")
    private Integer completedProjects;
}
