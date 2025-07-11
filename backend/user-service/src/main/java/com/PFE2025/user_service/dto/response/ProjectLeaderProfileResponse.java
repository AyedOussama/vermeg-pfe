package com.PFE2025.user_service.dto.response;

import com.PFE2025.user_service.model.ProjectLeaderProfile;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour un profil Project Leader complet.
 * Contient toutes les données du profil pour l'affichage.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Profil complet d'un Project Leader")
public class ProjectLeaderProfileResponse {

    // === DONNÉES DE BASE ===
    
    @Schema(description = "ID MongoDB du profil", example = "64a7b8c9d1e2f3a4b5c6d7e8")
    private String id;

    @Schema(description = "ID Keycloak de l'utilisateur", example = "123e4567-e89b-12d3-a456-426614174000")
    private String keycloakId;

    @Schema(description = "Prénom", example = "John")
    private String firstName;

    @Schema(description = "Nom de famille", example = "Doe")
    private String lastName;

    @Schema(description = "Nom complet (prénom + nom)", example = "John Doe")
    private String fullName;

    @Schema(description = "Adresse email", example = "john.doe@vermeg.com")
    private String email;

    @Schema(description = "Rôles utilisateur", example = "[\"PROJECT_LEADER\"]")
    private List<String> roles;

    @Schema(description = "Type d'utilisateur", example = "INTERNAL")
    private String userType;

    @Schema(description = "Statut du compte", example = "ACTIVE")
    private String status;

    @Schema(description = "Localisation/Ville", example = "Paris, France")
    private String location;

    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    // === CHAMPS SPÉCIFIQUES PROJECT LEADER ===

    @Schema(description = "Département", example = "IT Development")
    private String department;

    @Schema(description = "Nombre de personnes dans l'équipe", example = "8")
    private Integer teamSize;

    @Schema(description = "Liste des projets gérés", example = "[\"Projet Alpha\", \"Projet Beta\"]")
    private List<String> projectsManaged;

    @Schema(description = "Spécialisations techniques", example = "[\"Java\", \"Spring Boot\", \"Microservices\"]")
    private List<String> specializations;

    @Schema(description = "Niveau de management", example = "SENIOR")
    private ProjectLeaderProfile.ManagementLevel managementLevel;

    @Schema(description = "Années d'expérience", example = "10")
    private Integer yearsOfExperience;

    @Schema(description = "Certifications professionnelles", example = "[\"PMP\", \"Scrum Master\", \"AWS Certified\"]")
    private List<String> certifications;

    @Schema(description = "Montant du budget géré (en euros)", example = "500000.0")
    private Double budgetResponsibility;

    @Schema(description = "Nombre de projets actuels", example = "3")
    private Integer currentProjects;

    @Schema(description = "Nombre de projets terminés", example = "15")
    private Integer completedProjects;

    // === MÉTADONNÉES ===

    @Schema(description = "Date de création du profil")
    private LocalDateTime createdAt;

    @Schema(description = "Date de dernière mise à jour")
    private LocalDateTime updatedAt;

    // === CHAMPS CALCULÉS ===

    @Schema(description = "Indique si le profil est enrichi avec les données spécifiques")
    private Boolean enriched;

    @Schema(description = "Score d'expérience calculé (basé sur années + projets)")
    private Integer experienceScore;

    @Schema(description = "Niveau de responsabilité (basé sur budget et équipe)")
    private String responsibilityLevel;

    /**
     * Calcule le score d'expérience basé sur les années et les projets terminés
     */
    public void calculateExperienceScore() {
        int score = 0;
        if (yearsOfExperience != null) {
            score += Math.min(yearsOfExperience * 5, 50); // Max 50 points pour l'expérience
        }
        if (completedProjects != null) {
            score += Math.min(completedProjects * 2, 30); // Max 30 points pour les projets
        }
        if (certifications != null) {
            score += Math.min(certifications.size() * 5, 20); // Max 20 points pour les certifications
        }
        this.experienceScore = Math.min(score, 100);
    }

    /**
     * Détermine le niveau de responsabilité basé sur le budget et la taille de l'équipe
     */
    public void calculateResponsibilityLevel() {
        if (budgetResponsibility == null && teamSize == null) {
            this.responsibilityLevel = "NON_DÉFINI";
            return;
        }

        int score = 0;
        if (budgetResponsibility != null) {
            if (budgetResponsibility >= 1000000) score += 3;
            else if (budgetResponsibility >= 500000) score += 2;
            else if (budgetResponsibility >= 100000) score += 1;
        }
        
        if (teamSize != null) {
            if (teamSize >= 20) score += 3;
            else if (teamSize >= 10) score += 2;
            else if (teamSize >= 5) score += 1;
        }

        if (score >= 5) this.responsibilityLevel = "TRÈS_ÉLEVÉ";
        else if (score >= 3) this.responsibilityLevel = "ÉLEVÉ";
        else if (score >= 1) this.responsibilityLevel = "MOYEN";
        else this.responsibilityLevel = "FAIBLE";
    }
}
