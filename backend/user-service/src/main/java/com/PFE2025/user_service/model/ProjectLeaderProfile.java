package com.PFE2025.user_service.model;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Entité représentant le profil complet d'un Project Leader.
 * Contient les données de base de l'utilisateur plus des champs spécifiques au rôle.
 * Utilisée uniquement pour les utilisateurs de type PROJECT_LEADER.
 */
@Document(collection = "project_leader_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProjectLeaderProfile extends BaseEntity {

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

    // === CHAMPS SPÉCIFIQUES PROJECT LEADER ===
    private String department;
    private Integer teamSize; // Nombre de personnes dans l'équipe
    private List<String> projectsManaged; // Projets gérés
    private List<String> specializations; // Spécialisations techniques
    private ManagementLevel managementLevel; // Niveau de management
    private Integer yearsOfExperience;
    private List<String> certifications;
    private Double budgetResponsibility; // Montant du budget géré
    private Integer currentProjects; // Nombre de projets actuels
    private Integer completedProjects; // Nombre de projets terminés

    // === ENUM POUR NIVEAU DE MANAGEMENT ===
    public enum ManagementLevel {
        JUNIOR,
        SENIOR,
        LEAD,
        DIRECTOR
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
        return department != null && managementLevel != null;
    }
}
