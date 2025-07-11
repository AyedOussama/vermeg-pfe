package com.PFE2025.user_service.model;

import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * Entité représentant le profil complet d'un CEO.
 * Contient les données de base de l'utilisateur plus des champs spécifiques au rôle.
 * Utilisée uniquement pour les utilisateurs de type CEO.
 * 
 * NOTE: Le CEO n'a pas de département car il supervise toute l'organisation.
 */
@Document(collection = "ceo_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CeoProfile extends BaseEntity {

    @Id
    private String id;

    @Indexed(unique = true)
    private String keycloakId;

    // === DONNÉES DE BASE (comme dans GET /profile/me) ===
    private String firstName;
    private String lastName;
    private String fullName;
    @Indexed
    private String email;
    private List<String> roles;
    private String userType;
    private String status;
    private String location;
    private String phone;

    
    
    /**
     * Calcule automatiquement le fullName à partir du firstName et lastName
     */
    public void updateFullName() {
        if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        }
    }

    /**
     * Vérifie si le profil est enrichi avec les données de base
     */
    public boolean isEnriched() {
        return getFirstName() != null && getLastName() != null && getEmail() != null;
    }
}
