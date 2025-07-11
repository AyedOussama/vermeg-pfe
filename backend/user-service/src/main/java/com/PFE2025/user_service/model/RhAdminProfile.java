package com.PFE2025.user_service.model;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Entité représentant le profil complet d'un RH Admin.
 * Contient les données de base de l'utilisateur plus des champs spécifiques au rôle.
 * Utilisée uniquement pour les utilisateurs de type RH_ADMIN.
 */
@Document(collection = "rh_admin_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RhAdminProfile extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String keycloakId; // Lien avec l'utilisateur Keycloak

    // === DONNÉES DE BASE (comme dans GET /profile/me) ===
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private List<String> roles;
    private String userType;
    private String status;
    private String location;
    private String phone;

    // === CHAMPS SPÉCIFIQUES RH ADMIN ===
    private String department;
    private List<String> hrSpecializations; // Recrutement, formation, paie, etc.
    private Integer recruitmentExperience; // Années d'expérience en recrutement
    private List<String> companiesWorked; // Entreprises précédentes
    private List<String> certifications;
    private List<String> languages;
    private AccessLevel accessLevel; // Niveau d'accès
    private List<String> responsibleFor; // Départements sous responsabilité
    private Integer employeesManaged; // Nombre d'employés gérés
    private Integer recruitmentQuota; // Objectif de recrutement annuel

    // === ENUM POUR NIVEAU D'ACCÈS ===
    public enum AccessLevel {
        REGIONAL,
        NATIONAL,
        INTERNATIONAL
    }

    // === MÉTHODES UTILITAIRES ===
    
    /**
     * Calcule automatiquement le fullName à partir du firstName et lastName
     */
    public void updateFullName() {
        if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        }
    }

    /**
     * Vérifie si le profil est enrichi avec les données spécifiques
     */
    public boolean isEnriched() {
        return department != null && hrSpecializations != null && !hrSpecializations.isEmpty();
    }

    /**
     * Calcule le score d'expérience basé sur les années et les entreprises
     */
    public int calculateExperienceScore() {
        int score = 0;
        if (recruitmentExperience != null) {
            score += Math.min(recruitmentExperience * 10, 50); // Max 50 points pour l'expérience
        }
        if (companiesWorked != null) {
            score += Math.min(companiesWorked.size() * 5, 25); // Max 25 points pour la diversité
        }
        return Math.min(score, 100);
    }
}
