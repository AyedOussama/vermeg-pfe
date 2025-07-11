package com.PFE2025.user_service.dto.response;

import com.PFE2025.user_service.model.RhAdminProfile;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de réponse pour un profil RH Admin complet.
 * Contient toutes les données du profil pour l'affichage.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Profil complet d'un RH Admin")
public class RhAdminProfileResponse {

    // === DONNÉES DE BASE ===
    
    @Schema(description = "ID MongoDB du profil", example = "64a7b8c9d1e2f3a4b5c6d7e9")
    private String id;

    @Schema(description = "ID Keycloak de l'utilisateur", example = "123e4567-e89b-12d3-a456-426614174001")
    private String keycloakId;

    @Schema(description = "Prénom", example = "Marie")
    private String firstName;

    @Schema(description = "Nom de famille", example = "Martin")
    private String lastName;

    @Schema(description = "Nom complet (prénom + nom)", example = "Marie Martin")
    private String fullName;

    @Schema(description = "Adresse email", example = "marie.martin@vermeg.com")
    private String email;

    @Schema(description = "Rôles utilisateur", example = "[\"RH_ADMIN\"]")
    private List<String> roles;

    @Schema(description = "Type d'utilisateur", example = "INTERNAL")
    private String userType;

    @Schema(description = "Statut du compte", example = "ACTIVE")
    private String status;

    @Schema(description = "Localisation/Ville", example = "Lyon, France")
    private String location;

    @Schema(description = "Numéro de téléphone", example = "+33123456789")
    private String phone;

    // === CHAMPS SPÉCIFIQUES RH ADMIN ===

    @Schema(description = "Département RH", example = "Human Resources")
    private String department;

    @Schema(description = "Spécialisations RH", example = "[\"Recrutement\", \"Formation\", \"Gestion des talents\"]")
    private List<String> hrSpecializations;

    @Schema(description = "Années d'expérience en recrutement", example = "8")
    private Integer recruitmentExperience;

    @Schema(description = "Entreprises précédentes", example = "[\"Accenture\", \"Capgemini\", \"Sopra Steria\"]")
    private List<String> companiesWorked;

    @Schema(description = "Certifications RH", example = "[\"SHRM-CP\", \"PHR\", \"CIPD\"]")
    private List<String> certifications;

    @Schema(description = "Langues parlées", example = "[\"Français\", \"Anglais\", \"Espagnol\"]")
    private List<String> languages;

    @Schema(description = "Niveau d'accès", example = "NATIONAL")
    private RhAdminProfile.AccessLevel accessLevel;

    @Schema(description = "Départements sous responsabilité", example = "[\"IT\", \"Marketing\", \"Sales\"]")
    private List<String> responsibleFor;

    @Schema(description = "Nombre d'employés gérés", example = "150")
    private Integer employeesManaged;

    @Schema(description = "Objectif de recrutement annuel", example = "50")
    private Integer recruitmentQuota;

    // === MÉTADONNÉES ===

    @Schema(description = "Date de création du profil")
    private LocalDateTime createdAt;

    @Schema(description = "Date de dernière mise à jour")
    private LocalDateTime updatedAt;

    // === CHAMPS CALCULÉS ===

    @Schema(description = "Indique si le profil est enrichi avec les données spécifiques")
    private Boolean enriched;

    @Schema(description = "Score d'expérience calculé (basé sur années + entreprises)")
    private Integer experienceScore;

    @Schema(description = "Niveau d'expertise RH")
    private String expertiseLevel;

    @Schema(description = "Portée de responsabilité")
    private String responsibilityScope;

    /**
     * Calcule le score d'expérience basé sur les années et les entreprises
     */
    public void calculateExperienceScore() {
        int score = 0;
        if (recruitmentExperience != null) {
            score += Math.min(recruitmentExperience * 10, 50); // Max 50 points pour l'expérience
        }
        if (companiesWorked != null) {
            score += Math.min(companiesWorked.size() * 5, 25); // Max 25 points pour la diversité
        }
        if (certifications != null) {
            score += Math.min(certifications.size() * 5, 25); // Max 25 points pour les certifications
        }
        this.experienceScore = Math.min(score, 100);
    }

    /**
     * Détermine le niveau d'expertise basé sur l'expérience et les spécialisations
     */
    public void calculateExpertiseLevel() {
        if (recruitmentExperience == null || hrSpecializations == null) {
            this.expertiseLevel = "NON_DÉFINI";
            return;
        }

        int score = 0;
        if (recruitmentExperience >= 10) score += 3;
        else if (recruitmentExperience >= 5) score += 2;
        else if (recruitmentExperience >= 2) score += 1;

        if (hrSpecializations.size() >= 4) score += 2;
        else if (hrSpecializations.size() >= 2) score += 1;

        if (score >= 4) this.expertiseLevel = "EXPERT";
        else if (score >= 2) this.expertiseLevel = "CONFIRMÉ";
        else this.expertiseLevel = "JUNIOR";
    }

    /**
     * Détermine la portée de responsabilité basée sur les employés gérés et les départements
     */
    public void calculateResponsibilityScope() {
        if (employeesManaged == null && responsibleFor == null) {
            this.responsibilityScope = "NON_DÉFINI";
            return;
        }

        int score = 0;
        if (employeesManaged != null) {
            if (employeesManaged >= 500) score += 3;
            else if (employeesManaged >= 100) score += 2;
            else if (employeesManaged >= 20) score += 1;
        }

        if (responsibleFor != null) {
            if (responsibleFor.size() >= 5) score += 2;
            else if (responsibleFor.size() >= 2) score += 1;
        }

        if (score >= 4) this.responsibilityScope = "TRÈS_LARGE";
        else if (score >= 2) this.responsibilityScope = "LARGE";
        else if (score >= 1) this.responsibilityScope = "MOYENNE";
        else this.responsibilityScope = "LIMITÉE";
    }
}
